import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';
for (const width of [320, 390, 412]) {
  test(`V2 card review and interactions at ${width}px`, async ({page}) => {
    await page.setViewportSize({width, height:844});
    await page.goto('/');
    await expect(page.locator('.exercise-card')).toHaveCount(6);
    const shot = async (name: string, fullPage = false) => page.screenshot({path:`reports/visual-v2/${width}-${name}.png`,fullPage});
    const first = page.locator('.exercise-card').first();
    await shot('01-expanded');
    await shot('02-continuous',true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([]);
    await first.locator('.target-explanation summary').click();
    await expect(first.getByText(/Synthetic prescription; no recommended weight/)).toBeVisible();
    await first.locator('.target-explanation summary').click();
    await page.getByRole('button',{name:'Begin Workout',exact:true}).click();
    for(let i=1;i<=3;i++) {
      await first.getByLabel(`Demo dumbbell press set ${i} weight`,{exact:true}).fill('25');
      await first.getByLabel(`Demo dumbbell press set ${i} reps`,{exact:true}).fill('8');
      await first.getByRole('button',{name:'Done',exact:true}).first().click();
      await expect(first.getByRole('button',{name:'Undo',exact:true})).toHaveCount(i);
    }
    await expect(first).toHaveClass(/card-complete/);
    await first.locator('.exercise-title').click();
    await page.evaluate(()=>scrollTo(0,0));
    await shot('03-completed-collapsed');
    await first.locator('.exercise-title').click();
    await expect(first.getByLabel('Demo dumbbell press set 1 weight',{exact:true})).toHaveValue('25');
    await first.getByRole('button',{name:'Undo',exact:true}).first().click();
    await expect(first).not.toHaveClass(/card-complete/);
    const timed = page.locator('.exercise-card').filter({has:page.locator('input[aria-label$="set 1 seconds"]')}).first();
    await timed.scrollIntoViewIfNeeded();
    await shot('04-timed');
    const timer = page.locator('.rest-dock');
    const nav = page.locator('.bottom-nav');
    const t = await timer.boundingBox(); const n=await nav.boundingBox();
    expect(t && n && t.y+t.height<=n.y).toBeTruthy();
    await page.evaluate(()=>scrollTo(0,0));
    await shot('05-timer-clearance');
  });
}
