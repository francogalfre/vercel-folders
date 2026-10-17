import { setupDrag } from "@/lib/drag";
import { renderGrid, resetGrid } from "@/lib/grid";
import { setupProjectMenu } from "@/lib/project-menu";
import { isEnabled, onEnabledChange } from "@/lib/settings";
import { store } from "@/lib/store";
import { getGrid, getTeam, isSearchInput } from "@/lib/vercel";

// Vercel is a SPA: the grid is re-rendered on navigation, search and pagination
const observer = new MutationObserver(schedule);
let frame = 0;
let stop: (() => void) | null = null;

function schedule() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(sync);
}

async function sync() {
    if (!stop) return;
    const team = getTeam();
    if (!team) return;
    if (team !== store.team) return store.load(team);

    const grid = getGrid();
    if (!grid) return;

    observer.disconnect();
    renderGrid(grid);
    observer.observe(document.body, { childList: true, subtree: true });
}

function onInput(e: Event) {
    if (isSearchInput(e.target)) schedule();
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && store.activeId && !document.querySelector("dialog[open]")) store.exit();
}

function enable() {
    if (stop) return;

    const unsubscribe = store.subscribe(schedule);
    const teardownDrag = setupDrag();
    const teardownMenu = setupProjectMenu();
    document.addEventListener("input", onInput);
    document.addEventListener("keydown", onKeydown);
    observer.observe(document.body, { childList: true, subtree: true });

    stop = () => {
        stop = null;
        cancelAnimationFrame(frame);
        observer.disconnect();
        unsubscribe();
        teardownDrag();
        teardownMenu();
        document.removeEventListener("input", onInput);
        document.removeEventListener("keydown", onKeydown);
        store.exit();
        resetGrid();
    };
    schedule();
}

isEnabled().then((enabled) => enabled && enable());
onEnabledChange((enabled) => (enabled ? enable() : stop?.()));
