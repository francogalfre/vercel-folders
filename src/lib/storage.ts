import type { Folder } from "@/types/folder";

const key = (team: string) => `folders:${team}`;

export async function loadFolders(team: string): Promise<Folder[]> {
    try {
        const data = await chrome.storage.sync.get(key(team));
        return (data[key(team)] as Folder[] | undefined) ?? [];
    } catch (error) {
        console.error("[vercel-folders] Failed to load folders", error);
        return [];
    }
}

export async function saveFolders(team: string, folders: Folder[]) {
    try {
        await chrome.storage.sync.set({ [key(team)]: folders });
    } catch (error) {
        console.error("[vercel-folders] Failed to save folders", error);
    }
}

export function onFoldersChanged(getTeam: () => string, cb: (folders: Folder[]) => void) {
    chrome.storage.onChanged.addListener((changes, area) => {
        const team = getTeam();
        const change = area === "sync" && team ? changes[key(team)] : undefined;
        if (change) cb((change.newValue as Folder[] | undefined) ?? []);
    });
}
