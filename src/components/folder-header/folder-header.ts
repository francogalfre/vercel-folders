import "./folder-header.css";
import { ARROW_LEFT_ICON, FOLDER_ICON, MORE_ICON } from "@/constants";
import { openFolderDialog } from "@/components/folder-dialog/folder-dialog";
import { store } from "@/lib/store";
import type { Folder } from "@/types/folder";
import { h } from "@/utils/dom";

function IconButton(className: string, label: string, icon: string, onClick: () => void) {
    const button = h("button", { className, type: "button", title: label, ariaLabel: label, innerHTML: icon });
    button.addEventListener("click", onClick);
    return button;
}

/** Full-width row shown on top of a folder's projects while the folder is entered */
export function FolderHeader(folder: Folder) {
    const count = folder.projects.length;

    const crumb = h("button", { className: "vf-header__crumb", type: "button", textContent: "Projects" });
    crumb.addEventListener("click", () => store.exit());

    const crumbs = h("nav", { className: "vf-header__crumbs", ariaLabel: "Breadcrumb" }, [
        crumb,
        h("span", { className: "vf-header__sep", textContent: "/", ariaHidden: "true" }),
        h("span", { className: "vf-header__icon", innerHTML: FOLDER_ICON }),
        h("span", { className: "vf-header__name", textContent: folder.name }),
    ]);

    const row = h("div", { className: "vf-header__row" }, [
        IconButton("vf-header__btn", "Back to all projects", ARROW_LEFT_ICON, () => store.exit()),
        crumbs,
        h("span", { className: "vf-header__count", textContent: `${count} project${count === 1 ? "" : "s"}` }),
        IconButton("vf-header__btn", "Edit folder", MORE_ICON, () => openFolderDialog(folder)),
    ]);

    const header = h("li", { className: "vf-header" }, [row]);
    if (folder.description) header.append(h("p", { className: "vf-header__desc", textContent: folder.description }));

    header.dataset.vfNode = "header";
    header.style.setProperty("--vf-color", folder.color);
    return header;
}
