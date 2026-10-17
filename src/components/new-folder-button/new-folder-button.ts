import "./new-folder-button.css";
import { openFolderDialog } from "@/components/folder-dialog/folder-dialog";
import { PLUS_ICON } from "@/constants";
import { h } from "@/utils/dom";

export function NewFolderButton() {
    const button = h("button", { className: "vf-new-folder", type: "button", innerHTML: PLUS_ICON }, ["New Folder"]);
    button.addEventListener("click", () => openFolderDialog());
    return button;
}
