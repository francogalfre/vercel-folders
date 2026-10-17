import { h } from "@/utils/dom";

export function Avatar(name: string, src?: string | null) {
    const letter = () => h("span", { className: "vf-avatar", textContent: name.charAt(0).toUpperCase() });
    if (!src) return letter();

    const img = h("img", { className: "vf-avatar", src, alt: "", draggable: false });
    img.addEventListener("error", () => img.replaceWith(letter()));
    return img;
}
