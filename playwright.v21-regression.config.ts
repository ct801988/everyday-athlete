import {defineConfig} from '@playwright/test';
import local from './playwright.local.config';
export default defineConfig({...local,testMatch:['m1-ui.spec.ts','m1-storage.spec.ts','visual-v2.spec.ts','m1-units.spec.ts','v21.spec.ts'],reporter:[['list'],['json',{outputFile:'reports/v21/regression-results.json'}]]});
