import { resources } from './resources';
import { scenarioSchema } from './scenario-schema';
import { subjects } from './symptoms';
import { z } from 'zod';
import { authored, categories } from './catalogue';
import type { Asset, Category, Client, LabState, Scenario } from './types';
const names = [
['Meridian Logistics','Warehouse','ML','#e8a65f','North depot,South depot,Dispatch','Ana Torres'],
['Northstar Family Care','Clinic','NC','#e48297','Main clinic,Imaging annex','Dr. Patel'],
['Cedar Grove Academy','School','CA','#86a8ef','Campus,Library,Admin','Sam Reed'],
['Atlas Architecture','Office','AA','#b59bea','Studio,Remote office','Jordan Ellis'],
['Harbor Finance','Office','HF','#78cbbd','Head office,Branch office','Morgan Lee'],
['Summit Manufacturing','Warehouse','SM','#dfae75','Plant,Distribution,Engineering','Alex Chen'],
['Brightwell Community','Nonprofit','BC','#ed95ba','Community center,Outreach','Riley James'],
['Evergreen Legal','Office','EL','#93b1f0','Headquarters,Records annex','Taylor Brooks'],
['Orion Retail Group','Multisite retail','OR','#d8b580','Flagship,East store,West store','Casey Rivera'],
['Bluewater Research','Research','BR','#80c8e5','Lab,Data center','Dana Kim'],
['Westbridge Council','Public sector','WC','#a0c98a','Town hall,Public works,Library','Robin Hayes'],
['Pioneer Learning','School','PL','#b0a4e5','Upper school,Lower school','Jamie Parker'],
];
export const clients: Client[] = names.map((r,i)=>({id:`C${i+1}`,name:r[0],industry:r[1],initials:r[2],color:r[3],sites:r[4].split(','),prefix:`10.${24+i}.0.0/16`,users:80+i*31,contact:r[5]}));
const schema=z.object({title:z.string().min(10),key:z.string().regex(/^[a-z0-9_]+$/),bad:z.string().min(1),good:z.string().min(1),evidence:z.string().includes('{value}'),explanation:z.string().min(30)});
const incident=[20,17,22,13,9,9,16,17,7], change=[8,6,9,5,4,3,7,6,2];
function profile(category:Category,i:number):[string,string] {
 if(category==='Azure') return ['Microsoft Azure','Azure networking API 2024-05-01 (scoped simulator)'];
 if(category==='AWS') return ['Amazon Web Services','EC2/VPC API 2016-11-15 (scoped simulator)'];
 if(category==='Network services')return i%2?['Canonical','Ubuntu 24.04 LTS']:['Microsoft','Windows Server 2022'];
 if(category==='Operations'){if(i===0||i===2)return ['Amazon Web Services','EC2/VPC API 2016-11-15 (scoped simulator)'];if(i===1)return ['Microsoft Azure','Azure networking API 2024-05-01 (scoped simulator)'];if(i===5||i===6)return ['Canonical','Ubuntu 24.04 LTS'];if(i===7)return ['Fortinet','FortiOS 7.4'];if(i===9)return ['Microsoft','Windows Server 2022'];}
 if(category==='Security') {
  if(i<3 || i===26) return ['Cisco ASA','ASA 9.18'];
  if((i>=3&&i<6)||i===27) return ['Fortinet','FortiOS 7.4'];
  if(i===6||i===7||i===28) return ['Juniper','Junos 23.4R1'];
  if(i===8||i===9||i===29) return ['Palo Alto Networks','PAN-OS 11.1'];
  return [['Cisco ASA','ASA 9.18'],['Fortinet','FortiOS 7.4'],['Juniper','Junos 23.4R1'],['Palo Alto Networks','PAN-OS 11.1']][i%4] as [string,string];
 }
 return ['Cisco','IOS XE 17.12'];
}
export const scenarios: Scenario[]=[];
let number=0;
for(const [cat,count] of categories) {
 const ci=categories.findIndex(x=>x[0]===cat), rows=authored[cat].trim().split('\n');
 if(rows.length!==count) throw new Error(`${cat}: ${rows.length}, expected ${count}`);
 rows.forEach((row,i)=>{
  const [title,key,bad,good,evidence,explanation]=row.split('|');
  const r=schema.parse({title,key,bad,good,evidence,explanation});
  const client=clients[number%12]; const oct=24+number%12;
  const local=(s:string)=>s.replaceAll('10.24.',`10.${oct}.`);
  const id=`NT-${String(++number).padStart(4,'0')}`;
  const publicTitle=subjects[cat][i];if(!publicTitle)throw new Error('Missing authored subject');
  // Exact, independent difficulty quotas, interleaved across the curriculum.
  const difficulty = (number-1)%20<7?'Foundational':(number-1)%20<16?'Intermediate':'Advanced';
  const kind=i<incident[ci]?'Incident':i<incident[ci]+change[ci]?'Change request':'Maintenance';
  const [vendor,os]=profile(cat,i); const code=client.initials.toLowerCase();
  const serverIP=key==='azure_private_record'||key==='private_dns_link'||key==='private_endpoint_approval'||key==='storage_endpoint'?'10.80.20.5':cat==='AWS'?'10.85.20.18':cat==='Switching'||cat==='Routing'||cat==='Azure'||(cat==='Security'&&!['vip_target','dnat_public','publish_port'].includes(key))?'10.80.20.18':`10.${oct}.20.18`;
  const assets:Asset[]=[
   {id:'endpoint',name:`${code}-ws-01`,vendor:number%2?'Microsoft':'Canonical',os:number%2?'Windows 11 23H2':'Ubuntu 24.04 LTS',role:'Affected endpoint',ip:`10.${oct}.20.25`,status:'Online'},
   {id:'edge',name:`${code}-${vendor==='Microsoft Azure'?'az':vendor==='Amazon Web Services'?'aws':vendor==='Cisco ASA'?'asa':vendor==='Fortinet'?'forti':vendor==='Juniper'?'srx':vendor==='Palo Alto Networks'?'pan':cat==='Network services'?'svc':cat==='Switching'?'sw':cat==='Routing'?'rtr':'edge'}-01`,vendor,os,role:'Managed network / cloud control plane',ip:`10.${oct}.99.2`,status:'Online'},
   {id:'server',name:`${code}-${cat==='Azure'?'az-':cat==='AWS'?'aws-':serverIP.startsWith('10.80.')?'hub-':''}app-01`,vendor:'Canonical',os:'Ubuntu 24.04 LTS',role:'Application server',ip:serverIP,status:'Online'},
   {id:'jump',name:`${code}-jump-01`,vendor:'Microsoft',os:'Windows Server 2022',role:'Out-of-band jump host',ip:`10.${oct}.99.10`,status:'Online'},
  ];
  const config:Record<string,string>={ [key]:local(bad),segmentation:'enforced',policy_scope:'approved-only',service_listener:'8443',management_access:'enabled',standby_ready:'yes',dns_health:'healthy',endpoint_address:assets[0].ip,endpoint_gateway:`10.${oct}.20.1`,endpoint_dns:`10.${oct}.99.53`,access_link:'up',uplink_vlans:'10,20,30,40,99',return_path:'present',service_route:`${serverIP.replace(/\.\d+$/,'.0')}/24 via 10.${oct}.20.1` };
  const state:LabState={config,candidate:null,startup:{...config},clock:0,version:0,primaryDown:false,management:true,counters:{sent:0,dropped:0},cacheGeneration:0,events:[{time:0,message:`${kind==='Incident'?'Monitoring alert':'Request received'}: ${client.name} application workflow requires investigation.`}]};
  const business=client.industry==='Warehouse'?'Operations staff cannot reliably complete inventory and dispatch workflows.':client.industry==='Clinic'?'Clinical staff are delayed accessing the scheduling application.':client.industry==='School'?'Teachers and support staff report interrupted access during lessons.':'Staff cannot reliably complete the affected business application workflow.';
  const description=kind==='Incident'?`${client.contact}: “The application workflow at ${client.sites[0]} is failing or behaving inconsistently. ${business} We noticed it after the last maintenance window. Could it be the server?” Investigate the client-to-service path and restore the approved behavior.`:kind==='Change request'?`${client.contact} requests a controlled update to the affected ${cat.toLowerCase()} service at ${client.sites[0]}. ${publicTitle}. Prepare an impact statement, obtain simulated approval, apply only the requested scope and demonstrate post-change behavior.`:`The service owner requests a documented ${cat.toLowerCase()} maintenance exercise: ${publicTitle}. Gather evidence, record the engineering decision and validate the baseline and recovery path.`;
  scenarios.push({ticket:{id,title:publicTitle,category:cat as Category,kind,difficulty,client,priority:number%11===0?'Critical':number%3===0?'High':'Normal',impact:business,description,sla:number%11===0?30:number%3===0?120:480,skills:[cat,key.replaceAll('_',' ')],assets,tools:['RMM','Endpoint terminal','Network CLI','Configuration console','Packet viewer','Monitoring','IPAM','Jump host',...(cat==='Azure'?['Azure Portal','Azure CLI']:cat==='AWS'?['AWS Console','AWS CLI']:[])],previousNotes:[`Previous technician: the endpoint is online. I suspect a server restart may help, but I have not tested the network path.`,`Service owner: ${client.sites[0]} uses the approved private application. Preserve guest isolation and management access.`],requirements:[`Approved client subnet: 10.${oct}.20.0/24. Gateway: 10.${oct}.20.1.`,`Application: app.example.test → ${serverIP}, TCP 8443. DNS: 10.${oct}.99.53.`,`Business services must work on the primary and standby paths. Guests must not reach the business application.`,`Management is restricted to ${assets[3].ip}/32. Keep segmentation and scoped access enabled.`,...(kind!=='Incident'?[`Obtain approval and a maintenance window before changing the controlled resource.`]:[])],related:number===1||number===31||number===136?['MI-2026-01']:[]},key,bad:local(bad),good:local(good),evidence:local(r.evidence),explanation:local(r.explanation),hints:[`Which part of the ${cat.toLowerCase()} path could explain the affected scope?`,`Inspect the ${key.replaceAll('_',' ')} evidence in packet-flow analysis and the device configuration.`,`Compare the observed value with the peer, asset inventory and approved requirements.`,`${local(explanation)} Consider a bounded change and a rollback checkpoint.`,`Set ${key} to ${local(good)}. Verify the application, standby path, isolation and management access; then document the evidence.`],initial:state,constraints:['segmentation','policy_scope','standby_ready','management_access'],learningResources:resources.filter(r=>r.topics.includes(cat)).map(r=>r.url),acceptedOutcomes:[{setting:key,reference:local(good)}],completionChecks:['outcome','application','failover'],regressionChecks:['isolation','scope','management','listener','dns']});
 });
}
if(scenarios.length!==200 || new Set(scenarios.map(s=>s.key)).size!==200) throw new Error('Catalogue must contain 200 unique mechanisms');
export function getScenario(id:string) { const s=scenarios.find(s=>s.ticket.id===id); if(!s) throw new Error('Unknown ticket'); return s; }

for(const scenario of scenarios)scenarioSchema.parse(scenario);
