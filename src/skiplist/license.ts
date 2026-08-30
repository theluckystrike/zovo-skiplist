// Copyright (C) 2026 Zovo.one contributors
// SPDX-License-Identifier: GPL-3.0-or-later

export const OFFLINE_GRACE_MS = 7 * 24 * 60 * 60 * 1000;
export const REFRESH_AFTER_MS = 6 * 24 * 60 * 60 * 1000;
export const PRO_TIERS = ["pro", "lifetime"] as const;

export interface LicenseState {
    slp_license_status?: unknown;
    slp_license_verified_at?: unknown;
    slp_license_exp?: unknown;
}

export function hasValidProLicense(state: LicenseState, now = Date.now()): boolean {
    const verifiedAt = Number(state.slp_license_verified_at);
    const rawExpiry = state.slp_license_exp;
    const expiry = Number(rawExpiry);
    const verificationIsFresh = Number.isFinite(verifiedAt)
        && verifiedAt > 0
        && verifiedAt <= now
        && now - verifiedAt <= OFFLINE_GRACE_MS;
    const expiryIsValid = rawExpiry === 0
        || rawExpiry === "0"
        || (Number.isFinite(expiry) && expiry >= now);

    return state.slp_license_status === "pro" && verificationIsFresh && expiryIsValid;
}

export function isProLicenseResponse(responseOk: boolean, data: unknown): boolean {
    if (!responseOk || !data || typeof data !== "object") return false;
    const record = data as Record<string, unknown>;
    return record.valid === true
        && PRO_TIERS.includes(record.tier as typeof PRO_TIERS[number]);
}

export type LicenseResponseDecision = "entitle" | "deny" | "unavailable";

export function classifyLicenseResponse(
    responseOk: boolean,
    status: number,
    data: unknown,
): LicenseResponseDecision {
    if (isProLicenseResponse(responseOk, data)) return "entitle";
    if (!data || typeof data !== "object") return "unavailable";

    const record = data as Record<string, unknown>;
    const authoritativeStatus = responseOk
        || status === 400
        || status === 401
        || status === 403
        || status === 404;
    return authoritativeStatus && record.valid === false
        ? "deny"
        : "unavailable";
}

export function shouldRefreshLicense(state: LicenseState, now = Date.now()): boolean {
    const verifiedAt = Number(state.slp_license_verified_at);
    return state.slp_license_status === "pro"
        && Number.isFinite(verifiedAt)
        && verifiedAt > 0
        && verifiedAt <= now
        && now - verifiedAt >= REFRESH_AFTER_MS;
}

export function isProfileEntitled(
    profileID: string,
    profiles: Record<string, unknown>,
    state: LicenseState,
    now = Date.now(),
): boolean {
    const firstProfileID = Object.keys(profiles || {}).sort()[0];
    return profileID === firstProfileID || hasValidProLicense(state, now);
}
