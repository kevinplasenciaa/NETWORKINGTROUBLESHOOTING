import test from 'node:test';
import assert from 'node:assert/strict';
import { scenarios, getScenario } from '../src/lib/scenarios';
import { acceptedOutcome, behavior, commit, copy, packets, tick, update, validate } from '../src/lib/engine';
import { execute } from '../src/lib/adapters';
import { inPrefix, networkACL, ospfAdjacency, policy, securityGroup, selectRoute } from '../src/lib/network';
import type { Attempt } from '../src/lib/types';
process.env.NETTASK_DATA_DIR=`/tmp/nettask-tests-${process.pid}`;
const { createAttempt, getAttempt, attemptsFor, saveAttempt }=await import('../src/lib/storage');
const { mutate, publicAttempt, bootstrap }=await import('../src/lib/service');
const owner='test-engine-owner';
function create(id:string){return createAttempt(owner,id,'Independent Lab');}
test('exact curriculum quotas and unique authored mechanisms',()=>{
 assert.equal(scenarios.length,200);assert.equal(new Set(scenarios.map(s=>s.key)).size,200);assert.equal(new Set(scenarios.map(s=>s.ticket.title)).size,200);
 for(const [category,count]of [['Switching',30],['Routing',25],['Security',35],['Network services',20],['Wireless',15],['WAN & HA',15],['Azure',25],['AWS',25],['Operations',10]]as const)assert.equal(scenarios.filter(s=>s.ticket.category===category).length,count);
 for(const [level,count]of [['Foundational',70],['Intermediate',90],['Advanced',40]]as const)assert.equal(scenarios.filter(s=>s.ticket.difficulty===level).length,count);
 for(const [kind,count]of [['Incident',130],['Change request',50],['Maintenance',20]]as const)assert.equal(scenarios.filter(s=>s.ticket.kind===kind).length,count);
});
for(const s of scenarios)test(`${s.ticket.id}: initial fails, correction passes, unsafe shortcuts fail, reset isolates`,()=>{
 const a=create(s.ticket.id);assert.ok(validate(s,a).some(c=>!c.pass),'Initial requested outcome must not already be complete');
 update(a.state,s.key,s.good);assert.ok(validate(s,a).every(c=>c.pass),JSON.stringify(validate(s,a).filter(c=>!c.pass)));
 update(a.state,'segmentation','disabled');assert.equal(validate(s,a).find(c=>c.id==='isolation')?.pass,false,'Allow-all must not pass');
 update(a.state,'segmentation','enforced');update(a.state,'policy_scope','any');assert.equal(validate(s,a).find(c=>c.id==='scope')?.pass,false);
 a.state=copy(s.initial);assert.equal(a.state.config[s.key],s.bad);
 const b=create(s.ticket.id);update(a.state,s.key,s.good);assert.equal(b.state.config[s.key],s.bad,'Attempts must not share state');
 saveAttempt(owner,a);assert.equal(getAttempt(owner,a.id).state.config[s.key],s.good,'SQLite must retain changes');
});
test('route selection uses longest prefix before distance and metric',()=>{
 const route=selectRoute('10.1.2.3',[{prefix:'0.0.0.0/0',nextHop:'default',distance:1,metric:0,source:'static'},{prefix:'10.1.0.0/16',nextHop:'ospf',distance:110,metric:10,source:'ospf'},{prefix:'10.1.2.0/24',nextHop:'specific',distance:200,metric:50,source:'static'}]);assert.equal(route?.nextHop,'specific');assert.equal(inPrefix('10.1.2.3','10.1.2.0/24'),true);assert.equal(inPrefix('10.1.3.1','10.1.2.0/24'),false);
});
test('AWS SG stateful return differs from stateless NACL',()=>{
 const flow={source:'10.24.20.25',destination:'10.24.20.18',protocol:'tcp',sourcePort:51524,destinationPort:8443};const rule={priority:100,action:'allow' as const,source:'10.24.20.0/24',destination:'any',protocol:'tcp',ports:'8443'};
 assert.deepEqual([securityGroup(flow,[rule]).forward,securityGroup(flow,[rule]).return],[true,true]);assert.deepEqual(networkACL(flow,[rule],[rule]),{forward:true,return:false});assert.deepEqual(networkACL(flow,[rule],[{...rule,source:'any',ports:'1024-65535'}]),{forward:true,return:true});
});
test('ordered policy honors the first matching rule',()=>{
 const f={source:'10.24.20.25',destination:'10.24.20.18',protocol:'tcp',sourcePort:51524,destinationPort:8443};const r={priority:200,action:'deny' as const,source:'any',destination:'any',protocol:'tcp',ports:'8443'};assert.equal(policy(f,[r,{...r,priority:100,action:'allow'}]),'allow');assert.equal(policy(f,[r,{...r,priority:300,action:'allow'}]),'deny');
});
test('DNS incident allows IP probe but blocks DNS-based application access',()=>{
 const s=getScenario('NT-0094'),a=create(s.ticket.id);assert.equal(behavior(s,a.state,'ip').ok,true);assert.equal(behavior(s,a.state,'dns').ok,false);assert.equal(behavior(s,a.state).ok,false);update(a.state,s.key,s.good);assert.equal(behavior(s,a.state).ok,true);assert.ok(packets(s,a.state,'tcp').some(p=>p.info.includes('SYN, ACK')));assert.throws(()=>packets(s,a.state,'http contains foo'),/Unsupported/);
});
test('OSPF models EXSTART separately from Hello mismatch',()=>{
 const p={mtu:1500,area:'0',dead:40,key:'key-2026',passive:false,id:'1.1.1.1',network:'point-to-point'};assert.equal(ospfAdjacency({...p,id:'2.2.2.2',mtu:1400},p),'EXSTART');assert.match(ospfAdjacency({...p,id:'2.2.2.2',area:'1'},p),/DOWN/);
});
test('12 representative CLI/GUI journeys share state and honor commit',()=>{
 const ids=['NT-0001','NT-0002','NT-0031','NT-0056','NT-0059','NT-0062','NT-0064','NT-0094','NT-0111','NT-0141','NT-0166','NT-0177'];
 for(const id of ids){const s=getScenario(id),a=create(id),edge={id:crypto.randomUUID(),device:'edge',mode:'exec',history:[]};a.sessions.push(edge);execute(s,a,edge,'lab inspect');
  if(id==='NT-0001'){execute(s,a,edge,'enable');execute(s,a,edge,'configure terminal');execute(s,a,edge,'interface GigabitEthernet1/0/1');execute(s,a,edge,'switchport access vlan 20');}
  else if(id==='NT-0056'){execute(s,a,edge,'enable');execute(s,a,edge,'configure terminal');execute(s,a,edge,'crypto ikev2 enable outside');}
  else {if(/Junos|PAN-OS/.test(s.ticket.assets[1].os))execute(s,a,edge,'configure');execute(s,a,edge,`lab set ${s.key} ${s.good}`);}
  if(/Junos|PAN-OS/.test(s.ticket.assets[1].os)){assert.equal(a.state.config[s.key],s.bad);assert.equal(a.state.candidate?.[s.key],s.good);execute(s,a,edge,'commit');}
  assert.equal(a.state.config[s.key],s.good);assert.ok(validate(s,a).every(c=>c.pass),id);
  assert.match(execute(s,a,edge,'unsupported-real-device-command'),/Unsupported/);
  saveAttempt(owner,a);let result=mutate(owner,a.id,{action:'configure',key:'service_listener',value:'9999'});if(/Junos|PAN-OS/.test(s.ticket.assets[1].os)){assert.equal(result.attempt.health.ok,true,'Candidate must not affect live traffic');result=mutate(owner,a.id,{action:'commit'});}assert.equal(result.attempt.health.ok,false);
 }
});
test('candidate, confirmed commit timeout, and OOB management recovery',()=>{
 const s=getScenario('NT-0062'),a=create(s.ticket.id),v=a.state.version;update(a.state,s.key,s.good,true);assert.equal(a.state.version,v);commit(a.state,1);assert.equal(a.state.config[s.key],s.good);tick(a.state,61);assert.equal(a.state.config[s.key],s.bad);
 const backed=mutate(owner,a.id,{action:'backup'}).attempt;const cp=backed.checkpoints[0];mutate(owner,a.id,{action:'configure',key:'management_access',value:'disabled'});const staged=getAttempt(owner,a.id);assert.equal(staged.state.candidate?.management_access,'disabled');mutate(owner,a.id,{action:'commit'});assert.equal(getAttempt(owner,a.id).state.management,false);const restored=mutate(owner,a.id,{action:'rollback',value:cp.id}).attempt;assert.equal(restored.state.management,true);
});
test('alternative safe STP priorities and NSG ordering are accepted',()=>{
 const s=getScenario('NT-0005'),a=create(s.ticket.id);update(a.state,'root_priority','40960');assert.equal(acceptedOutcome(s,a.state),true);assert.ok(validate(s,a).every(c=>c.pass));
 const az=getScenario('NT-0141'),b=create(az.ticket.id);update(b.state,'nsg_priority','150');assert.ok(validate(az,b).every(c=>c.pass));
});
test('change approval, maintenance windows and stale validation are enforced',()=>{
 const s=scenarios.find(s=>s.ticket.kind==='Change request')!,a=create(s.ticket.id);assert.throws(()=>mutate(owner,a.id,{action:'configure',key:s.key,value:s.good}),/Approval/);
 mutate(owner,a.id,{action:'plan',plan:{impact:'Only the approved affected customer service changes.',steps:'Back up and apply the scoped intended configuration.',rollback:'Restore the configuration checkpoint using OOB access.',postChecks:'Test primary and standby paths and guest isolation.'}});mutate(owner,a.id,{action:'approve'});mutate(owner,a.id,{action:'window'});mutate(owner,a.id,{action:'configure',key:s.key,value:s.good});mutate(owner,a.id,{action:'validate'});mutate(owner,a.id,{action:'configure',key:'service_listener',value:'9999'});assert.throws(()=>mutate(owner,a.id,{action:'resolve'}),/latest configuration/);
});
test('reference causes, targets, hints and grading logic stay out of initial payloads',()=>{
 const s=getScenario('NT-0001'),a=create(s.ticket.id),payload=publicAttempt(a);assert.equal('solution'in payload,false);assert.deepEqual(payload.hintTexts,[]);assert.equal('good'in payload,false);assert.equal('explanation'in payload,false);assert.equal('initial'in bootstrap(owner).tickets[0],false);assert.ok(!JSON.stringify(payload).includes(s.explanation));
});
test('completion requires diagnosis, validation, documentation and debrief; unaided remains unaided',()=>{
 const s=getScenario('NT-0001'),a=create(s.ticket.id);mutate(owner,a.id,{action:'configure',key:s.key,value:s.good});mutate(owner,a.id,{action:'validate'});assert.throws(()=>mutate(owner,a.id,{action:'resolve'}),/hypothesis/);mutate(owner,a.id,{action:'hypothesis',value:'The desk move placed the finance endpoint in a different VLAN than its gateway.'});
 mutate(owner,a.id,{action:'resolution',value:'Symptoms: finance workstation could not access the application after its desk move. Root cause: access VLAN did not match the finance gateway. Changes: restored VLAN 20 on the endpoint-facing port only. Validation evidence: primary, failover, DNS, listener and guest isolation checks passed. Follow-up: update the move checklist and monitor the port.'});mutate(owner,a.id,{action:'debrief',value:'Matching the access VLAN to the gateway restores layer-two reachability. Allowing all traffic would remove segmentation without fixing the broadcast-domain mismatch.'});const done=mutate(owner,a.id,{action:'resolve'}).attempt;assert.equal(done.status,'Resolved');assert.equal(done.score?.independence,5);assert.equal(done.solutionRevealed,false);assert.ok(done.solution);
 const assisted=create(s.ticket.id);mutate(owner,assisted.id,{action:'hint'});mutate(owner,assisted.id,{action:'reveal'});assert.equal(getAttempt(owner,assisted.id).solutionRevealed,true);
});
test('owners cannot read or mutate another browser identity’s attempts',()=>{const a=create('NT-0001');assert.throws(()=>getAttempt('different-owner',a.id),/not found/);assert.equal(attemptsFor('different-owner').length,0);});
test('all 200 seeded labs are playable through the persistence/service mutation path',()=>{
 for(const s of scenarios){const a=create(s.ticket.id);const id=a.id;
  if(s.ticket.kind!=='Incident'){mutate(owner,id,{action:'plan',plan:{impact:'Only the authorized customer service is in scope.',steps:'Take a checkpoint and implement the bounded requested change.',rollback:'Restore the tested checkpoint through out-of-band recovery.',postChecks:'Test the application, return path, DNS, failover and guest isolation.'}});mutate(owner,id,{action:'approve'});mutate(owner,id,{action:'window'});}
  mutate(owner,id,{action:'backup'});mutate(owner,id,{action:'configure',key:s.key,value:s.good});
  if(/Junos|PAN-OS/.test(s.ticket.assets[1].os))mutate(owner,id,{action:'commit'});
  const checked=mutate(owner,id,{action:'validate'}).attempt;assert.ok(checked.checks.every(c=>c.pass),s.ticket.id);
  const reset=mutate(owner,id,{action:'reset'}).attempt;assert.equal(reset.state.config[s.key],s.bad);assert.ok(mutate(owner,id,{action:'validate'}).attempt.checks.some(c=>!c.pass));
 }
});
test('export includes a diagram and escapes user-provided notes',async()=>{
 const {reportHTML}=await import('../src/lib/report');const a=create('NT-0001');a.resolution='<script>alert(1)</script>';const html=reportHTML(a,getScenario(a.ticketId).ticket);assert.ok(html.includes('SIMULATED LAB PROJECT'));assert.ok(html.includes('<svg'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));
});
test('shift clock, interruptions and client KB corrections persist independently',()=>{
 const a=createAttempt(owner,'NT-0001','Shift Mode');for(let i=0;i<12;i++)mutate(owner,a.id,{action:'note',value:`Observation ${i}`});
 const before=bootstrap(owner).preferences;assert.equal(before.shift.clock,60);assert.equal(before.shift.events.length,2);
 mutate(owner,a.id,{action:'kb',value:'Evidence-based correction: the desk move changed the endpoint VLAN; the server restart assumption was not verified.'});assert.ok(bootstrap(owner).preferences.kb.C1.text.includes('desk move'));
});
