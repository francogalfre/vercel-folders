import { setupDrag } from "@/lib/drag";
import { renderGrid } from "@/lib/grid";
import { store } from "@/lib/store";
import { getGrid, getTeam, isSearchInput } from "@/lib/vercel";

// Vercel is a SPA: the grid is re-rendered on navigation, search and pagination
const observer = new MutationObserver(schedule);
let frame = 0;

function schedule() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(sync);
}

async function sync() {
    const team = getTeam();
    if (!team) return;
    if (team !== store.team) return store.load(team);

    const grid = getGrid();
    if (!grid) return;

    observer.disconnect();
    renderGrid(grid);
    observer.observe(document.body, { childList: true, subtree: true });
}

store.subscribe(schedule);
setupDrag();
document.addEventListener("input", (e) => isSearchInput(e.target) && schedule());
observer.observe(document.body, { childList: true, subtree: true });
schedule();
