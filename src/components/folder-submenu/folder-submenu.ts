import "./folder-submenu.css";
import { FOLDER_ICON } from "@/constants";
import { openFolderDialog } from "@/components/folder-dialog/folder-dialog";
import { store } from "@/lib/store";
import { h } from "@/utils/dom";

const CHECK_ICON = `<svg class="vf-submenu__check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7"/></svg>`;
const REMOVE_ICON = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M3 8h10"/></svg>`;
const PLUS_ICON = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>`;
const GAP = 4;

export type FolderSubmenu = {
    el: HTMLElement;
    close: () => void;
    // Virtual keyboard navigation: focus stays in Vercel's menu. Returns true when handled.
    onKey: (e: KeyboardEvent) => boolean;
};

function Row(icon: string, label: string, onSelect: () => void, tint?: string, checked = false) {
    const iconEl = h("span", { className: "vf-submenu__icon", innerHTML: icon });
    if (tint) iconEl.style.color = tint;
    const row = h("button", { type: "button", className: "vf-submenu__item", role: "menuitem" }, [
        iconEl,
        h("span", { className: "vf-submenu__name", textContent: label }),
    ]);
    if (checked) row.insertAdjacentHTML("beforeend", CHECK_ICON);
    row.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelect();
    });
    return row;
}

function place(el: HTMLElement, anchor: HTMLElement) {
    const a = anchor.getBoundingClientRect();
    const { width, height } = el.getBoundingClientRect();
    const fitsRight = a.right + GAP + width <= innerWidth - 8;
    const left = fitsRight ? a.right + GAP : Math.max(8, a.left - GAP - width);
    const top = Math.max(8, Math.min(a.top - 8, innerHeight - height - 8));

    el.dataset.side = fitsRight ? "right" : "left";
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
}

export function openFolderSubmenu(anchor: HTMLElement, project: string, dismiss: () => void): FolderSubmenu {
    const current = store.folderOf(project);
    const rows: HTMLElement[] = [];
    const menu = h("div", { className: "vf-submenu", role: "menu", tabIndex: -1 });

    const move = (id: string | null) => {
        dismiss();
        void store.move(project, id);
    };
    const add = (row: HTMLElement) => {
        rows.push(row);
        menu.append(row);
    };

    if (!store.folders.length) menu.append(h("div", { className: "vf-submenu__empty", textContent: "No folders yet" }));

    for (const f of store.folders) {
        add(Row(FOLDER_ICON, f.name, () => move(f.id), f.color, f.id === current?.id));
    }

    if (store.folders.length) menu.append(h("div", { className: "vf-submenu__divider", role: "separator" }));
    if (current) add(Row(REMOVE_ICON, "Remove from Folder", () => move(null)));
    add(Row(PLUS_ICON, "New Folder…", () => {
        dismiss();
        openFolderDialog();
    }));

    let active = -1;
    const highlight = (i: number) => {
        active = (i + rows.length) % rows.length;
        rows.forEach((r, n) => (n === active ? r.setAttribute("data-active", "") : r.removeAttribute("data-active")));
        rows[active].scrollIntoView({ block: "nearest" });
    };

    // Don't let Vercel treat interactions here as "outside" the menu
    for (const type of ["pointerdown", "mousedown", "focusin"]) menu.addEventListener(type, (e) => e.stopPropagation());

    document.body.append(menu);
    place(menu, anchor);

    return {
        el: menu,
        close: () => menu.remove(),
        onKey(e) {
            if (e.key === "ArrowDown") highlight(active + 1);
            else if (e.key === "ArrowUp") highlight(active < 0 ? rows.length - 1 : active - 1);
            else if ((e.key === "Enter" || e.key === " ") && active >= 0) rows[active].click();
            else return false;

            return true;
        },
    };
}
