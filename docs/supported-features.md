# Supported features and honest scope

## Functional workbench

Dashboard, searchable/filterable 200-ticket queue, 12-client directory, representative inventory, client knowledge base, monitoring, tools and per-category progress are implemented. Tickets support assignment, six requested statuses, simulated SLA feedback, notes/customer updates, text attachments, time entries, hypotheses, contacts, change plans, approval/window gates, resolution, interview debrief and action history. Multiple sessions (maximum eight), configuration checkpoints and out-of-band rollback are functional. Attachments are text evidence, not arbitrary binary uploads.

The ticket tabs include Activity, Assets, Tools, Network Map, Change Plan, Validation and Replay. The shared configuration console is the functional GUI for the declared scope, including Azure/AWS resources. It is an original simulator view; it does not reproduce every screen of commercial portals or RMM products.

## State engine

Every attempt owns independent configuration, candidate/startup copies, deterministic clock, counters, events and checkpoints. Both GUI and terminals modify this server-side state. Private DNS checks, port tests, packets, monitoring and evaluation read it. Incorrect endpoint addressing, a disabled link, removal of a trunk VLAN, a missing return path, an altered listener, missing standby capability, broad access or management lockout can create additional failures.

The engine includes executable IPv4/CIDR matching, route selection by prefix length/distance/metric, policy ordering, SG stateful returns, NACL stateless returns and OSPF/EIGRP adjacency primitives. Representative switching, OSPF, NSG/SG/NACL and DNS labs evaluate these functions directly. Other mechanisms use authored finite-state gates with a bounded reference state. They **do not** simulate a complete distributed control plane, switch fabric, lease database, NAT/session table or real packet transmission. This is the main remaining gap relative to the requested comprehensive network model.

The schema validates initial state, assets/vendor versions, tools, notes, requirements, five hints, reference outcome and regression constraints. Shared outcome evaluation accepts alternate valid STP root priorities, NSG priorities and reordered explicit sets. Most other labs support the authored bounded correction only; general equivalence across arbitrary engineering solutions is not implemented.

Clock time advances by five seconds per workflow action and an additional five per terminal command. `lab advance N` advances at most 86400 simulated seconds. Confirmed commits expire using this clock; no wall-clock timer is needed. Carrier monitoring uses deterministic seeded samples. Comprehensive convergence, DHCP lease expiry and randomized intermittent packet dynamics are not implemented.

## Commands

`help` in any terminal lists the supported subset. All consoles label outputs **SIMULATED**. Unsupported commands/targets/filters produce explicit errors and do not fabricate a real device response. Diagnostics only model the approved lab assets/names.

Common simulator commands:

```text
lab inspect
lab set <setting> <value>
lab save
lab reload
lab advance <seconds>
lab failover
lab failback
```

`lab set` is **NetTask syntax**, not a Cisco/Fortinet/Juniper/Palo Alto command. It makes all authored scoped controls usable while full native adapters remain incomplete. Do not copy it into a real appliance. Out-of-band Jump host also supports `lab rollback` to the latest checkpoint.

Endpoint commands include `ping`, `tracert`/`traceroute`, `nslookup`/`dig`, Windows `ipconfig`, `Get-NetIPConfiguration`, `Get-Service`, `Get-WinEvent`, `Restart-Service DNS`, `Test-NetConnection ... -Port 8443`, Linux `ip addr`, `ip route`, `ss -lnt`, DNS `systemctl` status/restart, and the approved application `curl` health request. This is not a general PowerShell/CMD/Bash shell.

Native configuration subset:

| Platform | Profile | Supported configuration behavior |
| --- | --- | --- |
| Cisco IOS XE | 17.12 | `enable`, `configure terminal`, specified interface, access/native/allowed VLANs, scoped shutdown/no shutdown, `end`, `copy running-config startup-config` |
| Cisco ASA | 9.18 | EXEC/config modes, `crypto ikev2 enable outside` in its IKE lab, `write memory` |
| FortiOS | 7.4 | system-interface config/edit/status/next/end subset |
| Junos | 23.4R1 | candidate mode, interface disable/delete-disable, compare, commit, confirmed commit with deterministic rollback, rollback 0 |
| PAN-OS | 11.1 | candidate mode, scoped interface link-state, commit |
| Azure | API 2024-05-01 scoped profile | NSG list, effective route/rule and peering diagnostic commands; edits through the shared console |
| AWS | EC2/VPC API 2016-11-15 scoped profile | describe SG/NACL/routes/VPN commands; edits through the shared console |

Device displays are restricted by platform; use `lab inspect` for common evidence. Version identifiers describe simulated profiles, not installed vendor images. **Official version-specific syntax verification remains incomplete** because vendor documentation requests were blocked by the environment egress policy. Supported native syntax is a small subset and should not be treated as a production command reference.

## Packets and monitoring

The viewer creates a five-frame DNS/TCP/TLS evidence sequence from the current model. It is not pcap capture/replay, a real dissector, or a Wireshark installation. Supported filters:

```text
dns
tcp
tls
tcp.port == 8443
ip.addr == 10.24.20.25
```

Monitoring reports state-derived application status, counters and deterministic samples/events. AWS audit tasks label Reachability Analyzer as **configuration analysis**; it is not represented as a live packet probe. Azure effective views expose the scoped shared configuration rather than a full Azure resource graph.

## Learning and evaluation

Guided and Independent modes share the same tools; Guided is a practice label and easy-access help, not an automated tutor. Shift Mode sorts by impact, advances a shared saved shift clock and produces four deterministic callback/escalation/handoff interruptions. A three-ticket correlated major incident is included. Cross-ticket incident state is not shared; each tenant/lab remains independent.

The first four hints are progressive; the full reference requires an explicit reveal or ticket completion. Help used before completion reduces independence credit. A completed unaided debrief does not retroactively classify the attempt as assisted. Reset preserves assistance/action history; a new attempt resets it.

Validation requires the authored outcome, primary and standby application/return paths, guest isolation, bounded scope, management, listener and DNS. It rejects broad access and stale validation. Documentation gets separate keyword/section coverage scoring for symptoms, cause, changes, validation and follow-up, plus a minimum length. Diagnosis and interview explanations use length/coverage gates; **semantic reasoning quality is not automatically understood**. Contacts return authored state-aware facts; escalation and onsite tasks record finite approved actions rather than an actual external interaction.

Category progress, vendor completions, aided/unaided results, saved attempts, repeated validation gaps, suggestions, action diffs and printable HTML reports persist. Reports include an SVG diagram and are explicitly marked simulated lab projects.

## Resources and integrations

The Resources panel has candidate official Cisco, Fortinet, Juniper, Palo Alto, Microsoft Learn and AWS URLs plus three training-provider homepages. Verification status/date are explicit. No lessons, numbered videos, timestamps or quotations have been invented. **Verified specific Jeremy’s IT Lab, David Bombal and NetworkChuck lessons are not yet included.** The existing requests returned proxy 403; required domain additions were saved in the environment draft, and verification needs retry after the user applies that policy.

No optional AI coach, real infrastructure, GNS3, EVE-NG, Containerlab or live cloud integration is included. A TypeScript adapter boundary is provided for later isolated integrations.

## Deployment boundary

A single Node 24 server with a persistent SQLite directory is supported. Browser identity is cookie-based, without sign-in or cross-device account recovery. Production account authentication, team collaboration, serverless database adapters and distributed simulation workers are outside this implementation. Keep this installation private.

Action/audit/plan fields expose declared choices in the console (for example onsite isolation, an evidence package, or an approved plan with rollback). Numeric, address, route and native configuration values remain text inputs. Choosing a requested action does not invoke a real technician; it updates the simulated lab record.
