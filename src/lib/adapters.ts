import { deviceDisplay } from './evidence';
import { commit, evidence, probe, tick, update } from './engine';
import type { Attempt, Scenario, Session } from './types';
export const commandHelp=`SIMULATED COMMAND SCOPE\nAll sessions: help, lab inspect, lab set <setting> <value>, lab save, lab reload, lab advance <seconds>, lab failover, lab failback\nDiagnostics: ping <IPv4|app.example.test|guest|management>, tracert/traceroute <target>, nslookup/dig <name>, Test-NetConnection <target> -Port 8443, curl https://app.example.test:8443/health\nWindows: ipconfig /all, ipconfig /renew, ipconfig /flushdns, Get-NetIPConfiguration, Get-Service, Get-WinEvent, Restart-Service DNS\nLinux: ip addr, ip route, ss -lnt, systemctl status dns, systemctl restart dns\nIOS XE: enable, configure terminal, interface GigabitEthernet1/0/1, switchport access vlan <id>, switchport trunk allowed vlan <list>, switchport trunk native vlan <id>, shutdown/no shutdown, end, copy running-config startup-config\nASA: enable, configure terminal, crypto ikev2 enable outside (IKE-version lab only), end, write memory\nFortiOS: config system interface, edit port1, set status up/down, next, end\nJunos: configure, set interfaces ge-0/0/1 disable, delete interfaces ge-0/0/1 disable, show | compare, commit, commit confirmed <minutes>, rollback 0, exit\nPAN-OS: configure, set network interface ethernet ethernet1/1 link-state up/down, commit, exit\nDevice displays: show running-config, show configuration, show vlan brief, show interfaces, show interfaces counters errors, show interfaces trunk, show etherchannel summary, show spanning-tree, show ip route, show ip ospf neighbor, show ip eigrp neighbors, show ip bgp, show arp, show mac address-table, show vpn, show log, show interface all (PAN-OS), get router info routing-table all, diagnose vpn tunnel list\nAzure: az network nsg list, az network nic show-effective-route-table, az network nic list-effective-nsg, az network vnet peering list\nAWS: aws ec2 describe-security-groups, aws ec2 describe-network-acls, aws ec2 describe-route-tables, aws ec2 describe-vpn-connections\nAdvanced configuration uses the explicitly simulated lab set command or shared configuration console; it is not vendor CLI syntax. Unsupported commands return an error.`;
const io=(s:Scenario,a:Attempt)=>evidence(s,a.state);
export function execute(s:Scenario,a:Attempt,session:Session,raw:string) {
 const cmd=raw.trim(), state=a.state;tick(state,5);
 const asset=s.ticket.assets.find(x=>x.id===session.device)!;
 if(!asset)throw new Error('Unknown device session');
 if(!state.management && session.device==='edge')return 'Session disconnected: management access is disabled. Open Jump host for out-of-band recovery.';
 if(cmd==='help'||cmd==='?')return commandHelp;
 if(cmd==='lab inspect')return io(s,a);
 if(cmd==='lab reload') {state.config={...state.startup};state.candidate=null;state.version++;state.management=state.config.management_access==='enabled';return 'Device reloaded from saved startup configuration.';}
 if(cmd==='lab save') {state.startup={...state.config};return 'Simulated startup configuration saved.';}
 if(cmd==='lab failover'||cmd==='lab failback') {state.primaryDown=cmd==='lab failover';state.version++;return io(s,a);}
 let m=cmd.match(/^lab advance (\d+)$/);if(m){const n=Number(m[1]);if(n>86400)throw new Error('Advance at most 86400 seconds.');tick(state,n);return `Simulation clock: T+${state.clock}s`;}
 m=cmd.match(/^lab set ([a-z0-9_]+) (.+)$/);
 if(m){
  const change=s.ticket.kind!=='Incident';
  if(change&&(!a.plan.approved||!a.plan.window))throw new Error('A reviewed plan, simulated approval and maintenance window are required.');
  const staged=asset.id==='edge'&&(/Junos|PAN-OS/.test(asset.os));
  if(staged&&session.mode!=='configuration')throw new Error('Enter configure before staging candidate configuration.');
  update(state,m[1],m[2],staged);return `${staged?'Candidate staged':'Running configuration updated'}: ${m[1]}. Inspect and validate.`;
 }
 const windows=/Windows/.test(asset.os), linux=/Ubuntu/.test(asset.os), edge=asset.id==='edge';
 if((windows&&(/^(ipconfig( \/all)?|Get-NetIPConfiguration)$/.test(cmd)))||(linux&&/^(ip addr|ip a)$/.test(cmd)))return `${asset.name} · ${asset.os}\nIPv4: ${state.config.endpoint_address}/24\nGateway: ${state.config.endpoint_gateway}\nDNS: ${state.config.endpoint_dns}\nAdapter: up\n${io(s,a)}`;
 if((windows&&/^ipconfig \/(renew|flushdns)$/.test(cmd))){state.cacheGeneration++;if(cmd.endsWith('flushdns')&&'dns_cache'in state.config)update(state,'dns_cache','fresh');return `Simulated ${cmd.endsWith('renew')?'lease renewal':'cache flush'} complete.\n${io(s,a)}`;}
 if((windows&&/^(Get-Service|Get-WinEvent)$/.test(cmd))||(linux&&cmd==='systemctl status dns'))return `${io(s,a)}\nDNS service: ${state.config.dns_service??'running'}; application listener: TCP ${state.config.service_listener}`;
 if((windows&&cmd==='Restart-Service DNS')||(linux&&cmd==='systemctl restart dns')){if(!('dns_service'in state.config)||asset.id!=='edge')return 'The DNS server service is managed only on the services control-plane asset in this lab.';update(state,'dns_service','running');return 'DNS service restarted.';}
 if(linux&&cmd==='ss -lnt')return `LISTEN 0 128 ${s.ticket.assets[2].ip}:${state.config.service_listener}`;
 m=cmd.match(/^ping (\S+)$/);if(m){const target=m[1];if(![...s.ticket.assets.map(x=>x.ip),'app.example.test','guest','management'].includes(target))return 'Unsupported target: use a scenario asset IP, app.example.test, guest or management.';const b=probe(s,state,target==='guest'?'guest':target==='management'?'management':'ip');return b.ok?`4 packets transmitted, 4 received, 0% loss\nReply from ${target}: bytes=32 time=12ms TTL=61\n${b.reason}`:`4 packets transmitted, 0 received, 100% loss\nRequest timed out. ${b.reason}`;}
 m=cmd.match(/^(tracert|traceroute) (\S+)$/);if(m)return `1 ${asset.ip.replace(/\.\d+$/,'.1')} 1 ms\n2 gateway / policy boundary 4 ms\n3 ${probe(s,state,'ip').ok?s.ticket.assets[2].ip:'* * * path incomplete'}\n${io(s,a)}`;
 if(/^(nslookup|dig) (\S+)$/.test(cmd)){if(!['app.example.test','service.example.test'].includes(cmd.split(' ')[1]))return 'Unsupported name: this lab models app.example.test and service.example.test.';const b=probe(s,state,'dns');return b.ok?`Server: private-resolver\nName: app.example.test\nAddress: ${s.ticket.assets[2].ip}`:'Server: private-resolver\nSERVFAIL / no usable private answer';}
 if((windows&&/^Test-NetConnection \S+ -Port 8443$/.test(cmd))||(linux&&cmd==='curl https://app.example.test:8443/health')){const b=probe(s,state,'application');return b.ok?'TCP 8443: SUCCESS\nHTTP 200 {"status":"healthy"}':`TCP 8443: FAILED\n${b.reason}`;}
 if(session.device==='jump'&&cmd==='lab rollback'){const cp=a.checkpoints.at(-1);if(!cp)return 'No backup checkpoint exists.';a.state=structuredClone(cp.state);a.state.version=state.version+1;return 'Out-of-band rollback restored the latest checkpoint.';}
 if(linux&&cmd==='ip route')return `default via ${state.config.endpoint_gateway}\n${io(s,a)}`;
 if(!edge && session.device!=='jump')return `Unsupported command on ${asset.os}: ${cmd}. Type help for supported commands.`;
 if(cmd==='enable'&&/IOS|ASA/.test(asset.os)){session.mode='privileged';return 'Privileged EXEC mode.';}
 if((cmd==='configure terminal'&&/IOS|ASA/.test(asset.os))||cmd==='configure'&&/Junos|PAN-OS/.test(asset.os)){if(/IOS|ASA/.test(asset.os)&&session.mode!=='privileged')throw new Error('Use enable before configure terminal.');session.mode='configuration';return 'Configuration mode. Changes are simulation-scoped.';}
 if(cmd==='exit'||cmd==='end'){session.mode='privileged';return 'Exited configuration mode.';}
 if(/^(copy running-config startup-config|write memory)$/.test(cmd)&&/IOS|ASA/.test(asset.os)){state.startup={...state.config};return '[OK] Saved startup configuration.';}
 if(cmd==='show | compare'&&/Junos/.test(asset.os))return JSON.stringify(state.candidate??state.config,null,2);
 if(/^commit( confirmed \d+)?$/.test(cmd)&&/Junos|PAN-OS/.test(asset.os)){if(session.mode!=='configuration')throw new Error('Enter configure first.');if(cmd.startsWith('commit confirmed')&&!/Junos/.test(asset.os))throw new Error('commit confirmed is supported only on Junos.');return commit(state,cmd.includes('confirmed')?Number(cmd.split(' ').at(-1)):undefined);}
 if(cmd==='rollback 0'&&/Junos/.test(asset.os)){state.candidate={...state.config};return 'Candidate reset to running configuration.';}
 if(cmd==='config system interface'&&/FortiOS/.test(asset.os)){session.mode='configuration';return '(interface)';}
 if(cmd==='edit port1'&&/FortiOS/.test(asset.os)&&session.mode==='configuration'){session.mode='interface';return '(port1)';}
 if(cmd==='next'&&/FortiOS/.test(asset.os)){session.mode='configuration';return 'Interface change applied.';}
 if(cmd==='interface GigabitEthernet1/0/1'&&/IOS/.test(asset.os)&&session.mode==='configuration'){session.mode='interface';return '(config-if)';}
 const apply=(key:string,value:string)=>{
  if(s.ticket.kind!=='Incident'&&(!a.plan.approved||!a.plan.window))throw new Error('Approval and maintenance window are required.');
  update(state,key,value,/Junos|PAN-OS/.test(asset.os));return `${key} ${value} ${/Junos|PAN-OS/.test(asset.os)?'(candidate)':'(running)'}`;
 };
 if(session.mode==='interface'&&/IOS/.test(asset.os)){
  const mappings:[RegExp,string][]=[[/^switchport access vlan (\d+)$/,'access_vlan'],[/^switchport trunk allowed vlan ([\d,]+)$/,'trunk_allowed'],[/^switchport trunk native vlan (\d+)$/,'native_vlan']];
  for(const [re,key]of mappings){m=cmd.match(re);if(m)return apply(key,m[1]);}
  if(cmd==='shutdown'||cmd==='no shutdown')return apply('port_admin',cmd==='shutdown'?'down':'up');
 }
 if(session.mode==='configuration'&&/ASA/.test(asset.os)&&cmd==='crypto ikev2 enable outside')return apply('ipsec_ike','ikev2');
 if(session.mode==='interface'&&/FortiOS/.test(asset.os)&&/^set status (up|down)$/.test(cmd))return apply('management_access',cmd.endsWith('up')?'enabled':'disabled');
 if(session.mode==='configuration'&&/Junos/.test(asset.os)&&/^(set|delete) interfaces ge-0\/0\/1 disable$/.test(cmd))return apply('management_access',cmd.startsWith('set')?'disabled':'enabled');
 if(session.mode==='configuration'&&/PAN-OS/.test(asset.os)&&/^set network interface ethernet ethernet1\/1 link-state (up|down)$/.test(cmd))return apply('management_access',cmd.endsWith('up')?'enabled':'disabled');
 const shows=['show running-config','show configuration','show vlan brief','show interfaces','show interfaces counters errors','show interfaces trunk','show etherchannel summary','show spanning-tree','show ip route','show ip ospf neighbor','show ip eigrp neighbors','show ip bgp','show arp','show mac address-table','show vpn','show log','show interface all','get router info routing-table all','diagnose vpn tunnel list'];
 if(shows.includes(cmd)){if(/IOS/.test(asset.os)&&['configuration','interface'].includes(session.mode))return 'Display commands require privileged EXEC in this scoped adapter. Use end first.';if(/Junos|PAN-OS/.test(asset.os)&&session.mode==='configuration'&&!['show configuration'].includes(cmd))return 'Use exit for operational diagnostics; candidate comparison is show | compare on Junos.';
  const native=/IOS/.test(asset.os)?cmd.startsWith('show ')&&cmd!=='show configuration'&&cmd!=='show vpn':/ASA/.test(asset.os)?['show running-config','show interfaces','show arp'].includes(cmd):/FortiOS/.test(asset.os)?['get router info routing-table all','diagnose vpn tunnel list'].includes(cmd):/Junos/.test(asset.os)?['show configuration','show interfaces'].includes(cmd):/PAN-OS/.test(asset.os)?['show interface all'].includes(cmd):false;
  if(!native)return `Unsupported display syntax on ${asset.vendor} ${asset.os}: ${cmd}. Use lab inspect for shared evidence.`;
  return deviceDisplay(s,state,cmd);
 }
 if(asset.vendor==='Microsoft Azure'&&['az network nsg list','az network nic show-effective-route-table','az network nic list-effective-nsg','az network vnet peering list'].includes(cmd))return JSON.stringify({simulation:true,resource:asset.name,effective:state.config,path:probe(s,state,'application')},null,2);
 if(asset.vendor==='Amazon Web Services'&&['aws ec2 describe-security-groups','aws ec2 describe-network-acls','aws ec2 describe-route-tables','aws ec2 describe-vpn-connections'].includes(cmd))return JSON.stringify({simulation:true,resource:asset.name,configuration:state.config,securityGroupReturn:'stateful',networkACLReturn:'requires explicit rule'},null,2);
 if(linux&&cmd==='ip route')return `default via ${asset.ip.replace(/\.\d+$/,'.1')}\n${io(s,a)}`;
 return `Unsupported command on ${asset.vendor} ${asset.os}: ${cmd}. Type help. No state was changed.`;
}
