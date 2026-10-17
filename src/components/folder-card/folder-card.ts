import "./folder-card.css";
import { DRAG_TYPE, FOLDER_ICON, MORE_ICON } from "@/constants";
import { openFolderDialog } from "@/components/folder-dialog/folder-dialog";
import { store } from "@/lib/store";
import type { Folder } from "@/types/folder";
import { h } from "@/utils/dom";

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
        store.move(project, folder.id);
    });
}

/**
 * A folder rendered as a grid item. `cardClass` is copied from a real project
 * card so the folder inherits Vercel's card styling.
 */
export function FolderCard(folder: Folder, cardClass: string) {
    const count = folder.projects.length;

    const icon = h("span", { className: "vf-folder__icon", innerHTML: FOLDER_ICON });
    icon.style.color = folder.color;

    const card = h("li", { className: `${cardClass} vf-folder`, tabIndex: 0, role: "button" }, [
        h("div", { className: "vf-folder__head" }, [
            icon,
            h("div", { className: "vf-folder__titles" }, [
                h("span", { className: "vf-folder__name", textContent: folder.name }),
                h("span", {
                    className: "vf-folder__count",
                    textContent: `${count} project${count === 1 ? "" : "s"}`,
                }),
            ]),
            EditButton(folder),
        ]),
    ]);
    if (folder.description) {
        card.append(h("p", { className: "vf-folder__desc", textContent: folder.description }));
    }

    card.dataset.vfFolder = folder.id;
    card.style.setProperty("--vf-color", folder.color);
    card.setAttribute("aria-expanded", String(store.openId === folder.id));

    card.addEventListener("click", () => store.toggle(folder.id));
    card.addEventListener("keydown", (e) => {
        if (e.target === card && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            store.toggle(folder.id);
        }
    });
    bindDrop(card, folder);

    return card;
}
