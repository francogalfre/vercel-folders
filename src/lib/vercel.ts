// Everything that depends on Vercel's dashboard markup lives here.

export function getTeam(): string | null {
    const parts = location.pathname.split("/").filter(Boolean);
    return parts.length === 1 ? parts[0] : null;
}

export function getGrid() {
    return document.querySelector<HTMLUListElement>("ul.grid:has(> li a[href])");
}

export function getProjectCards(grid: HTMLUListElement) {
    return [...grid.querySelectorAll<HTMLLIElement>(":scope > li:not([data-vf-folder])")];
}

export function getProjectName(card: Element, team: string): string | null {
    for (const a of card.querySelectorAll("a[href]")) {
        const match = a.getAttribute("href")!.match(/^\/([^/?#]+)\/([^/?#]+)$/);
        if (match?.[1] === team) return match[2];
    }

    return null;
}

export function getGridHeader(grid: HTMLUListElement) {
    return grid.previousElementSibling as HTMLElement | null;
}

export function isSearchInput(target: EventTarget | null) {
    return target instanceof HTMLInputElement && target.placeholder === "Search Projects";
}

export function isSearching() {
    const input = document.querySelector<HTMLInputElement>('input[placeholder="Search Projects"]');
    return !!input?.value;
}
