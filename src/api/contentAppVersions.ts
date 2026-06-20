import api from "./api";

export type ContentPlatform = "android" | "ios" | "web";
export type ContentReleaseStatus = "live" | "beta" | "deprecated" | "upcoming";
export type ContentChangelogType = "feature" | "fix" | "improvement" | "security";

export interface ContentChangelogEntry {
    type: ContentChangelogType;
    text: string;
}

export interface ContentAppVersion {
    id: string;
    platform: ContentPlatform;
    version: string;
    buildNumber: string;
    releaseDate: string;
    lastUpdatedAt: string;
    status: ContentReleaseStatus;
    forceUpdate: boolean;
    minSupportedVersion: string;
    changelog: ContentChangelogEntry[];
    note?: string;
}

interface ContentAppVersionApi {
    id: number;
    platform: string | null;
    version: string | null;
    buildNumber: string | null;
    releaseDate: string | null;
    lastUpdatedAt: string | null;
    status: string | null;
    forceUpdate: boolean;
    minSupportedVersion: string | null;
    changelog: ContentChangelogEntry[] | null;
    note: string | null;
}

export type ContentAppVersionPayload = Omit<ContentAppVersion, "id" | "lastUpdatedAt">;

function mapPlatform(value: string | null): ContentPlatform {
    if (value === "ios") return "ios";
    if (value === "web") return "web";
    return "android";
}

function mapStatus(value: string | null): ContentReleaseStatus {
    if (value === "beta") return "beta";
    if (value === "deprecated") return "deprecated";
    if (value === "upcoming") return "upcoming";
    return "live";
}

function mapAppVersion(item: ContentAppVersionApi): ContentAppVersion {
    const today = new Date().toISOString();

    return {
        id: String(item.id),
        platform: mapPlatform(item.platform),
        version: item.version ?? "",
        buildNumber: item.buildNumber ?? "",
        releaseDate: item.releaseDate ?? today.slice(0, 10),
        lastUpdatedAt: item.lastUpdatedAt ?? today,
        status: mapStatus(item.status),
        forceUpdate: item.forceUpdate,
        minSupportedVersion: item.minSupportedVersion ?? "",
        changelog: item.changelog ?? [],
        note: item.note ?? undefined,
    };
}

export async function getContentAppVersions(): Promise<ContentAppVersion[]> {
    const response = await api.get<ContentAppVersionApi[]>("/admin/content/app-versions");
    return response.data.map(mapAppVersion);
}

export async function createContentAppVersion(
    payload: ContentAppVersionPayload
): Promise<ContentAppVersion> {
    const response = await api.post<ContentAppVersionApi>(
        "/admin/content/app-versions",
        payload
    );

    return mapAppVersion(response.data);
}

export type UpdateAppVersionContentPayload = {
    changelog: ContentChangelogEntry[];
    note?: string;
};

export async function updateContentAppVersion(
    id: string,
    payload: UpdateAppVersionContentPayload
): Promise<ContentAppVersion> {
    const response = await api.patch<ContentAppVersionApi>(
        `/admin/content/app-versions/${id}/content`,
        payload
    );

    return mapAppVersion(response.data);
}

export async function deleteContentAppVersion(id: string): Promise<void> {
    await api.delete(`/admin/content/app-versions/${id}`);
}
