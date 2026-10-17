import { openFolderSubmenu, type FolderSubmenu } from "@/components/folder-submenu/folder-submenu";
import { store } from "@/lib/store";

const MENU = "[data-geist-menu][role=menu]:not([data-avatar-menu])";
const TRIGGER = "button[aria-haspopup]";
const CARD = "li[data-vf-project]";
const CHEVRON = `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="color: var(--ds-gray-900)"><path d="m6 3.5 4.5 4.5L6 12.5"/></svg>`;
const HOVER_DELAY = 150;

function projectOf(menu: Element, fallback: string | null) {
    const id = menu.getAttribute("aria-labelledby");
    const trigger = id ? document.getElementById(id) : null;
    if (!trigger) return fallback;

    return trigger.closest<HTMLElement>(CARD)?.dataset.vfProject ?? null;
}

function buildItem(template: HTMLElement) {
    const item = template.cloneNode(false) as HTMLElement;
    for (const attr of ["id", "aria-labelledby", "data-descendant", "data-selected", "data-highlighted"]) item.removeAttribute(attr);
    item.classList.add("vf-menu-item");
    item.tabIndex = 0;
    item.setAttribute("aria-haspopup", "menu");

    const inner = (template.firstElementChild?.cloneNode(false) as HTMLElement | undefined) ?? document.createElement("div");
    inner.classList.add("vf-menu-item__row");
    inner.innerHTML = `<span>Add to Folder</span>${CHEVRON}`;
    item.append(inner);

    return item;
}

export function setupProjectMenu(): () => void {
    let lastProject: string | null = null;
    let sub: FolderSubmenu | null = null;
    let owner: HTMLElement | null = null;
    let timer = 0;

    const closeSub = () => {
        clearTimeout(timer);
        sub?.close();
        owner?.removeAttribute("data-vf-open");
        sub = owner = null;
    };

    const scheduleClose = () => {
        clearTimeout(timer);
        timer = window.setTimeout(closeSub, HOVER_DELAY);
    };

    const dismiss = (menu: Element) => {
        closeSub();
        menu.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true, cancelable: true }));
        setTimeout(() => {
            if (!menu.isConnected) return;
            for (const type of ["pointerdown", "mousedown", "mouseup", "click"]) document.body.dispatchEvent(new Event(type, { bubbles: true }));
        }, 50);
    };

    const openSub = (item: HTMLElement, menu: HTMLElement, project: string, withKeyboard = false) => {
        clearTimeout(timer);
        if (owner === item) return;
        closeSub();
        owner = item;
        item.setAttribute("data-vf-open", "");
        sub = openFolderSubmenu(item, project, () => dismiss(menu));
        sub.el.addEventListener("pointerenter", () => clearTimeout(timer));
        sub.el.addEventListener("pointerleave", scheduleClose);
        if (withKeyboard) sub.onKey(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    };

    const inject = (menu: HTMLElement) => {
        if (menu.querySelector(".vf-menu-item")) return;
        const project = projectOf(menu, lastProject);
        const template = menu.querySelector<HTMLElement>("li[role=menuitem]");
        if (!project || !template) return;

        const item = buildItem(template);
        item.addEventListener("pointerenter", () => openSub(item, menu, project));
        item.addEventListener("pointerleave", scheduleClose);
        item.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            openSub(item, menu, project, true);
        });
        item.dataset.vfProject = project;
        const divider = menu.querySelector("[role=separator]");
        if (divider) divider.before(item);
        else menu.append(item);
    };

    const scan = () => {
        for (const menu of document.querySelectorAll<HTMLElement>(MENU)) inject(menu);
        if (owner && !owner.isConnected) closeSub();
    };

    const rememberProject = (e: Event) => {
        const target = e.target as Element | null;
        if (!target?.closest?.(TRIGGER)) return;
        lastProject = target.closest<HTMLElement>(CARD)?.dataset.vfProject ?? null;
    };

    const onKeyDown = (e: KeyboardEvent) => {
        rememberProject(e);
        const stop = () => {
            e.preventDefault();
            e.stopPropagation();
        };

        if (sub) {
            if (e.key === "ArrowLeft" || e.key === "Escape") {
                const item = owner;
                closeSub();
                item?.focus();
                stop();
            } else if (sub.onKey(e)) stop();
            return;
        }

        const item = (e.target as Element | null)?.closest?.<HTMLElement>(".vf-menu-item");
        if (!item || !["ArrowRight", "Enter", " "].includes(e.key)) return;
        const menu = item.closest<HTMLElement>(MENU);
        if (menu) {
            stop();
            openSub(item, menu, item.dataset.vfProject!, true);
        }
    };

    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("pointerdown", rememberProject, true);
    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("resize", closeSub);
    const unsubscribe = store.subscribe(scan);
    scan();

    return () => {
        observer.disconnect();
        unsubscribe();
        document.removeEventListener("pointerdown", rememberProject, true);
        document.removeEventListener("keydown", onKeyDown, true);
        window.removeEventListener("resize", closeSub);
        closeSub();
        for (const el of document.querySelectorAll(".vf-menu-item")) el.remove();
    };
}
