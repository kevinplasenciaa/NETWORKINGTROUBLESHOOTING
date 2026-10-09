import { test, expect } from '@playwright/test';

test('engineer completes a switching incident through CLI, GUI, validation and reload',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{name:'A good shift starts here.'})).toBeVisible();
 await page.getByRole('button',{name:'Open ticket queue'}).click();
 await page.getByRole('textbox',{name:'Search tickets'}).fill('NT-0001');
 await page.locator('tbody tr').click();await expect(page.getByRole('heading',{name:'Finance workstation offline after a desk move'})).toBeVisible();
 await page.getByPlaceholder('What do you think is failing, and what evidence would confirm it?').fill('The endpoint access VLAN appears inconsistent with its finance gateway after the desk move.');
 await page.getByRole('button',{name:'Save hypothesis'}).click();await expect(page.getByRole('status')).toContainText('Hypothesis saved');
 await page.getByRole('tab',{name:'Tools',exact:true}).click();
 await page.getByLabel('New session device').selectOption('edge');await page.getByRole('button',{name:'New session',exact:true}).click();
 const input=page.getByRole('textbox',{name:'Terminal command'});
 for(const cmd of ['enable','configure terminal','interface GigabitEthernet1/0/1','switchport access vlan 20','end','copy running-config startup-config','lab inspect']){await input.fill(cmd);await input.press('Enter');await expect(input).toHaveValue('');}
 await expect(page.locator('#cfg-access_vlan')).toHaveValue('20');
 await page.getByRole('button',{name:'Capture',exact:true}).click();await expect(page.locator('.packet-table')).toContainText('SYN, ACK');
 await page.getByRole('tab',{name:'Validation',exact:true}).click();await page.getByRole('button',{name:'Run full validation'}).click();await expect(page.locator('.check-row.pass')).toHaveCount(8);
 await page.getByRole('textbox',{name:'Symptoms · root cause · changes · validation evidence · follow-up'}).fill('Symptoms: finance workstation could not reach the business application after a desk move. Root cause: the endpoint access VLAN differed from its gateway. Changes: restored VLAN 20 on the access port and saved startup configuration. Validation evidence: all eight primary, standby, isolation, DNS, listener and management tests passed. Follow-up: update the desk-move checklist and monitor the port.');
 await page.getByRole('button',{name:'Save resolution draft'}).click();
 await page.getByRole('textbox',{name:'Interview debrief: defend your engineering decision'}).fill('Restoring the assigned VLAN makes the endpoint and gateway share a broadcast domain. Broad firewall rules would not repair this L2 fault and would weaken segmentation.');
 await page.getByRole('button',{name:'Save debrief',exact:true}).click();await page.getByRole('button',{name:'Resolve ticket',exact:true}).click();await expect(page.getByRole('heading',{name:'Engineering debrief'})).toBeVisible();
 await page.reload();await page.getByRole('button',{name:'My skills',exact:true}).click();await expect(page.getByRole('button',{name:/NT-0001 · Resolved/})).toBeVisible();await page.getByRole('button',{name:/NT-0001 · Resolved/}).click();await page.getByRole('tab',{name:'Validation',exact:true}).click();await expect(page.locator('.score-card')).toContainText('100');
 await page.getByRole('tab',{name:'Replay',exact:true}).click();await expect(page.locator('.replay-row')).not.toHaveCount(0);await expect(page.locator('.replay-row')).toContainText(['command']);
});

test('GUI and cloud CLI see the same state and unsafe access fails regression',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Open ticket queue'}).click();await page.getByRole('textbox',{name:'Search tickets'}).fill('NT-0166');await page.locator('tbody tr').click();await page.getByRole('tab',{name:'Tools',exact:true}).click();
 await page.locator('#cfg-sg_port').fill('8443');await page.locator('.config-field').filter({has:page.locator('#cfg-sg_port')}).getByRole('button',{name:'Apply',exact:true}).click();
 await page.getByLabel('New session device').selectOption('edge');await page.getByRole('button',{name:'New session',exact:true}).click();await page.getByRole('textbox',{name:'Terminal command'}).fill('aws ec2 describe-security-groups');await page.getByRole('textbox',{name:'Terminal command'}).press('Enter');await expect(page.locator('.terminal-output')).toContainText('"sg_port": "8443"');
 await page.locator('#cfg-segmentation').selectOption('disabled');await page.locator('.config-field').filter({has:page.locator('#cfg-segmentation')}).getByRole('button',{name:'Apply',exact:true}).click();await page.getByRole('tab',{name:'Validation',exact:true}).click();await page.getByRole('button',{name:'Run full validation'}).click();await expect(page.locator('.check-row.fail')).toContainText('Guest isolation regression');await page.reload();await page.getByRole('button',{name:'Open ticket queue'}).click();await page.getByRole('textbox',{name:'Search tickets'}).fill('NT-0166');await page.locator('tbody tr').click();await page.getByRole('tab',{name:'Tools',exact:true}).click();await expect(page.locator('#cfg-segmentation')).toHaveValue('disabled');
});

test('new browser identities have isolated progress and mobile navigation works',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();await page.goto('/');await expect(page.getByRole('heading',{name:'A good shift starts here.'})).toBeVisible();await page.getByRole('button',{name:'Open ticket queue'}).click();await page.getByRole('textbox',{name:'Search tickets'}).fill('NT-0001');await expect(page.locator('tbody tr')).toHaveCount(1);await expect(page.locator('tbody tr')).toContainText('New');await page.screenshot({path:'/tmp/nettask-mobile.png',fullPage:true});await context.close();
});
