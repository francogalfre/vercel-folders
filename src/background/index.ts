import { isEnabled, onEnabledChange } from "@/lib/settings";

function updateBadge(enabled: boolean): void {
    chrome.action.setBadgeBackgroundColor({ color: "#666666" });
    chrome.action.setBadgeText({ text: enabled ? "" : "OFF" });
}

onEnabledChange(updateBadge);
chrome.runtime.onStartup.addListener(async () => updateBadge(await isEnabled()));
chrome.runtime.onInstalled.addListener(async () => updateBadge(await isEnabled()));
