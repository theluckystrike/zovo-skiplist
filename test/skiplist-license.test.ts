import {
    classifyLicenseResponse,
    hasValidProLicense,
    isProfileEntitled,
    isProLicenseResponse,
    OFFLINE_GRACE_MS,
    REFRESH_AFTER_MS,
    shouldRefreshLicense,
} from "../src/skiplist/license";

describe("SkipList license fail-closed rules", () => {
    const now = 1_800_000_000_000;

    test.each([
        [false, { valid: true, tier: "supporter" }],
        [true, { valid: false, tier: "supporter" }],
        [true, { valid: true, tier: "free" }],
        [true, { valid: true }],
        [true, { valid: true, tier: "" }],
        [true, null],
    ])("rejects non-entitling response %#", (ok, body) => {
        expect(isProLicenseResponse(ok, body)).toBe(false);
    });

    it("accepts only explicit contract tiers on a successful response", () => {
        expect(isProLicenseResponse(true, { valid: true, tier: "pro" })).toBe(true);
        expect(isProLicenseResponse(true, { valid: true, tier: "lifetime" })).toBe(true);
        expect(isProLicenseResponse(true, { valid: true, tier: "supporter" })).toBe(false);
    });

    it("distinguishes authoritative denial from verifier unavailability", () => {
        expect(classifyLicenseResponse(true, 200, { valid: false })).toBe("deny");
        expect(classifyLicenseResponse(false, 404, { valid: false })).toBe("deny");
        expect(classifyLicenseResponse(false, 429, { valid: false })).toBe("unavailable");
        expect(classifyLicenseResponse(false, 500, { valid: false })).toBe("unavailable");
        expect(classifyLicenseResponse(true, 200, { valid: true, tier: "supporter" })).toBe("unavailable");
        expect(classifyLicenseResponse(false, 500, null)).toBe("unavailable");
    });

    it("accepts a recent unexpired Pro cache", () => {
        expect(hasValidProLicense({
            slp_license_status: "pro",
            slp_license_verified_at: now - OFFLINE_GRACE_MS + 1,
            slp_license_exp: now + 1,
        }, now)).toBe(true);
    });

    it("accepts exp 0 through the exact seven-day boundary", () => {
        expect(hasValidProLicense({
            slp_license_status: "pro",
            slp_license_verified_at: now - OFFLINE_GRACE_MS,
            slp_license_exp: 0,
        }, now)).toBe(true);
        expect(hasValidProLicense({
            slp_license_status: "pro",
            slp_license_verified_at: now - OFFLINE_GRACE_MS - 1,
            slp_license_exp: 0,
        }, now)).toBe(false);
    });

    it("refreshes after six days and locks extra profiles when cache expires", () => {
        const profiles = { "profile-b": {}, "profile-a": {} };
        const fresh = {
            slp_license_status: "pro",
            slp_license_verified_at: now - REFRESH_AFTER_MS,
            slp_license_exp: 0,
        };
        expect(shouldRefreshLicense(fresh, now)).toBe(true);
        expect(isProfileEntitled("profile-b", profiles, fresh, now)).toBe(true);
        expect(isProfileEntitled("profile-a", profiles, {
            ...fresh,
            slp_license_verified_at: now - OFFLINE_GRACE_MS - 1,
        }, now)).toBe(true);
        expect(isProfileEntitled("profile-b", profiles, {
            ...fresh,
            slp_license_verified_at: now - OFFLINE_GRACE_MS - 1,
        }, now)).toBe(false);
    });

    test.each([
        { slp_license_status: "free", slp_license_verified_at: now, slp_license_exp: 0 },
        { slp_license_status: "pro", slp_license_verified_at: 0, slp_license_exp: 0 },
        { slp_license_status: "pro", slp_license_verified_at: now + 1, slp_license_exp: 0 },
        { slp_license_status: "pro", slp_license_verified_at: now - OFFLINE_GRACE_MS - 1, slp_license_exp: 0 },
        { slp_license_status: "pro", slp_license_verified_at: now, slp_license_exp: now - 1 },
        { slp_license_status: "pro", slp_license_verified_at: "bad", slp_license_exp: 0 },
        { slp_license_status: "pro", slp_license_verified_at: now, slp_license_exp: "bad" },
    ])("rejects invalid cache %#", (state) => {
        expect(hasValidProLicense(state, now)).toBe(false);
    });
});
