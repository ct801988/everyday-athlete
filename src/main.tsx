import { createRoot } from "react-dom/client";
import "./styles.css";
import "./local/local.css";
const lab = import.meta.env.VITE_EA_MODE === "lab";
const Component = lab
  ? (await import("./App")).default
  : (await import("./local/LocalApp")).default;
createRoot(document.getElementById("root")!).render(<Component />);
if (!lab && import.meta.env.PROD && "serviceWorker" in navigator) {
  void navigator.serviceWorker
    .register(import.meta.env.BASE_URL + "sw.js", {
      scope: import.meta.env.BASE_URL,
    })
    .catch(() => {});
}
