// Copyright (C) 2026 Zovo.one contributors
// SPDX-License-Identifier: GPL-3.0-or-later

export {};

type AnyRecord = Record<string, any>;

function element<T extends HTMLElement>(id: string): T {
    return document.getElementById(id) as T;
}

function storageGet(
    area: chrome.storage.StorageArea,
    defaults: AnyRecord,
): Promise<AnyRecord> {
    return new Promise((resolve) => area.get(defaults, resolve));
}

function storageSet(
    area: chrome.storage.StorageArea,
    values: AnyRecord,
): Promise<void> {
    return new Promise((resolve) => area.set(values, resolve));
}

function sendToActiveTab(data: AnyRecord): Promise<AnyRecord | undefined> {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ message: "tabs", data }, (response) => {
            void chrome.runtime.lastError;
            resolve(response);
        });
    });
}

function countBookmarks(collection: Record<string, unknown[]>): number {
    return Object.values(collection || {}).reduce(
        (sum, segments) => sum + (segments?.length || 0),
        0,
    );
}

function formatMinutes(minutes: number): string {
    if (minutes < 1) return `${Math.round(minutes * 60)} sec`;
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${Math.round(minutes % 60)}m`;
}

async function refreshPopup(): Promise<void> {
    const sync = await storageGet(chrome.storage.sync, {
        minutesSaved: 0,
        skipCount: 0,
        disableSkipping: false,
        defaultCategory: "intro",
    });
    const local = await storageGet(chrome.storage.local, {
        unsubmittedSegments: {},
        skipProfiles: {},
        skipProfileTemp: null,
    });

    element("savedTime").textContent = formatMinutes(
        Number(sync.minutesSaved) || 0,
    );
    element("savedDetail").textContent =
        `${Number(sync.skipCount) || 0} personal skips`;
    const bookmarkTotal = countBookmarks(local.unsubmittedSegments);
    element("bookmarkCount").textContent =
        `${bookmarkTotal} saved section${bookmarkTotal === 1 ? "" : "s"}`;
    element<HTMLInputElement>("masterToggle").checked = !sync.disableSkipping;
    element<HTMLSelectElement>("bookmarkCategory").value =
        sync.defaultCategory === "chooseACategory"
            ? "intro"
            : sync.defaultCategory;

    const select = element<HTMLSelectElement>("profileSelect");
    select.replaceChildren(new Option("Default", ""));
    for (const [id, profile] of Object.entries(
        local.skipProfiles as Record<string, AnyRecord>,
    )) {
        select.add(new Option(profile.name || "Untitled profile", id));
    }
    if (local.skipProfileTemp?.time > Date.now() - 60 * 60 * 1000)
        select.value = local.skipProfileTemp.configID;

    const info = await sendToActiveTab({
        message: "isInfoFound",
        updating: true,
    });
    element("videoStatus").textContent = info?.videoID
        ? `Ready on this video · ${bookmarkTotal} private mark${bookmarkTotal === 1 ? "" : "s"} total`
        : "Open a YouTube video to mark a section.";
}

document.addEventListener("DOMContentLoaded", () => {
    void refreshPopup();

    element<HTMLInputElement>("masterToggle").addEventListener(
        "change",
        async (event) => {
            await storageSet(chrome.storage.sync, {
                disableSkipping: !(event.target as HTMLInputElement).checked,
            });
        },
    );

    element<HTMLSelectElement>("bookmarkCategory").addEventListener(
        "change",
        async (event) => {
            await storageSet(chrome.storage.sync, {
                defaultCategory: (event.target as HTMLSelectElement).value,
            });
        },
    );

    element<HTMLButtonElement>("bookmarkButton").addEventListener(
        "click",
        async () => {
            const button = element<HTMLButtonElement>("bookmarkButton");
            const category =
                element<HTMLSelectElement>("bookmarkCategory").value;
            await storageSet(chrome.storage.sync, {
                defaultCategory: category,
            });
            const response = await sendToActiveTab({
                from: "popup",
                message: "sponsorStart",
            });
            if (!response) {
                element("videoStatus").textContent =
                    "No supported video found in the active tab.";
                return;
            }
            const creating = Boolean(response.creatingSegment);
            button.textContent = creating
                ? "Finish bookmark"
                : "Start another bookmark";
            element("videoStatus").textContent = creating
                ? "Start saved. Play to the end point."
                : "Bookmark saved on this device.";
            setTimeout(() => void refreshPopup(), 250);
        },
    );

    element<HTMLSelectElement>("profileSelect").addEventListener(
        "change",
        async (event) => {
            const configID = (event.target as HTMLSelectElement).value;
            await storageSet(chrome.storage.local, {
                skipProfileTemp: configID
                    ? { time: Date.now(), configID }
                    : null,
            });
        },
    );

    const openOptions = () => chrome.runtime.openOptionsPage();
    element("settingsButton").addEventListener("click", openOptions);
});
