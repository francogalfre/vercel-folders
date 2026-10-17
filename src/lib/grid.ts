import "@/styles/grid.css";
import { FolderCard } from "@/components/folder-card/folder-card";
import { FolderHeader } from "@/components/folder-header/folder-header";
import { NewFolderButton } from "@/components/new-folder-button/new-folder-button";
import { store } from "@/lib/store";
import { getGridHeader, getProjectAvatar, getProjectCards, getProjectName, isSearching } from "@/lib/vercel";
import type { Folder } from "@/types/folder";
import { h } from "@/utils/dom";

const STEP = 1000;
const STAGGER_MS = 40;

// Last known avatar per project, so hidden or not-yet-loaded cards still show a preview
const avatars = new Map<string, string>();
const avatarKey = (project: string) => `${store.team}/${project}`;
const avatarOf = (project: string) => avatars.get(avatarKey(project));

function Divider() {
    const divider = h("li", { className: "vf-divider", textContent: "Projects", ariaHidden: "true" });
    divider.dataset.vfNode = "divider";
    return divider;
}

export function renderGrid(grid: HTMLUListElement) {
    const searching = isSearching();
    const cards = getProjectCards(grid);
    const active = searching ? undefined : store.folders.find((f) => f.id === store.activeId);

    for (const card of cards) {
        const project = getProjectName(card, store.team);
        const src = project && getProjectAvatar(card);
        if (src) avatars.set(avatarKey(project), src);
    }

    renderNodes(grid, searching, active, vercelClasses(cards[0]));
    cards.forEach((card) => placeCard(card, searching, active));

    const header = getGridHeader(grid);
    if (header && !header.querySelector(".vf-new-folder")) header.append(NewFolderButton());
}

/** Vercel's own card classes, without ours (e.g. vf-hidden on a project that's inside a folder) */
function vercelClasses(card: HTMLElement | undefined) {
    return [...(card?.classList ?? [])].filter((c) => !c.startsWith("vf-")).join(" ");
}

function placeCard(card: HTMLElement, searching: boolean, active: Folder | undefined) {
    const project = getProjectName(card, store.team);
    if (!project) return;

    card.draggable = true;
    card.dataset.vfProject = project;
    card.classList.remove("vf-dropped");

    const folder = store.folderOf(project);
    const inActive = !!active && folder?.id === active.id;
    const hidden = !searching && (active ? !inActive : !!folder);
    const index = folder ? store.folders.indexOf(folder) : store.folders.length;

    card.classList.toggle("vf-hidden", hidden);
    card.classList.toggle("vf-enter", inActive);
    card.style.order = searching ? "" : inActive ? String(1 + active!.projects.indexOf(project)) : String(index * STEP);

    if (inActive) card.style.setProperty("--vf-delay", `${active!.projects.indexOf(project) * STAGGER_MS}ms`);
    else card.style.removeProperty("--vf-delay");
}

/** Rebuilds our own nodes only when their content changed, to avoid flicker on unrelated DOM updates */
function renderNodes(grid: HTMLUListElement, searching: boolean, active: Folder | undefined, cardClass: string) {
    const folders = searching ? [] : store.folders;
    const previews = folders.map((f) => f.projects.map((p) => avatarOf(p) ?? ""));
    const signature = JSON.stringify([folders, active?.id, cardClass, previews]);
    // React may drop our nodes when it re-renders the list, so also check they're still there
    const expected = active ? 1 : folders.length + (folders.length ? 1 : 0);
    const present = grid.querySelectorAll(":scope > [data-vf-node]").length;
    if (grid.dataset.vfSignature === signature && present === expected) return;

    grid.dataset.vfSignature = signature;
    grid.querySelectorAll(":scope > [data-vf-node]").forEach((node) => node.remove());

    if (active) {
        const header = FolderHeader(active);
        header.style.order = "0";
        return grid.prepend(header);
    }

    const nodes: HTMLElement[] = folders.map((folder, index) => {
        const card = FolderCard(folder, cardClass, avatarOf);
        card.style.order = String(index * STEP);
        return card;
    });
    if (folders.length) {
        const divider = Divider();
        divider.style.order = String(folders.length * STEP - 1);
        nodes.push(divider);
    }
    grid.prepend(...nodes);
}

/** Removes everything the extension added to the page and restores Vercel's cards */
export function resetGrid() {
    document.querySelectorAll("[data-vf-node], .vf-new-folder").forEach((node) => node.remove());
    document.querySelectorAll<HTMLElement>("[data-vf-signature]").forEach((grid) => delete grid.dataset.vfSignature);

    document.querySelectorAll<HTMLElement>("[data-vf-project]").forEach((card) => {
        card.classList.remove("vf-hidden", "vf-enter", "vf-dragging", "vf-dropped");
        card.style.removeProperty("order");
        card.style.removeProperty("--vf-delay");
        card.removeAttribute("draggable");
        delete card.dataset.vfProject;
    });
}
