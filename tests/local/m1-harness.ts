import * as storage from "../../src/m1/storage";
import * as model from "../../src/m1/model";
import * as legacy from "../../src/local/model";
const api = { ...storage, ...model, legacy };
declare global {
  interface Window {
    m1Test: typeof api;
  }
}
window.m1Test = api;
