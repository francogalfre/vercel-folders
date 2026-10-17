import "./folder-dialog.css";
import { COLORS, FOLDER_ICON } from "@/constants";
import { store } from "@/lib/store";
import type { Folder } from "@/types/folder";
import { h } from "@/utils/dom";

function Field(label: string, control: HTMLElement, hint?: string) {
    const text = h("span", { className: "vf-field__label", textContent: label });
    if (hint) text.append(h("span", { className: "vf-field__hint", textContent: hint }));
    return h("label", { className: "vf-field" }, [text, control]);
}

function ColorPicker(selected: string, onChange: (color: string) => void) {
    const swatches = h(
        "div",
        { className: "vf-swatches", role: "radiogroup" },
        COLORS.map(({ name, value }) => {
            const swatch = h("button", { type: "button", className: "vf-swatch", role: "radio", ariaLabel: name, title: name });
            swatch.style.setProperty("--vf-swatch", value);
            swatch.ariaChecked = String(value === selected);
            swatch.addEventListener("click", () => {
                onChange(value);
                for (const s of swatches.children) s.ariaChecked = String(s === swatch);
            });
            return swatch;
        }),
    );
    return swatches;
}

function Footer(folder: Folder | undefined, dialog: HTMLDialogElement) {
    const footer = h("footer", { className: "vf-dialog__footer" });
    if (folder) {
        const remove = h("button", { type: "button", className: "vf-btn vf-btn--danger", textContent: "Delete" });
        remove.addEventListener("click", () => {
            store.remove(folder.id);
            dialog.close();
        });
        footer.append(remove);
    }
    const cancel = h("button", { type: "button", className: "vf-btn vf-btn--secondary", textContent: "Cancel" });
    cancel.addEventListener("click", () => dialog.close());
    footer.append(
        h("span", { className: "vf-dialog__spacer" }),
        cancel,
        h("button", { type: "submit", className: "vf-btn vf-btn--primary", textContent: folder ? "Save" : "Create" }),
    );
    return footer;
}

/** Create (no folder) or edit/delete (with folder) dialog */
export function openFolderDialog(folder?: Folder) {
    let color = folder?.color ?? COLORS[0].value;

    const preview = h("span", { className: "vf-dialog__preview", innerHTML: FOLDER_ICON });
    preview.style.color = color;

    const name = h("input", {
        className: "vf-input",
        placeholder: "e.g. Echo",
        value: folder?.name ?? "",
        required: true,
        autocomplete: "off",
    });
    const description = h("input", {
        className: "vf-input",
        placeholder: "What's inside this folder?",
        value: folder?.description ?? "",
        autocomplete: "off",
    });
    const colors = ColorPicker(color, (c) => {
        color = c;
        preview.style.color = c;
    });

    const dialog = h("dialog", { className: "vf-dialog" });
    const form = h("form", { className: "vf-dialog__form" }, [
        h("div", { className: "vf-dialog__body" }, [
            h("header", { className: "vf-dialog__header" }, [
                preview,
                h("div", {}, [
                    h("h2", { className: "vf-dialog__title", textContent: folder ? "Edit Folder" : "New Folder" }),
                    h("p", { className: "vf-dialog__subtitle", textContent: "Group related projects together." }),
                ]),
            ]),
            Field("Name", name),
            Field("Description", description, "Optional"),
            h("div", { className: "vf-field" }, [h("span", { className: "vf-field__label", textContent: "Color" }), colors]),
        ]),
        Footer(folder, dialog),
    ]);
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = { name: name.value.trim(), description: description.value.trim(), color };
        if (!input.name) return name.focus();
        if (folder) store.update(folder.id, input);
        else store.create(input);
        dialog.close();
    });

    dialog.append(form);
    dialog.addEventListener("click", (e) => e.target === dialog && dialog.close());
    dialog.addEventListener("close", () => dialog.remove());
    document.body.append(dialog);
    dialog.showModal();
    name.focus();
}
