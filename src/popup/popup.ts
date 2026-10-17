import "./popup.css";
import { isEnabled, onEnabledChange, setEnabled } from "@/lib/settings";

const toggle = document.getElementById("toggle") as HTMLButtonElement;

function render(enabled: boolean): void {
    toggle.setAttribute("aria-checked", String(enabled));
}

toggle.addEventListener("click", async () => {
    const next = toggle.getAttribute("aria-checked") !== "true";
    render(next);
    await setEnabled(next);
});

onEnabledChange(render);
isEnabled().then(render);
