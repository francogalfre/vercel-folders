import "@/styles/grid.css";
import { FolderCard } from "@/components/folder-card/folder-card";
import { NewFolderButton } from "@/components/new-folder-button/new-folder-button";
import { store } from "@/lib/store";
import { getGridHeader, getProjectCards, getProjectName, isSearching } from "@/lib/vercel";

const STEP = 1000;

export function renderGrid(grid: HTMLUListElement) {
    const searching = isSearching();
    const cards = getProjectCards(grid);

    renderFolders(grid, searching ? [] : store.folders, cards[0]?.className ?? "");

    store.folders.forEach((folder, index) => {
        const card = grid.querySelector<HTMLElement>(`:scope > [data-vf-folder="${folder.id}"]`);
        if (card) card.style.order = String(index * STEP);
    });

    for (const card of cards) {
        const project = getProjectName(card, store.team);
        if (!project) continue;

        card.draggable = true;
        card.dataset.vfProject = project;

        const folder = store.folderOf(project);
        const open = !!folder && folder.id === store.openId;
        const index = folder ? store.folders.indexOf(folder) : store.folders.length;

        card.classList.toggle("vf-hidden", !searching && !!folder && !open);
        card.classList.toggle("vf-child", !searching && open);
        card.style.order = searching ? "" : String(index * STEP + (folder ? 1 + folder.projects.indexOf(project) : 0));
        if (folder) card.style.setProperty("--vf-color", folder.color);
    }

    const header = getGridHeader(grid);
    if (header && !header.querySelector(".vf-new-folder")) header.append(NewFolderButton());
}

/** Rebuilds folder cards only when their content changed, to avoid flicker on unrelated DOM updates */
function renderFolders(grid: HTMLUListElement, folders: typeof store.folders, cardClass: string) {
    const signature = JSON.stringify([folders, store.openId, cardClass]);
    if (grid.dataset.vfSignature === signature) return;

    grid.dataset.vfSignature = signature;
    grid.querySelectorAll(":scope > [data-vf-folder]").forEach((node) => node.remove());
    grid.prepend(...folders.map((folder) => FolderCard(folder, cardClass)));
}
