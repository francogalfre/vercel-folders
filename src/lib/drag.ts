import { Avatar } from "@/components/folder-card/avatar";
import { DRAG_TYPE } from "@/constants";
import { store } from "@/lib/store";
import { getProjectAvatar } from "@/lib/vercel";
import { h } from "@/utils/dom";

const FADE_MS = 150;

const inGrid = (target: EventTarget | null) => target instanceof Element && !!target.closest("ul.grid");
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const projectCard = (e: Event) => (e.target as Element).closest?.<HTMLElement>("[data-vf-project]") ?? null;

/** Fades the dragged card out, then moves it so the grid re-render doesn't pop it away */
export function dropProject(project: string, folderId: string | null) {
    document.querySelector(`[data-vf-project="${CSS.escape(project)}"]`)?.classList.add("vf-dropped");
    setTimeout(() => store.move(project, folderId), reducedMotion() ? 0 : FADE_MS);
}

function setDragImage(e: DragEvent, card: HTMLElement) {
    const name = card.dataset.vfProject!;
    const pill = h("div", { className: "vf-drag-pill" }, [Avatar(name, getProjectAvatar(card)), name]);
    document.body.append(pill);
    e.dataTransfer!.setDragImage(pill, 16, 16);
    setTimeout(() => pill.remove());
}

/** Project cards are draggable; dropping on a folder is handled by FolderCard, anywhere else in the grid removes it from its folder. Returns a teardown. */
export function setupDrag() {
    const controller = new AbortController();
    const { signal } = controller;

    document.addEventListener(
        "dragstart",
        (e) => {
            const card = projectCard(e);
            if (!card || !e.dataTransfer) return;

            e.dataTransfer.setData(DRAG_TYPE, card.dataset.vfProject!);
            e.dataTransfer.effectAllowed = "move";
            setDragImage(e, card);
            card.classList.add("vf-dragging");
            document.body.classList.add("vf-drag-active");
        },
        { signal },
    );

    document.addEventListener(
        "dragend",
        (e) => {
            projectCard(e)?.classList.remove("vf-dragging");
            document.body.classList.remove("vf-drag-active");
        },
        { signal },
    );

    document.addEventListener(
        "dragover",
        (e) => {
            if (e.dataTransfer?.types.includes(DRAG_TYPE) && inGrid(e.target)) e.preventDefault();
        },
        { signal },
    );

    document.addEventListener(
        "drop",
        (e) => {
            const project = e.dataTransfer?.getData(DRAG_TYPE);
            if (!project || !inGrid(e.target)) return;

            e.preventDefault();
            if (store.folderOf(project)) dropProject(project, null);
        },
        { signal },
    );

    return () => {
        controller.abort();
        document.body.classList.remove("vf-drag-active");
    };
}
