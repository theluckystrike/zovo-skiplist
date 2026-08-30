import Config from "./config";
import { setupTabUpdates } from "../maze-utils/src/tab-updates";
import {
    classifyLicenseResponse,
    isProLicenseResponse,
    shouldRefreshLicense,
} from "./skiplist/license";

declare const __SUPABASE_ANON_KEY__: string;

const VERIFY_URL =
    "https://zgubxqomnbmxgbdhvwja.supabase.co/functions/v1/verify-extension-license";
const LICENSE_RETRY_DELAY_MS = 15 * 60 * 1000;
let lastRefreshAttemptAt = 0;

function getLocal(defaults: Record<string, unknown>): Promise<Record<string, unknown>> {
    return new Promise((resolve) => chrome.storage.local.get(defaults, resolve));
}

function setLocal(values: Record<string, unknown>): Promise<void> {
    return new Promise((resolve) => chrome.storage.local.set(values, resolve));
}

async function refreshLicenseOnce(): Promise<void> {
    const local = await getLocal({
        slp_license_status: "free",
        slp_license_key: "",
        slp_license_verified_at: 0,
        slp_license_exp: 0,
    });
    if (!shouldRefreshLicense(local) || typeof local.slp_license_key !== "string") return;
    const now = Date.now();
    if (now - lastRefreshAttemptAt < LICENSE_RETRY_DELAY_MS) return;
    lastRefreshAttemptAt = now;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
        const response = await fetch(VERIFY_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                apikey: __SUPABASE_ANON_KEY__,
            },
            body: JSON.stringify({
                license_key: local.slp_license_key,
                extension: "skiplist",
            }),
            signal: controller.signal,
        });
        const data = await response.json() as Record<string, unknown>;
        const decision = classifyLicenseResponse(response.ok, response.status, data);
        if (decision === "entitle" && isProLicenseResponse(response.ok, data)) {
            await setLocal({
                slp_license_status: "pro",
                slp_license_verified_at: Date.now(),
                slp_license_exp: typeof data.exp === "number"
                    && Number.isFinite(data.exp)
                    && data.exp >= 0
                    ? data.exp
                    : 0,
            });
        } else if (decision === "deny") {
            await setLocal({
                slp_license_status: "free",
                slp_license_key: "",
                slp_license_verified_at: 0,
                slp_license_exp: 0,
            });
        }
    } catch {
        // Network, timeout, malformed JSON, and server failures preserve the
        // existing cache. Entitlement still expires at the fail-closed limit.
    } finally {
        clearTimeout(timer);
    }
}

let refreshInFlight: Promise<void> | null = null;

function maybeRefreshLicense(): Promise<void> {
    if (!refreshInFlight) {
        refreshInFlight = refreshLicenseOnce().finally(() => {
            refreshInFlight = null;
        });
    }
    return refreshInFlight;
}

const popupPort: Record<string, chrome.runtime.Port> = {};

setupTabUpdates(Config);

chrome.runtime.onMessage.addListener(function (request, sender, callback) {
    switch(request.message) {
        case "openConfig":
            chrome.tabs.create({url: chrome.runtime.getURL('options/options.html' + (request.hash ? '#' + request.hash : ''))});
            return false;
        case "openHelp":
            chrome.tabs.create({url: chrome.runtime.getURL('help/index.html')});
            return false;
        case "openPage":
            chrome.tabs.create({url: chrome.runtime.getURL(request.url)});
            return false;
        case "tabs": {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, tabs => {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    request.data,
                    (response) => {
                        // Opening the popup on a non-YouTube tab legitimately
                        // has no content-script receiver. Consume lastError so
                        // Chrome does not record an actionable runtime error.
                        void chrome.runtime.lastError;
                        callback(response);
                    }
                );
            });
            return true;
        }
        case "refreshLicense":
            void maybeRefreshLicense().then(() => callback());
            return true;
        case "time":
        case "infoUpdated":
        case "videoChanged":
            if (sender.tab) {
                try {
                    popupPort[sender.tab.id]?.postMessage(request);
                } catch (e) {
                    // This can happen if the popup is closed
                }
            }
            return false;
        default:
            return false;
	}
});

void maybeRefreshLicense();

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "popup") {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => {
            popupPort[tabs[0].id] = port;
        });
    }
});

// Open the local onboarding page only after a fresh installation.
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason !== "install") return;

    // This let's the config sync to run fully before checking.
    // This is required on Firefox
    setTimeout(() => {
        if (!Config.local.alreadyInstalled){
            //open up the install page
            chrome.tabs.create({url: chrome.runtime.getURL("/help/index.html")});
            Config.local.alreadyInstalled = true;

            // Don't show update notification
            Config.config.categoryPillUpdate = true;
        }

    }, 1500);
});
