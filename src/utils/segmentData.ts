import { DataCache } from "../../maze-utils/src/cache";
import { SponsorTime, VideoID } from "../types";
import { serializeOrStringify } from "../../maze-utils/src/background-request-proxy";

const segmentDataCache = new DataCache<VideoID, SegmentResponse>(() => {
    return {
        segments: null,
        status: 200
    };
}, null, 5);

const pendingList: Record<VideoID, Promise<SegmentResponse>> = {};

export interface SegmentResponse {
    segments: SponsorTime[] | null;
    status: number | Error | string;
}

export async function getSegmentsForVideo(videoID: VideoID, ignoreCache: boolean): Promise<SegmentResponse> {
    if (!ignoreCache) {
        const cachedData = segmentDataCache.getFromCache(videoID);
        if (cachedData) {
            segmentDataCache.cacheUsed(videoID);
            return cachedData;
        }
    }

    if (pendingList[videoID]) {
        return await pendingList[videoID];
    }

    const pendingData = fetchSegmentsForVideo(videoID);
    pendingList[videoID] = pendingData;

    let result: Awaited<typeof pendingData>;
    try {
        result = await pendingData;
    } catch (e) {
        console.error("[SB] Caught error while fetching segments", e);
        return {
            segments: null,
            status: serializeOrStringify(e),
        }
    } finally {
        delete pendingList[videoID];
    }

    return result;
}

async function fetchSegmentsForVideo(videoID: VideoID): Promise<SegmentResponse> {
    segmentDataCache.setupCache(videoID);
    return {
        segments: null,
        status: 200
    };
}
