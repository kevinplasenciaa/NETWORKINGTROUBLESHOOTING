import { inPrefix, ipv4, networkACL, ospfAdjacency, policy, securityGroup, selectRoute } from './network';
import type { Attempt, Check, Field, LabState, Scenario } from './types';
export const copy=<T>(x:T):T=>structuredClone(x);
export function equivalent(a:string,b:string):boolean {
 const clean=(v:string)=>v.trim().toLowerCase().replace(/\s+/g,' ');
 if(clean(a)===clean(b)) return true;
 // Ordering of explicit VLAN, prefix and application sets is immaterial.
 if(a.includes(',')&&b.includes(',')) return a.split(',').map(clean).sort().join(',')===b.split(',').map(clean).sort().join(',');
 return false;
}
const standbyKey=(s:Scenario)=>/standby|backup|secondary|second_tunnel|ha_policy|failover|failback|backend/.test(s.key);
const auditKey=(s:Scenario)=>/audit|plan|handoff|escalation/.test(s.key);
export function behavior(s:Scenario,state:LabState,flow='application') {
 const c=state.config, correction=equivalent(c[s.key],s.good);
 const safety=c.segmentation==='enforced'&&c.policy_scope==='approved-only';
 const listener=c.service_listener==='8443';
 const dnsKey=/dns|resolver|private_record|zone_vpc|srv_record/.test(s.key);
 const actionOnly=/audit|plan|handoff|escalation/.test(s.key);
 const oct=s.ticket.assets[0].ip.split('.')[1];
 const endpointValid=inPrefix(c.endpoint_address,`10.${oct}.20.0/24`)&&c.endpoint_gateway===`10.${oct}.20.1`&&c.access_link==='up'&&c.uplink_vlans.split(',').includes('20');
 const peer={mtu:1500,area:'0',dead:40,key:'key-2026',passive:false,id:'1.1.1.1',network:'point-to-point'};
 const adjacency=ospfAdjacency({mtu:Number(c.ospf_mtu??1500),area:c.ospf_area??'0',dead:Number(c.ospf_dead??40),key:c.ospf_key??'key-2026',passive:c.ospf_passive==='on',id:c.router_id??'2.2.2.2',network:c.ospf_network_type??'point-to-point'},peer);
 const route=selectRoute(s.ticket.assets[2].ip,[{prefix:c.service_route?.split(' via ')[0]??'invalid',nextHop:c.service_route?.split(' via ')[1]??'',distance:1,metric:0,source:'static'}]);
 let mechanism=correction;
 if(s.key==='access_vlan') mechanism=c.access_vlan==='20';
 if(s.key==='trunk_allowed')mechanism=['10','20','30'].every(v=>c.trunk_allowed.split(',').includes(v));
 if(s.key==='svi_address')mechanism=c.svi_address===c.endpoint_gateway;
 if(s.key==='lacp_member')mechanism=c.lacp_member==='bundled';
 if(s.key==='root_priority')mechanism=Number(c.root_priority)>8192&&Number(c.root_priority)<=61440&&Number(c.root_priority)%4096===0;
 if(s.key.startsWith('ospf_')||s.key==='router_id')mechanism=adjacency==='FULL';
 const cloudFlow={source:c.endpoint_address,destination:s.ticket.assets[2].ip,protocol:'tcp',sourcePort:51524,destinationPort:8443};
 if(s.key==='sg_port')mechanism=securityGroup(cloudFlow,[{priority:100,action:'allow',source:`10.${oct}.20.0/24`,destination:'any',protocol:'tcp',ports:c.sg_port}]).forward;
 if(s.key==='nacl_return') {const r={priority:100,action:'allow' as const,source:'any',destination:'any',protocol:'tcp',ports:'8443'};const acl=networkACL(cloudFlow,[r],[{...r,ports:c.nacl_return}]);mechanism=acl.forward&&acl.return;}
 if(s.key==='nsg_priority')mechanism=policy(cloudFlow,[{priority:Number(c.nsg_priority),action:'allow',source:`10.${oct}.20.0/24`,destination:'any',protocol:'tcp',ports:'8443'},{priority:200,action:'deny',source:'any',destination:'any',protocol:'tcp',ports:'8443'}])==='allow';
 if(s.key==='nsg_port')mechanism=policy(cloudFlow,[{priority:100,action:'allow',source:`10.${oct}.20.0/24`,destination:'any',protocol:'tcp',ports:c.nsg_port}])==='allow';
 if(s.key==='return_route'||s.key==='vpn_return')mechanism=inPrefix(c.endpoint_address,c[s.key]);
 if(s.key==='dns_a')mechanism=ipv4(c.dns_a)!==null&&c.dns_a===s.ticket.assets[2].ip;
 const pathReady=endpointValid&&route!==null&&route.nextHop===`10.${oct}.20.1`&&c.return_path==='present'&&((standbyKey(s)&&!state.primaryDown)||actionOnly||dnsKey||mechanism);
 const backup=!state.primaryDown||c.standby_ready==='yes';
 const dns=c.dns_health==='healthy'&&c.endpoint_dns===`10.${oct}.99.53`&&(!dnsKey||mechanism);
 if(flow==='guest') return {ok:!safety,reason:safety?'Guest-to-business flow denied by segmentation.':'Guest isolation has been removed; business resources are exposed.'};
 if(flow==='management') return {ok:state.management,reason:state.management?'Restricted jump-host management is available.':'In-band management is disconnected. Use Jump host / out-of-band rollback.'};
 if(flow==='dns') return {ok:dns,reason:dns?'Authoritative private answer available.':'Private name resolution did not return a usable application record.'};
 const ok=pathReady&&backup&&(flow==='ip'||(listener&&dns));
 return {ok,reason:!pathReady?'A configuration or required action blocks the approved path.':!backup?'Standby path cannot carry the application.':!listener?'Application listener differs from the approved service.':!dns?'Name resolution blocks the application.':'Bidirectional application flow established through the approved path.'};
}
export function evidence(s:Scenario,state:LabState) {
 const b=behavior(s,state); const when=`T+${state.clock}s`;
 const detail=s.evidence.replace('{value}',state.config[s.key]);
 return `[SIMULATED · ${when} · configuration v${state.version}]\n${detail}\nForward path: endpoint → access → gateway → policy → application\nReturn path: application → gateway → endpoint\n${b.reason}\nSegmentation: ${state.config.segmentation}; scope: ${state.config.policy_scope}\nActive path: ${state.primaryDown?'standby':'primary'}; standby readiness: ${state.config.standby_ready}\nCounters: ${state.counters.sent} probes, ${state.counters.dropped} drops`;
}
export function fields(state:LabState):Field[] {
 const optionSets:Record<string,string[]>={segmentation:['enforced','disabled'],policy_scope:['approved-only','any'],management_access:['enabled','disabled'],standby_ready:['yes','no'],dns_health:['healthy','failed'],access_link:['up','down'],edge_action:['none','onsite_remove','onsite_unplug','disable_guard'],loop_action:['none','onsite_unplug','restart_server','disable_stp'],udld_action:['none','vendor_fiber_replace','disable_udld'],handoff_action:['none','onsite_cable_replace','restart_router'],rogue_dhcp_action:['none','onsite_isolate','expand_scope'],ipam_action:['none','conflict_reassigned','restart_server'],vendor_escalation:['incomplete','logs_only','logs_topology_timestamps'],isp_escalation:['incomplete','loss_latency_timestamps','reboot_requested'],handoff_record:['incomplete','evidence_hypothesis_next_steps','symptoms_only']};
 for(const key of Object.keys(state.config)){if(key.endsWith('_audit'))optionSets[key]=['undocumented','evidence_recorded','configuration_analysis_recorded'];if(['certificate_plan','wan_plan','expressroute_plan','dx_plan','firmware_plan'].includes(key))optionSets[key]=['incomplete','approved_with_rollback','approved_without_rollback'];}
 return Object.entries(state.config).map(([key,value])=>({key,options:optionSets[key],label:key.replaceAll('_',' '),value,help:key==='segmentation'?'Guest-to-business isolation must remain enforced.':key==='policy_scope'?'Approved-only keeps access within the customer authorization.':key==='management_access'?'Disabling this disconnects in-band sessions; use Jump host recovery.':'Scenario-scoped configuration value. Inspect evidence and client documentation before changing.'}));
}
export function tick(state:LabState,seconds=5) {
 state.clock+=seconds;
 // Confirmed commits automatically roll back after their deterministic deadline.
 const pending=state.events.findLast(e=>e.message.startsWith('CONFIRMED_DEADLINE:'));
 if(pending&&state.clock>=Number(pending.message.split(':')[1])&&state.candidate) {
  state.config={...state.startup}; state.candidate=null; state.version++; state.management=state.config.management_access==='enabled';
  state.events.push({time:state.clock,message:'Confirmed commit expired: restored checkpoint configuration.'});
 }
}
export function update(state:LabState,key:string,value:string,candidate=false) {
 if(!(key in state.config)) throw new Error(`Unsupported setting: ${key}. Use help for the declared scope.`);
 if(value.length>250||!value.trim()) throw new Error('Configuration values must contain 1–250 characters.');
 if(candidate) { state.candidate ??= {...state.config}; state.candidate[key]=value.trim(); }
 else {state.config[key]=value.trim();state.version++;state.management=state.config.management_access==='enabled';}
 state.events.push({time:state.clock,message:`${candidate?'Staged':'Applied'} ${key} = ${value.trim()}`});
}
export function commit(state:LabState,confirmed?:number) {
 if(!state.candidate) return 'No candidate changes.';
 if(confirmed) state.startup={...state.config};
 state.config={...state.candidate}; state.candidate=confirmed?{...state.candidate}:null;state.version++;state.management=state.config.management_access==='enabled';
 if(confirmed) state.events.push({time:state.clock,message:`CONFIRMED_DEADLINE:${state.clock+confirmed*60}`});
 else {state.startup={...state.config};state.events=state.events.filter(e=>!e.message.startsWith('CONFIRMED_DEADLINE:'));}
 return confirmed?`Commit confirmed: rolls back in ${confirmed} simulated minutes unless confirmed.`:'Commit complete. Running and saved configuration updated.';
}
export function probe(s:Scenario,state:LabState,flow:string) {
 const result=behavior(s,state,flow); state.counters.sent+=4; if(!result.ok)state.counters.dropped+=4;
 state.events.push({time:state.clock,message:`${flow}: ${result.ok?'PASS':'BLOCKED'} — ${result.reason}`});return result;
}
export function packets(s:Scenario,state:LabState,filter='') {
 const app=behavior(s,state), dns=behavior(s,state,'dns'), ip=s.ticket.assets[0].ip, server=s.ticket.assets[2].ip;
 const rows=[
  {no:1,time:state.clock+.001,source:ip,destination:s.ticket.assets[3].ip.replace(/10$/,'53'),protocol:'DNS',port:53,info:`Query A app.example.test`},
  {no:2,time:state.clock+.013,source:s.ticket.assets[3].ip.replace(/10$/,'53'),destination:ip,protocol:'DNS',port:53,info:dns.ok?`Answer A ${server}`:'SERVFAIL / no usable private answer'},
  {no:3,time:state.clock+.021,source:ip,destination:server,protocol:'TCP',port:8443,info:'51524 → 8443 [SYN]'},
  {no:4,time:state.clock+.042,source:server,destination:ip,protocol:'TCP',port:8443,info:app.ok?'8443 → 51524 [SYN, ACK]':'No response — path blocked'},
  {no:5,time:state.clock+.062,source:ip,destination:server,protocol:'TLS',port:8443,info:app.ok?'Application response: 200 OK':'Retransmission / application unavailable'},
 ];
 if(!filter.trim())return rows;
 const f=filter.trim();
 if(f==='dns')return rows.filter(r=>r.protocol==='DNS');
 if(f==='tcp')return rows.filter(r=>r.protocol==='TCP');
 if(f==='tls')return rows.filter(r=>r.protocol==='TLS');
 const port=f.match(/^tcp\.port\s*==\s*(\d+)$/);if(port)return rows.filter(r=>r.protocol==='TCP'&&r.port===Number(port[1]));
 const addr=f.match(/^ip\.addr\s*==\s*([\d.]+)$/);if(addr)return rows.filter(r=>r.source===addr[1]||r.destination===addr[1]);
 throw new Error('Unsupported capture filter. Supported: dns, tcp, tls, tcp.port == N, ip.addr == IPv4.');
}
export function acceptedOutcome(s:Scenario,st:LabState) {
 if(s.key==='root_priority')return Number(st.config.root_priority)>8192&&Number(st.config.root_priority)<=61440&&Number(st.config.root_priority)%4096===0;
 if(s.key==='nsg_priority')return Number(st.config.nsg_priority)>=100&&Number(st.config.nsg_priority)<200;
 if(s.key==='trunk_allowed')return ['10','20','30'].every(v=>st.config.trunk_allowed.split(',').includes(v))&&!st.config.trunk_allowed.split(',').includes('all');
 return equivalent(st.config[s.key],s.good);
}
export function validate(s:Scenario,a:Attempt):Check[] {
 const st=a.state, actual=acceptedOutcome(s,st), primary={...st,primaryDown:false}, standby={...st,primaryDown:true};
 const check=(id:string,name:string,pass:boolean,detail:string):Check=>({id,name,pass,detail});
 const checks=[
  check('outcome','Requested outcome / required action',actual,actual?'The bounded requested outcome is present.':'The required outcome or documented action is not established.'),
  check('application','Primary application and return path',behavior(s,primary).ok,behavior(s,primary).reason),
  check('failover','Standby / failover application test',behavior(s,standby).ok,behavior(s,standby).reason),
  check('isolation','Guest isolation regression',!behavior(s,st,'guest').ok,behavior(s,st,'guest').reason),
  check('scope','Least-privilege configuration',st.config.policy_scope==='approved-only','Access must stay within approved-only scope.'),
  check('management','Management reachability regression',st.management,behavior(s,st,'management').reason),
  check('listener','Unaffected application listener',st.config.service_listener==='8443','The approved TCP 8443 listener must be retained.'),
  check('dns','Private DNS regression',behavior(s,st,'dns').ok,behavior(s,st,'dns').reason),
 ];
 for(const c of checks) st.events.push({time:st.clock,message:`Validation: ${c.name} ${c.pass?'PASS':'FAIL'}`});
 return checks;
}
export function docScore(text:string) {
 const labels=[['symptoms',/symptom|reported|impact/i],['cause',/root cause|cause|diagnos/i],['changes',/chang|correct|applied|escalat/i],['validation',/validat|test|verif|pass/i],['follow-up',/follow.up|prevent|monitor|recommend/i]] as const;
 return {score:labels.filter(([,re])=>re.test(text)).length*4,missing:labels.filter(([,re])=>!re.test(text)).map(([k])=>k)};
}
export function scoreAttempt(a:Attempt) {
 const changed=a.actions.filter(x=>Object.keys(x.diff).length).length;
 return {diagnosis:a.hypothesis.trim().length>=30?20:5,correction:a.checks.every(c=>c.pass)?25:0,scope:Math.max(0,15-Math.max(0,changed-4)*2),validation:a.validationVersion===a.state.version?15:0,documentation:docScore(a.resolution).score,independence:a.solutionRevealed?0:Math.max(0,5-a.hints)};
}
