# Vercel Folders

Chrome extension (MV3) that adds folders to the Vercel dashboard project grid.

## Features

- Create folders with a name, optional description and colored icon
- Drag projects into folders
- Click a folder to expand it
- Folders saved per team in `chrome.storage.sync`

## Structure

```
src/
├── content/index.ts   # content script entry
├── components/        # folder-card, folder-dialog, new-folder-button (.ts + .css)
├── lib/               # store, storage, vercel, grid, drag
├── utils/dom.ts
├── types/             # folder.ts, env.d.ts
├── constants/
└── styles/grid.css
```

## Development

```bash
bun install
bun run dev        # watch build to dist/
bun run build      # production build
bun run typecheck
```

Open `chrome://extensions`, enable Developer mode, click **Load unpacked** and select the `dist/` folder.

## How it works

- Folders are rendered as grid items reusing Vercel's card classes.
- Projects are placed after their folder with CSS `order`, so React-owned nodes are never moved.
- A MutationObserver re-syncs the grid on SPA navigation, search and pagination.
- Data is stored per team.

## License

MIT
