import "./folder-card.css";
import { Avatar } from "@/components/folder-card/avatar";
import { DRAG_TYPE, FOLDER_ICON, MORE_ICON } from "@/constants";
import { openFolderDialog } from "@/components/folder-dialog/folder-dialog";
import { dropProject } from "@/lib/drag";
import { store } from "@/lib/store";
import type { Folder } from "@/types/folder";
import { h } from "@/utils/dom";

const MAX_AVATARS = 4;
let popped: string | null = null;

function EditButton(folder: Folder) {
    const edit = h("button", {
        className: "vf-folder__edit",
        type: "button",
        title: "Edit folder",
        ariaLabel: "Edit folder",
        innerHTML: MORE_ICON,
    });
    edit.addEventListener("click", (e) => {
        e.stopPropagation();
        openFolderDialog(folder);
    });
    return edit;
}

function Preview(folder: Folder, avatarOf: (project: string) => string | undefined) {
    if (!folder.projects.length) return h("div", { className: "vf-folder__empty", textContent: "Drop projects here" });

    const stack = h(
        "div",
        { className: "vf-folder__stack" },
        folder.projects.slice(0, MAX_AVATARS).map((project) => Avatar(project, avatarOf(project))),
    );
    const extra = folder.projects.length - MAX_AVATARS;
    if (extra > 0) stack.append(h("span", { className: "vf-avatar vf-avatar--more", textContent: `+${extra}` }));
    return stack;
}

function bindDrop(card: HTMLElement, folder: Folder) {
    card.addEventListener("dragover", (e) => {
        if (!e.dataTransfer?.types.includes(DRAG_TYPE)) return;
        e.preventDefault();
        card.classList.add("vf-folder--over");
    });
    card.addEventListener("dragleave", (e) => {
        if (!card.contains(e.relatedTarget as Node)) card.classList.remove("vf-folder--over");
    });
    card.addEventListener("drop", (e) => {
        const project = e.dataTransfer?.getData(DRAG_TYPE);
        if (!project) return;
        e.preventDefault();
        e.stopPropagation();
        card.classList.remove("vf-folder--over");
        popped = folder.id;
        dropProject(project, folder.id);
    });
}

/**
 * A folder rendered as a grid item. `cardClass` is copied from a real project
 * card so the folder inherits Vercel's card styling.
 */
export function FolderCard(folder: Folder, cardClass: string, avatarOf: (project: string) => string | undefined) {
    const count = folder.projects.length;

    const body = h("div", { className: "vf-folder__body" }, [
        h("div", { className: "vf-folder__head" }, [
            h("span", { className: "vf-folder__icon", innerHTML: FOLDER_ICON }),
            h("div", { className: "vf-folder__titles" }, [
                h("span", { className: "vf-folder__name", textContent: folder.name }),
                h("span", { className: "vf-folder__count", textContent: `${count} project${count === 1 ? "" : "s"}` }),
            ]),
            EditButton(folder),
        ]),
    ]);
    if (folder.description) body.append(h("p", { className: "vf-folder__desc", textContent: folder.description }));
    body.append(Preview(folder, avatarOf));

    const card = h("li", { className: `${cardClass} vf-folder`, tabIndex: 0, role: "button" }, [body]);
    card.dataset.vfNode = "folder";
    card.dataset.vfFolder = folder.id;
    card.style.setProperty("--vf-color", folder.color);
    card.ariaLabel = `Open folder ${folder.name}`;

    if (popped === folder.id) {
        popped = null;
        card.classList.add("vf-folder--pop");
    }

    card.addEventListener("click", () => store.enter(folder.id));
    card.addEventListener("keydown", (e) => {
        if (e.target === card && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            store.enter(folder.id);
        }
    });
    bindDrop(card, folder);

    return card;
}
