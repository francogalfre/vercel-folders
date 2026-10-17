import { loadFolders, onFoldersChanged, saveFolders } from "@/lib/storage";
import type { Folder, FolderInput } from "@/types/folder";

let team = "";
let folders: Folder[] = [];
let activeId: string | null = null;
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
    get activeId() {
        return activeId;
    },

    subscribe(fn: () => void) {
        listeners.add(fn);
        return () => void listeners.delete(fn);
    },

    async load(nextTeam: string) {
        team = nextTeam;
        activeId = null;
        folders = await loadFolders(team);
        emit();
    },

    folderOf(project: string) {
        return folders.find((f) => f.projects.includes(project));
    },

    enter(id: string) {
        activeId = id;
        emit();
    },

    exit() {
        if (activeId === null) return;
        activeId = null;
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
        if (activeId === id) activeId = null;
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
    if (activeId && !folders.some((f) => f.id === activeId)) activeId = null;
    emit();
});
