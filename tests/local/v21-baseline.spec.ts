// Run ONLY against immutable 89d087e via the documented baseline archive.
import {test,expect} from '@playwright/test';
for(const width of [320,390,412])test(`baseline ${width}: reproduce inherited 18px navigation gap`,async({page})=>{
 await page.setViewportSize({width,height:844});await page.goto('/');
 await expect(page.getByRole('button',{name:'Begin Workout',exact:true})).toBeVisible();
 const gap=await page.getByRole('navigation',{name:'Main navigation'}).evaluate(e=>innerHeight-e.getBoundingClientRect().bottom);
 expect(gap).toBe(18);
 await page.screenshot({path:`reports/v21-before/${width}-workout.png`,fullPage:true});
});
test('baseline restore guard rejects stale export and preserves original workspace',async({page})=>{
 await page.goto('/tests/local/m1-harness.html');await page.waitForFunction(()=>!!window.m1Test);
 const result=await page.evaluate(async()=>{
  const a=window.m1Test,initial=await a.initialize(),backup=await a.parseBackup(JSON.stringify(await a.exportBackup(initial)));
  const updated=await a.change(initial,'finish',{},d=>a.lifecycle(d,d.sessions[0],'finish',Date.now(),true));
  let reason='';try{await a.restore(updated,backup,initial.revision);}catch(e){reason=String(e);}
  return {reason,unchanged:JSON.stringify(await a.read())===JSON.stringify(updated)};
 });
 expect(result).toEqual({reason:'Error: Export current records before restore',unchanged:true});
});
