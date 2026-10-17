import { DRAG_TYPE } from "@/constants";
import { store } from "@/lib/store";

const inGrid = (target: EventTarget | null) => target instanceof Element && !!target.closest("ul.grid");

/** Project cards are draggable; dropping on a folder is handled by FolderCard, anywhere else in the grid removes it from its folder */
export function setupDrag() {
    document.addEventListener("dragstart", (e) => {
        const card = (e.target as Element).closest?.<HTMLElement>("[data-vf-project]");
        if (!card || !e.dataTransfer) return;

        e.dataTransfer.setData(DRAG_TYPE, card.dataset.vfProject!);
        e.dataTransfer.effectAllowed = "move";
        card.classList.add("vf-dragging");
    });

    document.addEventListener("dragend", (e) => {
        (e.target as Element).closest?.("[data-vf-project]")?.classList.remove("vf-dragging");
    });

    document.addEventListener("dragover", (e) => {
        if (e.dataTransfer?.types.includes(DRAG_TYPE) && inGrid(e.target)) e.preventDefault();
    });

    document.addEventListener("drop", (e) => {
        const project = e.dataTransfer?.getData(DRAG_TYPE);
        if (!project || !inGrid(e.target)) return;

        e.preventDefault();
        if (store.folderOf(project)) store.move(project, null);
    });
}
