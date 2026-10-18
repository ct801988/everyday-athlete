// Included only in the separate local test build, never the delivered app build.
import * as storage from "../../src/local/store";
import * as model from "../../src/local/model";
import * as commands from "../../src/local/commands";
import * as backup from "../../src/local/backup";
const api = { ...storage, ...model, ...commands, ...backup };
declare global {
  interface Window {
    eaTest: typeof api;
  }
}
window.eaTest = api;
