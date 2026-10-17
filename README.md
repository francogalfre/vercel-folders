# Vercel Folders

Chrome extension (MV3) that adds folders to the Vercel dashboard project grid.

## Features

- Create folders with a name, optional description and colored icon
- Drag projects into folders
- Folder cards preview the avatars of the projects inside
- Click a folder to open it; Esc or the back button returns
- "Add to Folder" in each project's menu
- Turn it on/off from the toolbar popup
- Folders saved per team in `chrome.storage.sync`

## Structure

```
src/
├── content/index.ts   # content script entry
├── background/index.ts # service worker (toolbar badge)
├── popup/             # toolbar popup (on/off switch)
├── components/        # folder-card, folder-dialog, new-folder-button (.ts + .css)
├── lib/               # store, storage, settings, vercel, grid, drag
├── utils/dom.ts
├── types/             # folder.ts, env.d.ts
├── constants/
└── styles/grid.css
public/icons/          # extension icons (generated)
scripts/               # build.ts, generate-icons.py
```

## Development

```bash
bun install
bun run dev        # watch build to dist/
bun run icons      # regenerate public/icons (Python + Pillow)
bun run build      # production build
bun run typecheck
```

Open `chrome://extensions`, enable Developer mode, click **Load unpacked** and select the `dist/` folder.

## How it works

- Folders are rendered as grid items reusing Vercel's card classes.
- Projects are shown/hidden and ordered with classes and CSS `order`, so React-owned nodes are never moved.
- A MutationObserver re-syncs the grid on SPA navigation, search and pagination.
- Data is stored per team.

## License

MIT
