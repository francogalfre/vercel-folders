import { loadFolders, onFoldersChanged, saveFolders } from "@/lib/storage";
import type { Folder, FolderInput } from "@/types/folder";

let team = "";
let folders: Folder[] = [];
let openId: string | null = null;
const listeners = new Set<() => void>();

function emit() {
    for (const fn of listeners) fn();
}

async function persist() {
    emit();
    await saveFolders(team, folders);
}

export const store = {
    get team() {
        return team;
    },
    get folders() {
        return folders;
    },
    get openId() {
        return openId;
    },

    subscribe(fn: () => void) {
        listeners.add(fn);
    },

    async load(nextTeam: string) {
        team = nextTeam;
        openId = null;
        folders = await loadFolders(team);
        emit();
    },

    folderOf(project: string) {
        return folders.find((f) => f.projects.includes(project));
    },

    toggle(id: string) {
        openId = openId === id ? null : id;
        emit();
    },

    create(input: FolderInput) {
        folders = [...folders, { ...input, id: crypto.randomUUID(), projects: [] }];
        return persist();
    },

    update(id: string, input: FolderInput) {
        folders = folders.map((f) => (f.id === id ? { ...f, ...input } : f));
        return persist();
    },

    remove(id: string) {
        folders = folders.filter((f) => f.id !== id);
        if (openId === id) openId = null;
        return persist();
    },

    move(project: string, folderId: string | null) {
        folders = folders.map((f) => ({
            ...f,
            projects: f.id === folderId ? [...f.projects.filter((p) => p !== project), project] : f.projects.filter((p) => p !== project),
        }));
        return persist();
    },
};

onFoldersChanged(() => team, (next) => {
    folders = next;
    emit();
});
