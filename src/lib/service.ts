import { reportHTML } from './report';
import { monitoring } from './evidence';
import { z } from 'zod';
import { clients, getScenario, scenarios } from './scenarios';
import { attemptsFor, createAttempt, getAttempt, preferences, saveAttempt, savePreferences } from './storage';
import { commandHelp, execute } from './adapters';
import { behavior, commit, copy, docScore, evidence, fields, packets, scoreAttempt, tick, update, validate } from './engine';
import type { Attempt, Mode, Status } from './types';
export const modes=['Guided Study','Independent Lab','Shift Mode']as const;
const bodySchema=z.object({action:z.string().max(40),value:z.string().max(12000).optional(),key:z.string().max(100).optional(),sessionId:z.string().uuid().optional(),kind:z.string().max(50).optional(),name:z.string().max(120).optional(),minutes:z.number().int().min(1).max(480).optional(),plan:z.object({impact:z.string().max(4000),steps:z.string().max(4000),rollback:z.string().max(4000),postChecks:z.string().max(4000)}).optional()});
export function publicAttempt(a:Attempt){return {...a,fields:fields(a.state),evidence:evidence(getScenario(a.ticketId),a.state),health:behavior(getScenario(a.ticketId),a.state),monitoring:monitoring(getScenario(a.ticketId),a.state),documentation:docScore(a.resolution),hintTexts:getScenario(a.ticketId).hints.slice(0,Math.min(4,a.hints)),...((a.solutionRevealed||a.debriefUnlocked||a.status==='Resolved')?{solution:solution(a.ticketId)}:{})};}
function solution(ticketId:string){const s=getScenario(ticketId);return {rootCause:s.explanation,correction:`${s.key} = ${s.good}`,evidence:s.evidence.replace('{value}',s.bad),why:`${s.explanation} Validate the primary and standby paths and retain the exact authorized scope.`,alternatives:'Broad allow rules, disabling segmentation, bypassing authentication or ignoring the return path can hide the symptom while violating the customer requirements. A successful primary test alone cannot establish failover readiness.',prevention:'Back up the reviewed configuration, record ownership and intended values, monitor the affected service, and include the regression suite in future changes.'};}
export function bootstrap(owner:string){const attempts=attemptsFor(owner);const counts=new Map<string,number>();for(const a of attempts)for(const e of a.state.events){if(e.message.startsWith('Validation:')&&e.message.endsWith('FAIL')){const name=e.message.replace('Validation: ','').replace(' FAIL','');counts.set(name,(counts.get(name)??0)+1);}}const mistakes=[...counts].map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count);return {analytics:{mistakes},tickets:scenarios.map(s=>s.ticket),clients,attempts:attempts.map(a=>({id:a.id,ticketId:a.ticketId,status:a.status,mode:a.mode,hints:a.hints,solutionRevealed:a.solutionRevealed,score:a.score,clock:a.state.clock,createdAt:a.createdAt})),preferences:preferences(owner),majorIncident:{id:'MI-2026-01',title:'Correlated post-maintenance service interruptions',description:'Three customer tickets arrived after a shared managed-service maintenance. Correlate timelines, collect each path failure and coordinate updates. Each lab remains isolated; there is no simulated cross-tenant forwarding.',tickets:['NT-0001','NT-0031','NT-0136']}};}
export function start(owner:string,ticketId:string,mode:unknown){return publicAttempt(createAttempt(owner,ticketId,z.enum(modes).parse(mode)));}
export function read(owner:string,id:string){return publicAttempt(getAttempt(owner,id));}
export function setMode(owner:string,mode:unknown){savePreferences(owner,{...preferences(owner),mode:z.enum(modes).parse(mode)});return {ok:true};}
export function mutate(owner:string,id:string,input:unknown){
 const b=bodySchema.parse(input),a=getAttempt(owner,id),s=getScenario(a.ticketId),before=copy(a.state.config),out:{text?:string;packets?:unknown;report?:unknown}={};
 if(a.status==='Resolved'&&!['reopen','reset','export','packets','reveal'].includes(b.action))throw new Error('This attempt is resolved. Reopen it to continue making changes.');
 const value=b.value??'';let text='';
 const gate=()=>{if(s.ticket.kind!=='Incident'&&(!a.plan.approved||!a.plan.window))throw new Error('Approval and a maintenance window are required before changing the lab.');};
 tick(a.state);
 switch(b.action){
 case 'command': {if(value.length>500)throw new Error('Command limit is 500 characters.');const session=a.sessions.find(x=>x.id===b.sessionId);if(!session)throw new Error('Session not found');text=execute(s,a,session,value);session.history.push({command:value,output:text});session.history=session.history.slice(-150);break;}
 case 'session':{const device=s.ticket.assets.find(x=>x.id===value);if(!device)throw new Error('Unknown device');if(a.sessions.length>=8)throw new Error('Maximum eight sessions per attempt.');a.sessions.push({id:crypto.randomUUID(),device:device.id,mode:'exec',history:[]});text=`Opened ${device.name} simulated session.`;break;}
 case 'configure':gate();if(!a.state.management && b.kind!=='out-of-band')throw new Error('In-band management is unavailable. Use the Jump host recovery console.');update(a.state,b.key??'',value,/Junos|PAN-OS/.test(s.ticket.assets[1].os));text='Configuration updated; inspect running/candidate state and validate.';break;
 case 'commit':gate();text=commit(a.state);break;
 case 'save':a.state.startup={...a.state.config};text='Startup configuration saved.';break;
 case 'note':if(!value.trim())throw new Error('Note cannot be empty.');a.notes.push({id:crypto.randomUUID(),time:a.state.clock,kind:b.kind==='Customer update'?'Customer update':'Internal note',text:value});text='Note added.';break;
 case 'hypothesis':a.hypothesis=value;text='Hypothesis saved.';break;
 case 'plan':if(!b.plan)throw new Error('Plan required');a.plan={...b.plan,approved:false,window:false};text='Change plan saved. Any prior approval has been revoked.';break;
 case 'approve':if(Object.values(a.plan).slice(0,4).some(v=>typeof v!=='string'||v.length<15))throw new Error('Add an impact statement, implementation steps, rollback and post-change checks (at least 15 characters each).');a.plan.approved=true;text='Simulated change manager approved this bounded plan.';break;
 case 'window':if(!a.plan.approved)throw new Error('Approve the plan first.');a.plan.window=true;text='Simulated maintenance window opened.';break;
 case 'backup':if(a.checkpoints.length>=30)throw new Error('Maximum 30 checkpoints; reset for a clean lab.');a.checkpoints.push({id:crypto.randomUUID(),name:b.name||`Checkpoint ${a.checkpoints.length+1}`,state:copy(a.state)});text='Configuration checkpoint backed up.';break;
 case 'rollback':{const cp=a.checkpoints.find(c=>c.id===value);if(!cp)throw new Error('Checkpoint not found');const version=a.state.version;a.state=copy(cp.state);a.state.version=version+1;text='Checkpoint restored through out-of-band recovery.';break;}
 case 'validate':a.checks=validate(s,a);a.validationVersion=a.state.version;text=`${a.checks.filter(c=>c.pass).length}/${a.checks.length} checks passed.`;break;
 case 'failover':a.state.primaryDown=!a.state.primaryDown;a.state.version++;text=evidence(s,a.state);break;
 case 'packets':out.packets=packets(s,a.state,value);text='Capture generated from the current lab state.';break;
 case 'hint':a.hints=Math.min(4,a.hints+1);text=s.hints[Math.max(0,a.hints-1)];break;
 case 'reveal':a.solutionRevealed=true;text='Reference solution revealed. This attempt is recorded as assisted.';break;
 case 'interact':{
  const allowed=['Customer','Onsite technician','ISP','Vendor','Senior engineer'];if(!allowed.includes(value))throw new Error('Unknown contact');
  const responses:Record<string,string>={Customer:`${s.ticket.client.contact}: The issue affects ${s.ticket.client.sites[0]}. The approved application is on TCP 8443. A coworker blamed the server, but we have not confirmed that.`, 'Onsite technician':`I checked the asset labels and cabling. Current observed evidence: ${s.evidence.replace('{value}',a.state.config[s.key])}. An authorized onsite action can be recorded in the shared configuration console.`,ISP:`The edge handoff test is timestamped T+${a.state.clock}s. Please attach path probes and interface evidence. We will only perform the scenario's approved carrier action.`,Vendor:`Please provide logs, topology, timestamps, affected version (${s.ticket.assets[1].os}) and bounded reproduction steps. Current observable state: ${s.evidence.replace('{value}',a.state.config[s.key])}.`,'Senior engineer':`Separate name resolution, forwarding, return path and policy checks. Keep the guest boundary and test the standby path. Explain your hypothesis before changing configuration.`};text=responses[value];a.notes.push({id:crypto.randomUUID(),time:a.state.clock,kind:value,text});break;}
 case 'kb':if(value.trim().length<20)throw new Error('Write an evidence-based correction of at least 20 characters.');{const pref=preferences(owner);savePreferences(owner,{...pref,kb:{...pref.kb,[s.ticket.client.id]:{text:value,time:a.state.clock,ticketId:a.ticketId}}});a.notes.push({id:crypto.randomUUID(),time:a.state.clock,kind:'Knowledge base correction',text:value});text='Client knowledge base correction saved.';}break;
 case 'attachment':if(!value.trim()||!b.name)throw new Error('Attachment name and text required');a.attachments.push({id:crypto.randomUUID(),name:b.name,text:value});text='Text evidence attachment stored.';break;
 case 'time':if(!b.minutes)throw new Error('Positive minutes required');a.timeEntries.push({minutes:b.minutes,description:value});text='Time entry recorded.';break;
 case 'status':{const statuses:Status[]=['New','In Progress','Waiting on Customer','Waiting on Vendor','Reopened'];if(!statuses.includes(value as Status))throw new Error('Use the Resolve workflow for completion.');a.status=value as Status;text=`Status changed to ${value}.`;break;}
 case 'assign':a.assignee=value.slice(0,100)||'You';text='Assignment saved.';break;
 case 'resolution':a.resolution=value;text='Resolution draft saved.';break;
 case 'debrief':a.debrief=value;text='Interview response saved.';break;
 case 'resolve':{
  if(a.validationVersion!==a.state.version||!a.checks.length||!a.checks.every(c=>c.pass))throw new Error('Run the full Validation suite on the latest configuration and pass all behavior/constraint checks.');
  if(a.hypothesis.trim().length<30)throw new Error('Record a diagnosis hypothesis of at least 30 characters.');
  if(docScore(a.resolution).score<20||a.resolution.length<150)throw new Error('Resolution needs symptoms, root cause, changes, validation evidence and follow-up (at least 150 characters).');
  if(a.debrief.trim().length<40)throw new Error('Explain why your correction works and why a broader shortcut would be unsafe (at least 40 characters).');
  a.score=scoreAttempt(a);a.status='Resolved';a.debriefUnlocked=true;text='Ticket resolved. Debrief unlocked; independence score reflects help used before completion.';break;}
 case 'reopen':a.status='Reopened';text='Ticket reopened; previous evidence retained.';break;
 case 'reset':{const seq=a.actions.length,version=a.state.version;a.state=copy(s.initial);a.state.version=version+1;if(a.debriefUnlocked)a.solutionRevealed=true;a.checks=[];a.validationVersion=-1;a.status='In Progress';a.score=null;a.sessions.forEach(x=>{x.mode='exec';});text=`Lab reset. Assistance and action history retained (${seq} actions). Start a new attempt for an unaided score.`;break;}
 case 'export':out.report={...report(a),html:reportHTML(a,s.ticket)};text='Report generated.';break;
 default:throw new Error('Unsupported action');
 }
 if(a.actions.length>=3000)throw new Error('Attempt action limit reached. Start a new attempt.');
 const diff:Record<string,{before:string;after:string}>={};for(const key of Object.keys(before))if(before[key]!==a.state.config[key])diff[key]={before:before[key],after:a.state.config[key]};
 a.actions.push({seq:a.actions.length+1,time:a.state.clock,type:b.action,input:value||b.key||'',output:text,diff});
 if(a.mode==='Shift Mode'){
  const pref=preferences(owner);const shift=pref.shift??{clock:0,events:[]};shift.clock+=b.action==='command'?10:5;
  const messages=[{time:30,ticketId:'NT-0031',message:'Customer callback: branch routing interruption now affects remote staff.'},{time:60,ticketId:'NT-0136',message:'Major incident correlation: multiple post-maintenance alerts need a coordinated update.'},{time:120,ticketId:'NT-0059',message:'Vendor requests topology, logs and timestamps for the open application case.'},{time:180,ticketId:'NT-0001',message:'Technician handoff: next engineer needs your current evidence and hypothesis.'}];
  for(const event of messages)if(shift.clock>=event.time&&!shift.events.some((e:{time:number})=>e.time===event.time))shift.events.push(event);
  savePreferences(owner,{...pref,shift});
 }
 saveAttempt(owner,a);return {attempt:publicAttempt(a),...out,text};
}
export function report(a:Attempt){const s=getScenario(a.ticketId);return {label:'SIMULATED LAB PROJECT — not production experience',ticket:s.ticket,attempt:{id:a.id,mode:a.mode,status:a.status,elapsedSeconds:a.state.clock,hints:a.hints,score:a.score,hypothesis:a.hypothesis,resolution:a.resolution,debrief:a.debrief},topology:s.ticket.assets.map(x=>({name:x.name,role:x.role,ip:x.ip})),changes:a.actions.filter(x=>Object.keys(x.diff).length),validation:a.checks,notes:a.notes,attachments:a.attachments};}
export { commandHelp };
