import { cp, mkdir, rm, watch } from "node:fs/promises";

const dev = process.argv.includes("--watch");

async function build(): Promise<void> {
    await rm("dist", { recursive: true, force: true });
    await mkdir("dist", { recursive: true });
    const entries = {
        content: "src/content/index.ts",
        popup: "src/popup/popup.ts",
        background: "src/background/index.ts",
    };
    for (const [name, entry] of Object.entries(entries)) {
        const result = await Bun.build({
            entrypoints: [entry],
            outdir: "dist",
            format: "iife",
            minify: !dev,
            naming: `${name}.[ext]`,
        });
        if (!result.success) {
            for (const log of result.logs) console.error(log);
            throw new Error(`build failed: ${name}`);
        }
    }
    await cp("manifest.json", "dist/manifest.json");
    await cp("public", "dist", { recursive: true });
    await cp("src/popup/popup.html", "dist/popup.html");
}

async function run(): Promise<void> {
    try {
        await build();
        console.log("[build] done");
    } catch (error) {
        console.error("[build]", error);
        if (!dev) process.exit(1);
    }
}

await run();

if (dev) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    for await (const _ of watch("src", { recursive: true })) {
        clearTimeout(timer);
        timer = setTimeout(run, 100);
    }
}
