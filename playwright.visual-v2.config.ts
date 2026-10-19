import { defineConfig } from '@playwright/test';
import m1 from './playwright.m1.config';
export default defineConfig({ ...m1, testMatch: 'visual-v2.spec.ts', reporter: [['list'], ['json', {outputFile:'reports/visual-v2/results.json'}]] });
