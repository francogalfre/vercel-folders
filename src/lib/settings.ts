const KEY = "enabled";

export async function isEnabled(): Promise<boolean> {
    try {
        const result = await chrome.storage.sync.get(KEY);
        return result[KEY] !== false;
    } catch (error) {
        console.error("[vercel-folders] failed to read settings", error);
        return true;
    }
}

export async function setEnabled(enabled: boolean): Promise<void> {
    try {
        await chrome.storage.sync.set({ [KEY]: enabled });
    } catch (error) {
        console.error("[vercel-folders] failed to save settings", error);
    }
}

export function onEnabledChange(cb: (enabled: boolean) => void): void {
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== "sync" || !changes[KEY]) return;
        cb(changes[KEY].newValue !== false);
    });
}
