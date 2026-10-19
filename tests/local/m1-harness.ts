import * as storage from "../../src/m1/storage";
import * as model from "../../src/m1/model";
import * as legacy from "../../src/local/model";
import * as legacyStorage from "../../src/local/store";
import * as actions from "../../src/m1/actions";
import * as units from "../../src/m1/units";
const api = {
  ...actions,
  ...units,
  ...storage,
  ...model,
  legacy,
  legacyStorage,
};
declare global {
  interface Window {
    m1Test: typeof api;
  }
}
window.m1Test = api;
