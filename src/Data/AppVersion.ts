export type Platform = 'android' | 'ios' | 'web';
export type VersionStatus = 'live' | 'beta' | 'upcoming' | 'deprecated';
export type NoteType = 'new' | 'improvement' | 'fix' | 'security';

export interface ReleaseNote {
    type: NoteType;
    text: string;
}

export interface AppVersion {
    id: string;
    version: string;
    build: number;
    platform: Platform;
    status: VersionStatus;
    releaseDate: string;
    minSupported: string;
    updatedAt: string;
    forcedUpdate: boolean;
    notes: ReleaseNote[];
}
