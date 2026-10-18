import { allowedHost } from "./m1/host";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./local/local.css";
const lab = import.meta.env.VITE_EA_MODE === "lab";
const allowed = allowedHost(
  location.hostname,
  import.meta.env.VITE_EA_APPROVED_HOST ?? "",
);
const Component = lab
  ? (await import("./App")).default
  : (await import("./m1/App")).default;
if (allowed) createRoot(document.getElementById("root")!).render(<Component />);
else
  document.getElementById("root")!.textContent =
    "Everyday Athlete preview is not approved on this hostname. No records or service worker were opened.";
if (allowed && !lab && import.meta.env.PROD && "serviceWorker" in navigator) {
  void navigator.serviceWorker
    .register(import.meta.env.BASE_URL + "sw.js", {
      scope: import.meta.env.BASE_URL,
    })
    .catch(() => {});
}
