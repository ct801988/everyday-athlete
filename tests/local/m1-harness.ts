import * as storage from "../../src/m1/storage";
import * as model from "../../src/m1/model";
import * as legacy from "../../src/local/model";
import * as legacyStorage from "../../src/local/store";
const api = { ...storage, ...model, legacy, legacyStorage };
declare global {
  interface Window {
    m1Test: typeof api;
  }
}
window.m1Test = api;
