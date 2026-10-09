// Authored mechanisms: each row defines a different fault/change and its evidence.
// Server-only: never import this file into a client component.
export const categories = [
  ['Switching',30], ['Routing',25], ['Security',35], ['Network services',20],
  ['Wireless',15], ['WAN & HA',15], ['Azure',25], ['AWS',25], ['Operations',10],
] as const;
export const authored: Record<string,string> = {
Switching: `Desk move strands the finance workstation|access_vlan|30|20|The endpoint-facing port is assigned to VLAN {value}.|The finance endpoint belongs to VLAN 20; its static gateway and the access port must share a broadcast domain.
Warehouse scanners lose the uplink|trunk_allowed|10,20|10,20,30|The uplink permits VLANs {value}.|Scanner VLAN 30 must traverse the distribution trunk without removing the existing voice and office VLANs.
Clinic gateway points to the old subnet|svi_address|10.24.20.254|10.24.20.1|The client gateway is 10.24.20.1; the SVI is {value}.|The SVI must match the gateway assigned to the clinic clients.
Port channel loses half its capacity|lacp_member|individual|bundled|The second uplink reports LACP state {value}.|A mismatched member is not forwarding in the bundle; negotiate active LACP on both ends.
An access switch becomes STP root|root_priority|4096|32768|The access bridge priority is {value}; distribution is 8192.|The distribution pair should win the root election to keep predictable forwarding paths.
Desk-side switch trips BPDU Guard|edge_action|none|onsite_remove|An edge port is errdisabled and the recorded onsite action is {value}.|Gather evidence and ask onsite staff to remove the unauthorized switch before re-enabling the port.
Loop between two warehouse jacks|loop_action|none|onsite_unplug|MAC addresses move between ports; the onsite isolation action is {value}.|A physical patch loop must be removed, preserving loop protections rather than disabling STP.
Native VLAN mismatch on the school trunk|native_vlan|1|99|The far end uses native VLAN 99; the local trunk uses {value}.|Both ends must agree on how untagged traffic is classified.
Voice phones inherit the data VLAN|voice_vlan|20|10|The handset advertises the voice network; the switch advertises VLAN {value}.|Voice VLAN 10 carries DHCP and call-manager access independently of workstation VLAN 20.
A suspended EtherChannel after replacement|channel_protocol|on|lacp|The peer negotiates LACP; this switch uses mode {value}.|Static aggregation cannot negotiate with the LACP peer.
Inventory uplink forced to access mode|uplink_mode|access|trunk|The uplink administrative mode is {value}.|The uplink must transport the tagged inventory and management networks.
PoE camera port administratively disabled|port_admin|down|up|The camera port administrative state is {value}.|Restore the intended access port without changing camera segmentation.
MAC limit blocks a docked workstation|port_security_max|1|3|The phone, dock and workstation need three MACs; the limit is {value}.|Use the approved three-device limit rather than disabling port security.
A retired sticky MAC survives a desk refresh|sticky_mac|00:11:22:33:44:55|00:aa:bb:cc:dd:ee|The authorized replacement MAC is 00:aa:bb:cc:dd:ee; the sticky entry is {value}.|Replace the specific stale binding after verifying the asset identity.
An inconsistent MST region blocks the ring|mst_region|legacy|NETTASK|The distribution region is NETTASK; access reports {value}.|Region names must agree with the approved mapping to avoid an unintended boundary.
Root Guard blocks the new distribution peer|root_guard_role|distribution|edge|Root Guard is applied to the {value} role.|Root Guard belongs on downstream edge links, not the intended root-facing distribution link.
A unidirectional fiber remains forwarding|udld_action|none|vendor_fiber_replace|UDLD reports a one-way optical path; the carrier action is {value}.|Escalate optical evidence for fiber replacement; do not bypass UDLD protection.
Multicast floods the media classroom|igmp_snooping|off|on|IGMP snooping is {value}; video traffic reaches every port.|Membership-aware forwarding prevents unnecessary multicast flooding.
The multicast querier moved off the subnet|igmp_querier|10.24.99.1|10.24.20.1|The active querier address is {value}.|The querier must be reachable in the receiver VLAN to refresh memberships.
DHCP snooping drops legitimate offers|dhcp_trust|untrusted|trusted|The server-facing uplink is {value}.|Trust only the verified DHCP-server path while keeping client ports untrusted.
Inspection rejects the static printer|arp_binding|missing|10.24.20.40=00:10:20:30:40:50|DAI binding for the printer is {value}.|A specific static binding permits legitimate ARP without disabling inspection.
A VLAN is absent after the switch migration|vlan_database|10,20,99|10,20,30,99|The local VLAN database contains {value}.|Create VLAN 30 locally as well as allowing it across the uplink.
Protected ports break a required peer service|protected_port|on|off|The approved peer-service port isolation setting is {value}.|Remove isolation only from the approved collaboration ports; retain the guest boundary.
An uplink forwards before STP converges|uplink_portfast|on|off|PortFast on the switch-to-switch uplink is {value}.|Edge fast-forwarding is inappropriate on an inter-switch link and can amplify transient loops.
Install a segmented guest VLAN|guest_vlan|missing|40|The requested isolated guest VLAN is {value}.|Create the agreed guest broadcast domain while preserving denial of guest-to-business traffic.
Add a redundant LACP uplink|lacp_mode|passive|active|Both new members are passive; local negotiation mode is {value}.|At least one side must initiate LACP negotiation for the new bundle to form.
Move storage to jumbo frames end to end|storage_mtu|1500|9000|The storage path MTU is {value}; the approved test frame is 8972 bytes.|Every modeled hop on the storage path must accept the approved MTU.
Retire an unused VLAN without losing phones|retired_vlan|10,55|10|The retirement set currently contains VLANs {value}.|Remove VLAN 55 while keeping voice VLAN 10 active.
Audit the spanning-tree root plan|stp_audit|undocumented|evidence_recorded|The root-election audit record is {value}.|Record the observed root and backup priorities with evidence; no forwarding change is required.
Document the switch stack failover test|stack_failover|untested|tested|The stack switchover validation is {value}.|A maintenance plan must include a tested standby rather than assuming that a healthy primary proves redundancy.`,
Routing: `OSPF neighbors stop at EXSTART|ospf_mtu|1400|1500|The peer MTU is 1500; the local OSPF interface MTU is {value}.|Database description exchange fails with inconsistent MTUs; align the path rather than suppressing the check.
An OSPF area mismatch after a move|ospf_area|1|0|The peer advertises area 0; the local interface uses area {value}.|Neighbors must share an area on the common link.
A branch OSPF dead timer differs|ospf_dead|20|40|The peer advertises a 40-second dead timer; local is {value}.|Hello and dead intervals must agree for adjacency formation.
OSPF authentication key rolled on one side|ospf_key|old-key|key-2026|The approved lab key ID is key-2026; local key ID is {value}.|Coordinate the simulated key identifier across both neighbors.
A passive OSPF transit interface|ospf_passive|on|off|The routed interconnect passive setting is {value}.|A transit link must send and receive hellos; client-facing interfaces can remain passive.
EIGRP neighbors use different AS numbers|eigrp_as|200|100|The peer autonomous system is 100; local is {value}.|EIGRP neighbors must share the routing process autonomous-system number.
EIGRP metric weights were customized|eigrp_kvalues|1,1,1,0,0|1,0,1,0,0|The peer K values are 1,0,1,0,0; local is {value}.|Metric-weight agreement is required before exchanging EIGRP routes.
An EIGRP stub hides a branch summary|eigrp_stub|connected|connected,summary|The stub advertises route types {value}.|Permit summary advertisement while retaining the intended stub boundary.
A BGP prefix list rejects the new site|bgp_prefix|10.80.0.0/16|10.80.0.0/16,10.81.0.0/16|The outbound list contains {value}.|Add the approved new site prefix without accepting or advertising arbitrary networks.
BGP session uses the wrong remote AS|bgp_remote_as|65020|65010|The provider AS is 65010; local neighbor configuration is {value}.|The configured remote autonomous system must match the peer OPEN message.
BGP next hop cannot be resolved|bgp_next_hop|192.0.2.254|192.0.2.1|The advertised next hop is {value}; only 192.0.2.1 has an interior route.|Ensure a reachable next hop, using the approved boundary rewrite.
A multihop eBGP loopback session expires|bgp_ttl|1|3|The peer is three modeled hops away; configured TTL is {value}.|Loopback peering needs sufficient bounded multihop TTL.
The default route points at a retired edge|default_next_hop|192.0.2.9|192.0.2.1|The reachable edge is 192.0.2.1; the default next hop is {value}.|Replace the stale default next hop after checking the connected subnet.
A more-specific route blackholes payroll|payroll_route|Null0|192.0.2.1|The longest matching payroll route points to {value}.|A specific discard route wins over the default; correct that route rather than adding another default.
A static return route is missing|return_route|missing|10.24.20.0/24|The server-side return-route entry is {value}.|Bidirectional application traffic requires a route back to the source subnet.
Administrative distance selects a stale backup|backup_distance|1|200|The primary OSPF distance is 110; backup static distance is {value}.|A floating static must be less preferred than the intended dynamic route.
OSPF duplicate router IDs prevent exchange|router_id|1.1.1.1|2.2.2.2|The peer router ID is 1.1.1.1; local is {value}.|Use unique router IDs and restart the modeled adjacency in a controlled window.
A point-to-point link uses incompatible network type|ospf_network_type|nonbroadcast|point-to-point|The peer uses point-to-point; local uses {value}.|Compatible network types avoid mismatched discovery and DR expectations.
A summary suppresses the warehouse route|summary_prefix|10.90.0.0/24|10.90.0.0/16|The summary is {value}; warehouse is 10.90.30.0/24.|Summarize the actual branch allocation without hiding required specifics outside the aggregate.
Route redistribution risks a feedback loop|route_tag|none|deny-tag-200|The redistribution loop guard is {value}.|Tag and reject re-imported routes to prevent a routing feedback loop.
Install a new branch static route|branch_route|missing|10.82.0.0/16 via 192.0.2.1|The new-site route is {value}.|Install the bounded branch prefix through the approved edge.
Prefer the private BGP circuit|bgp_local_pref|50|200|The private path local preference is {value}; Internet backup is 100.|Raise preference on the private path while retaining a usable backup.
Drain a BGP circuit for maintenance|bgp_prepend|0|3|The maintenance path AS prepend count is {value}.|De-prefer the circuit with the approved limited prepend instead of withdrawing all reachability.
Verify dynamic routing after a reboot|routing_failover|untested|tested|The reconvergence exercise is {value}.|Record primary and backup reachability after deterministic convergence.
Audit route advertisements before acquisition|route_audit|undocumented|evidence_recorded|The accepted-prefix audit is {value}.|Collect the specific advertised prefixes and next hops rather than making unapproved topology changes.`,
Security: `ASA VPN fails phase one after a replacement|ipsec_ike|ikev1|ikev2|The peer supports IKEv2; configured negotiation is {value}.|Match the supported IKE version before troubleshooting traffic selectors.
ASA tunnel protects the wrong subnet|vpn_selector|10.25.20.0/24|10.24.20.0/24|The local protected selector is {value}; users reside in 10.24.20.0/24.|The encryption domain must include the intended local network.
ASA PAT captures private VPN traffic|nat_exemption|missing|10.24.20.0/24->10.80.0.0/16|The pre-PAT VPN exemption is {value}.|Exempt the specific tunnel flow so its source still matches the selector.
FortiGate policy uses the wrong destination interface|policy_interface|wan1|vpn-branch|The matched policy egress interface is {value}.|The policy must reference the actual tunnel interface selected by routing.
FortiGate deny shadows a vendor permit|policy_order|deny-first|permit-vendor-first|The evaluated order is {value}.|Put the narrow approved permit before the conflicting deny without broadening its scope.
FortiGate VIP targets the retired server|vip_target|10.24.20.8|10.24.20.18|The VIP translates to {value}; the active asset is 10.24.20.18.|Destination NAT must point to the active listener and preserve the narrow service.
Junos security zone misses a routed interface|junos_zone|untrust|trust|The internal interface belongs to zone {value}.|Zone classification affects the policy pair; assign the verified internal interface to trust.
Junos candidate change was never committed|junos_commit|pending|committed|The reviewed candidate deployment state is {value}.|Validate and commit the candidate so the running policy actually changes.
PAN-OS application rule excludes SSL|pan_applications|web-browsing|web-browsing,ssl|The matched application set is {value}.|Encrypted application traffic needs the approved SSL classification as well as web browsing.
PAN-OS NAT rule uses the post-NAT destination zone|pan_nat_zone|dmz|untrust|The NAT matching destination zone is {value}.|Match the pre-translation route zone, while evaluating security policy against the documented translation semantics.
A tunnel has no remote return route|vpn_return|missing|10.24.20.0/24|The remote return route is {value}.|A tunnel that negotiates successfully still needs a path back to the users.
Two merger sites overlap their address space|vpn_overlap_nat|none|10.124.20.0/24|The agreed translated local prefix is {value}.|Use the approved nonoverlapping translation instead of ambiguous identical prefixes.
IPsec phase two lifetime is rejected|ipsec_lifetime|300|3600|The peer requires a 3600-second SA lifetime; local is {value}.|Align the modeled proposal lifetime during the coordinated tunnel change.
IPsec PFS groups do not match|ipsec_pfs|group2|group14|The peer requires group14; local PFS is {value}.|Use the approved PFS group on both ends; do not disable PFS.
Remote-access users receive the wrong split route|split_route|10.90.0.0/16|10.80.0.0/16|The pushed private route is {value}.|Push the actual application network instead of sending an unrelated prefix.
SSL VPN users lack a permitted group|vpn_group|contractors|network-staff|The policy group is {value}; approved users are network-staff.|Bind the authorized group without permitting all directory users.
A firewall object has an outdated mask|address_object|10.24.20.0/25|10.24.20.0/24|The authorized client object is {value}.|Include the full approved subnet while retaining segmentation outside it.
A source NAT pool has been exhausted|nat_pool|192.0.2.10|192.0.2.10-192.0.2.14|The approved translated pool is {value}.|Expand only within the allocated pool after checking utilization.
A UDP vendor application was permitted as TCP|vendor_protocol|tcp|udp|The vendor sends UDP 5004; policy protocol is {value}.|Permit the documented UDP flow rather than opening both protocols and all ports.
An idle timeout drops long-running exports|session_timeout|30|600|The vendor export idle interval is 300 seconds; policy timeout is {value}.|Use the approved scoped timeout without changing every firewall session.
Anti-spoofing rejects the valid routed branch|antispoof_prefix|10.81.0.0/16|10.81.0.0/16,10.82.0.0/16|The interface source validation list is {value}.|Add the verified new branch prefix while retaining spoof protection.
A DNAT listener is bound to the wrong public IP|dnat_public|192.0.2.30|192.0.2.20|The published service uses 192.0.2.20; NAT listens on {value}.|Correct the exact published mapping instead of changing internal service addressing.
TLS inspection breaks a pinned vendor client|tls_exception|none|vendor.example.test|The narrow approved inspection exception is {value}.|Use a documented application-specific exception and preserve inspection for other traffic.
A stale session keeps using the old policy|session_generation|stale|current|The affected flow belongs to policy generation {value}.|Clear only the impacted simulated session after applying the narrow policy correction.
The firewall HA peer has an old policy set|ha_policy_sync|stale|current|The standby policy generation is {value}.|Synchronize the standby and test failover; a working primary alone is insufficient.
Permit a new vendor service with least privilege|vendor_ports|none|tcp/8443|The requested scoped vendor service is {value}.|Allow only TCP 8443 from the approved support source to the application asset.
Publish an HTTPS application through ASA|publish_port|none|tcp/443|The approved public listener is {value}.|Create the specific HTTPS mapping and security permit while denying other public ports.
Build a route-based FortiGate site VPN|forti_tunnel_route|missing|10.80.0.0/16 via vpn-branch|The branch tunnel route is {value}.|Add the approved remote prefix via the tunnel alongside its specific policy.
Stage a Junos confirmed commit|confirmed_timer|none|5|The reviewed rollback timer in minutes is {value}.|Use a bounded confirmed commit for a remote management change, then confirm after validation.
Commit a PAN-OS policy change|pan_commit|pending|committed|The running policy deployment state is {value}.|The PAN-OS candidate must be committed before traffic uses the new policy.
Limit an administrative jump host|admin_source|any|10.24.99.10/32|The management source restriction is {value}.|Permit only the jump host, maintaining out-of-band access for recovery.
Audit unused firewall rules|rule_audit|undocumented|evidence_recorded|The rule-hit and ownership audit is {value}.|Record hit counts, owner and retention decisions without deleting unreviewed rules.
Plan a certificate renewal with rollback|certificate_plan|incomplete|approved_with_rollback|The renewal plan readiness is {value}.|Include trust-chain, expiry, rollback and client validation in the approved maintenance plan.
Gather a vendor escalation for intermittent tunnels|vendor_escalation|incomplete|logs_topology_timestamps|The escalation package is {value}.|Provide tunnel logs, topology, timestamps and a bounded reproduction rather than guessing a configuration change.
Audit management exposure on the firewall|management_audit|undocumented|evidence_recorded|The administrative exposure audit is {value}.|Document source restrictions and management listeners with actual diagnostic evidence.`,
'Network services': `DHCP scope is exhausted by stale leases|dhcp_capacity|64|128|The scope has 96 active clients and capacity {value}.|Expand within the approved IPAM allocation without creating overlapping ranges.
The new VLAN has no DHCP relay|dhcp_relay|missing|10.24.99.20|The client SVI relay destination is {value}.|Relay broadcasts to the verified DHCP server on the services network.
A rogue DHCP server advertises the wrong gateway|rogue_dhcp_action|none|onsite_isolate|Two DHCP offers have been observed; isolation action is {value}.|Locate and isolate the unauthorized server rather than altering the legitimate scope.
A stale A record points to the old application|dns_a|10.24.20.8|10.24.20.18|app.example.test resolves to {value}.|Update the authoritative record and verify after simulated TTL expiry.
The conditional forwarder targets a retired resolver|dns_forwarder|10.80.0.9|10.80.0.53|The hybrid forwarder targets {value}.|Use the reachable authoritative private resolver for the specific zone.
DHCP option 003 has the previous gateway|dhcp_gateway|10.24.20.254|10.24.20.1|The offered default gateway is {value}.|Correct the gateway option and renew the modeled client lease.
DHCP option 006 directs users to a public resolver|dhcp_dns|192.0.2.53|10.24.99.53|The offered resolver is {value}.|Internal application names require the corporate resolver.
A reservation uses the old endpoint MAC|reservation_mac|00:11:22:33:44:55|00:aa:bb:cc:dd:ee|The reservation client identity is {value}.|Bind the reserved address to the verified replacement endpoint.
An exclusion covers the entire dynamic range|dhcp_exclusion|10.24.20.50-10.24.20.200|10.24.20.1-10.24.20.49|The excluded range is {value}.|Reserve infrastructure addresses while leaving the planned dynamic pool available.
DNS cache retains a record past migration|dns_cache|stale|fresh|The endpoint cached generation is {value}.|Expire or flush the specific modeled cache after verifying the authoritative record.
The application CNAME forms a cycle|dns_cname|app.example.test|service.example.test|The alias app.example.test targets {value}.|Point the alias at the canonical service rather than itself.
The resolver recursion ACL omits a branch|dns_recursion|10.24.0.0/16|10.24.0.0/16,10.82.0.0/16|The allowed recursion networks are {value}.|Permit the verified branch range without making an open resolver.
A DNSSEC clock skew rejects valid answers|ntp_offset|900|0|The resolver simulated clock offset is {value} seconds.|Restore trusted time synchronization so signature validity checks are meaningful.
An IPAM conflict causes duplicate addresses|ipam_action|none|conflict_reassigned|ARP ownership alternates between two assets; remediation record is {value}.|Reassign the duplicate through IPAM and verify a single owner.
A Windows DNS service is stopped|dns_service|stopped|running|The DNS server service state is {value}.|Start the required resolver service and check its listener and event log.
Deploy a branch DHCP scope|new_scope|missing|10.82.20.50-10.82.20.200|The requested branch dynamic range is {value}.|Create the approved nonoverlapping scope with correct gateway and resolver options.
Publish a private service record|srv_record|missing|_app._tcp=service.example.test:8443|The service discovery record is {value}.|Publish the approved target and port in the private zone.
Configure split DNS for remote workers|split_dns|public-only|private-via-vpn|The resolver selection policy is {value}.|Send only private-zone queries through the VPN resolver path.
Audit DHCP failover ownership|dhcp_audit|undocumented|evidence_recorded|The lease ownership and failover audit is {value}.|Compare active leases and partner state before approving scope maintenance.
Plan IP addresses for a new clinic|ipam_plan|overlapping|10.83.0.0/16_reserved|The clinic allocation proposal is {value}.|Reserve a nonoverlapping site block and document subnets, growth and gateway conventions.`,
Wireless: `Corporate SSID lands in the guest VLAN|ssid_vlan|40|20|The corporate SSID maps to VLAN {value}.|Map authenticated corporate users to the intended business broadcast domain.
RADIUS rejects a replaced access point|radius_client|missing|10.24.99.30|The approved NAS client entry is {value}.|Register the verified AP source address rather than disabling authentication.
RADIUS shared-secret identifiers differ|radius_secret|old-key|key-2026|The server expects key-2026; AP key ID is {value}.|Align the simulated shared-secret identifier using the secure change workflow.
RADIUS traffic uses the accounting port|radius_port|1813|1812|Authentication requests target UDP {value}.|Send access requests to the authentication listener, preserving accounting separately.
An expired EAP server certificate breaks login|eap_certificate|expired|valid|The authentication server certificate state is {value}.|Renew with the approved trust chain instead of asking clients to bypass verification.
A roaming handset loses fast transition|fast_transition|off|on|The approved voice SSID 802.11r setting is {value}.|Enable the validated roaming feature for this compatible handset profile.
A neighboring AP causes channel contention|radio_channel|6|11|The adjacent AP occupies channel 6; local is {value}.|Use the surveyed nonoverlapping channel rather than merely raising power.
An AP country profile blocks the assigned channel|regulatory_domain|incorrect|approved|The deployment regulatory profile is {value}.|Use the approved regional profile; arbitrary channel enablement is inappropriate.
Minimum data rates exclude warehouse scanners|minimum_rate|24|12|The scanner supports the approved 12 Mbps minimum; configured is {value}.|Use the surveyed minimum that supports the asset without enabling all legacy rates.
Guest captive portal DNS cannot resolve|portal_dns|unreachable|reachable|The pre-authentication portal resolver path is {value}.|Allow only the required resolver and portal flow before authentication.
Dynamic VLAN assignment is not enabled|radius_vlan_override|off|on|RADIUS returns a role VLAN; controller override is {value}.|Honor the approved role assignment rather than placing every user in one VLAN.
Deploy an isolated contractor SSID|contractor_ssid|missing|vlan40_isolated|The contractor WLAN profile is {value}.|Create the guest-mapped profile and retain business-network isolation.
Add a redundant RADIUS server|radius_secondary|missing|10.24.99.32|The secondary authentication server is {value}.|Add the approved server and test authentication after primary failure.
Reduce transmit power for a crowded floor|radio_power|30|14|The survey recommends 14 dBm; configured is {value}.|Reduce cell overlap according to the measured plan and retest coverage.
Audit wireless roaming coverage|wireless_audit|undocumented|evidence_recorded|The coverage and roam evidence record is {value}.|Collect modeled roam events and signal evidence before recommending a radio change.`,
'WAN & HA': `CRC errors on a branch copper handoff|handoff_action|none|onsite_cable_replace|The handoff has CRC errors; onsite repair action is {value}.|Document counters and replace the damaged patch lead rather than changing routing.
An ISP path degrades only under load|isp_escalation|incomplete|loss_latency_timestamps|The carrier evidence package is {value}.|Escalate bounded loss and latency evidence with timestamps and the clean local interface counters.
Asymmetric routing crosses different firewalls|return_edge|backup|primary|The forward path is primary; return path is {value}.|Stateful traffic must return through the appropriate state-owning firewall.
Firewall failover uses the wrong virtual IP|ha_virtual_ip|10.24.20.254|10.24.20.1|The HA gateway VIP is {value}.|The floating gateway must match the clients on both HA members.
A tracked default route probes only the local modem|track_target|192.0.2.1|198.51.100.10|The reachability track target is {value}.|Probe the approved upstream destination so carrier failure can withdraw the route.
The backup WAN has no NAT policy|backup_nat|missing|scoped_pat|The standby egress translation policy is {value}.|Apply the same bounded outbound translation on the backup path and test failover.
A duplex mismatch raises late collisions|duplex|half|full|The peer is full duplex; local is {value}.|Align the verified handoff negotiation and check counters after the change.
A policer drops legitimate backup traffic|wan_rate|10|50|The approved backup circuit is 50 Mbps; policer is {value}.|Set the policer to the contracted capacity while preserving QoS classes.
A path MTU black hole stalls large transfers|wan_mss|1460|1360|The VPN transport MTU requires MSS 1360; configured is {value}.|Clamp the affected TCP flow to the supported transport size.
HA heartbeat on the wrong VLAN|heartbeat_vlan|20|98|The dedicated heartbeat network is VLAN 98; local is {value}.|Keep HA signaling on its intended isolated network.
Add a second Internet circuit|backup_route|missing|198.51.100.1 distance 200|The approved floating default is {value}.|Install the bounded backup path without making it preferred over the healthy primary.
Configure voice QoS on a constrained uplink|voice_qos|best-effort|priority_bounded|The voice treatment is {value}.|Reserve a bounded priority class instead of starving ordinary business traffic.
Test WAN failback without flapping|failback_hold|0|60|The approved recovery hold is 60 seconds; configured is {value}.|Require sustained recovery before moving sessions back to the preferred link.
Plan a carrier handoff maintenance window|wan_plan|incomplete|approved_with_rollback|The carrier change plan is {value}.|Document contacts, impact, rollback and primary/backup tests before approving work.
Audit dual-carrier physical diversity|diversity_audit|undocumented|evidence_recorded|The physical-path diversity evidence is {value}.|Two contracts are not sufficient proof of diverse last-mile infrastructure.`,
Azure: `An NSG deny shadows HTTPS to the VM|nsg_priority|500|100|The approved HTTPS permit priority is {value}; conflicting deny is 200.|A lower numeric priority must place the narrow permit ahead of the deny.
A subnet NSG omits the application port|nsg_port|443|8443|The application listener is TCP 8443; the allowed port is {value}.|Permit the actual listener only from the approved source.
A VM NIC NSG rejects the jump subnet|nic_nsg_source|10.25.99.0/24|10.24.99.0/24|The NIC management source is {value}.|Both subnet and NIC effective rules must permit the authorized jump subnet.
A UDR sends private traffic to the Internet|udr_next_hop|Internet|VirtualAppliance|The application prefix next-hop type is {value}.|Use the approved network virtual appliance rather than bypassing inspection.
The NVA route points to a retired private IP|udr_nva|10.80.0.9|10.80.0.4|The active appliance is 10.80.0.4; UDR target is {value}.|A VirtualAppliance route requires the reachable active NVA address.
Peering exists without forwarded traffic|peering_forwarded|off|on|The spoke receives NVA-forwarded packets; allowForwardedTraffic is {value}.|Permit forwarded traffic on the intended peering while preserving policy on the appliance.
The spoke cannot use the hub VPN gateway|use_remote_gateway|off|on|The spoke useRemoteGateways setting is {value}.|Enable use of the hub gateway on the eligible spoke peering.
The hub refuses gateway transit|allow_gateway_transit|off|on|The hub allowGatewayTransit setting is {value}.|Gateway transit needs complementary hub and spoke settings.
A private DNS zone is not linked to the spoke|private_dns_link|missing|spoke-vnet|The private-zone VNet link is {value}.|Link the client VNet so the private endpoint name resolves internally.
A private endpoint request is pending|private_endpoint_approval|pending|approved|The endpoint connection state is {value}.|Approve the verified requested connection instead of enabling public service access.
The VM guest firewall blocks a permitted flow|guest_firewall_port|443|8443|Effective NSGs permit 8443; guest firewall permits {value}.|Guest policy remains an independent enforcement layer after Azure networking permits the flow.
Load balancer probe uses the wrong path|azure_probe_path|/|/health|The backend serves its health endpoint at /health; probe requests {value}.|Probe the actual healthy endpoint instead of weakening backend health evaluation.
Azure Firewall application rule has the old FQDN|azure_firewall_fqdn|old.vendor.test|api.vendor.test|The approved API FQDN is api.vendor.test; rule matches {value}.|Permit the precise current vendor hostname without wildcard Internet access.
ExpressRoute BGP advertises the wrong prefix|expressroute_prefix|10.81.0.0/16|10.24.0.0/16|The on-premises advertisement is {value}.|Advertise the actual authorized site allocation to establish the return path.
A private endpoint resolves to a public record|azure_private_record|192.0.2.20|10.80.20.5|The endpoint name resolves to {value}.|The private-zone A record must reference the approved endpoint NIC.
Azure VPN connection uses the wrong key ID|azure_vpn_key|old-key|key-2026|The on-premises peer key ID is key-2026; Azure uses {value}.|Coordinate the simulated connection key identifiers.
An NVA has IP forwarding disabled|azure_ip_forwarding|off|on|The appliance NIC enableIPForwarding setting is {value}.|Forwarded traffic requires NIC forwarding as well as the guest routing configuration.
Route propagation is disabled on the gateway path|azure_bgp_propagation|off|on|The route-table gateway propagation setting is {value}.|Accept the intended BGP routes while checking UDR precedence.
An Azure subnet overlaps the future branch|azure_subnet|10.24.20.0/24|10.84.20.0/24|The reserved cloud allocation is 10.84.0.0/16; proposed subnet is {value}.|Use the nonoverlapping reserved cloud subnet for hybrid routing.
Create a private endpoint for storage|storage_endpoint|missing|private_approved|The storage private connectivity deployment is {value}.|Deploy the approved endpoint and private name resolution while leaving public access denied.
Add a narrowly scoped NSG administration rule|azure_admin_rule|any|10.24.99.10/32:22|The management source and service are {value}.|Use the jump-host /32 and SSH service rather than unrestricted administration.
Deploy a hub inspection route|azure_inspection_route|missing|0.0.0.0/0 via 10.80.0.4|The approved inspection default is {value}.|Route egress through the designated firewall and retain private return routes.
Configure a redundant Azure load-balancer backend|azure_backend|primary-only|primary,secondary|The tested backend membership is {value}.|Register and validate both approved application instances.
Audit Azure effective routes and rules|azure_audit|undocumented|evidence_recorded|The effective configuration audit is {value}.|Record the combined NIC/subnet rules and longest-prefix routes, not just one resource screenshot.
Plan an ExpressRoute circuit migration|expressroute_plan|incomplete|approved_with_rollback|The circuit migration plan is {value}.|Include BGP advertisements, fallback VPN, contact details and rollback validation.`,
AWS: `A security group omits the application listener|sg_port|443|8443|The instance listener is TCP 8443; inbound SG service is {value}.|Permit the approved source on the real listener; SG return traffic is statefully allowed.
A NACL blocks ephemeral return traffic|nacl_return|443|1024-65535|The response destination uses ephemeral ports; outbound NACL permits {value}.|NACLs are stateless and need a separate matching return rule.
A private route table has the wrong gateway|vpc_next_hop|igw|nat-gateway|The private subnet default target is {value}.|Use the approved NAT gateway for private egress rather than assuming an Internet gateway translates private addresses.
VPC peering is pending acceptance|vpc_peering|pending|active|The cross-account peering state is {value}.|Accept the authorized peering request and verify its explicit routes.
A peer subnet has no return route|aws_peer_return|missing|10.24.0.0/16 via pcx|The remote route table return entry is {value}.|VPC peering requires routes on both sides, with no transitive-routing assumption.
Transit Gateway attachment is not propagating|tgw_propagation|off|on|The approved attachment route propagation is {value}.|Propagate the spoke route into the intended TGW route table.
A TGW attachment is associated with the wrong table|tgw_association|quarantine|production|The approved attachment route-table association is {value}.|Use the correct segmentation table while retaining the isolated guest attachment.
Route 53 Resolver rule is not shared with the VPC|resolver_association|missing|workload-vpc|The conditional resolver rule association is {value}.|Associate the private-zone forwarding rule with the querying VPC.
An inbound Resolver endpoint SG blocks DNS|resolver_port|tcp/53|tcp+udp/53|The DNS endpoint transport set is {value}.|Permit both approved DNS transports so normal queries and TCP fallback work.
A gateway endpoint is absent from one route table|s3_endpoint_route|missing|private-rt|The S3 gateway endpoint association is {value}.|Associate the intended private route table rather than sending the workload through public egress.
An interface endpoint SG excludes the application|endpoint_sg|10.25.20.0/24|10.24.20.0/24|The private endpoint approved source range is {value}.|Allow the actual client range on the endpoint listener.
AWS VPN BGP advertises an unrelated subnet|aws_vpn_prefix|10.25.0.0/16|10.24.0.0/16|The customer gateway BGP advertisement is {value}.|Advertise the actual on-premises network to provide the correct return path.
ALB health checks use the wrong port|alb_health_port|80|8443|The healthy backend listener is 8443; ALB checks {value}.|Align health checks with the approved backend service rather than forcing unhealthy targets online.
Network Firewall rule group drops vendor TLS|network_firewall_domain|old.vendor.test|api.vendor.test|The approved TLS domain list contains {value}.|Update the specific permitted vendor domain while retaining the inspection route.
Direct Connect virtual interface uses the wrong VLAN|dx_vlan|101|100|The provider agreed tag is 100; VIF configuration is {value}.|Align the virtual-interface VLAN with the provider handoff.
A NACL lower-numbered deny shadows the permit|nacl_rule_order|deny-first|scoped-permit-first|The evaluated inbound NACL order is {value}.|Place the narrow authorized permit before the matching deny, preserving all other restrictions.
An SG references the retired application group|sg_source_reference|sg-old-app|sg-active-app|The backend source-group reference is {value}.|Reference the active application-tier group rather than widening to the full VPC.
A blackhole route remains after NAT replacement|nat_target_state|deleted|available|The selected NAT route target state is {value}.|Replace the route target with the approved available NAT gateway.
A private hosted zone is associated with the wrong VPC|private_zone_vpc|legacy-vpc|workload-vpc|The private hosted-zone association is {value}.|Associate the querying workload VPC and verify private resolution.
Deploy an isolated AWS application subnet|aws_subnet|missing|10.85.20.0/24|The approved application subnet is {value}.|Use the reserved nonoverlapping VPC allocation with the private route table.
Create a least-privilege instance security group|aws_admin_rule|any|10.24.99.10/32:22|The administrative source and port are {value}.|Permit the jump host only; preserve stateful return behavior.
Add the secondary site-to-site VPN tunnel|aws_second_tunnel|missing|configured_tested|The secondary tunnel deployment and test state is {value}.|Configure the approved second tunnel and validate routing under primary failure.
Share a TGW route to a new branch|aws_branch_route|missing|10.82.0.0/16 via tgw|The approved branch route is {value}.|Install the specific branch route in the intended table without joining isolated tenants.
Audit with Reachability Analyzer|reachability_audit|undocumented|configuration_analysis_recorded|The configuration-analysis evidence is {value}.|Record the analyzed configuration path and separately verify live simulated service behavior.
Plan a Direct Connect migration|dx_plan|incomplete|approved_with_rollback|The private-circuit migration plan is {value}.|Document VLAN/BGP handoff, backup VPN, maintenance contacts and rollback tests.`,
Operations: `Terraform state differs from a live route table|terraform_route|manual-drift|declared|The route ownership state is {value}.|Reconcile the reviewed intended route through the simulated IaC plan rather than overwriting all resources.
Bicep NSG deployment misses the approved source|bicep_source|any|10.24.99.10/32|The reviewed management source parameter is {value}.|Use the exact approved source and inspect the simulated deployment diff.
CloudFormation rollback left a stale security group|cfn_group|stale|approved|The referenced stack group generation is {value}.|Reconcile the approved stack reference before retrying the bounded deployment.
The nightly configuration backup is empty|backup_integrity|empty|verified|The restore-point integrity state is {value}.|Produce and verify a usable configuration restore point instead of trusting job success alone.
Restore a tested switch configuration|restore_generation|unknown|known-good|The chosen restore generation is {value}.|Restore the documented verified baseline and retest application and isolation behavior.
Add monitoring for the backup Internet circuit|backup_monitor|missing|probe_and_alert|The standby path monitor is {value}.|Monitor the backup path directly and verify the alert transition during a simulated failure.
Rotate a scoped automation credential identifier|automation_key|old-key|key-2026|The approved simulated key identifier is {value}.|Rotate the bounded identity and verify the job without embedding real credentials.
Plan a firewall firmware maintenance|firmware_plan|incomplete|approved_with_rollback|The firmware change plan is {value}.|Document version compatibility, verified backup, HA sequence, rollback and post-upgrade tests.
Prepare a technician handoff for a recurring incident|handoff_record|incomplete|evidence_hypothesis_next_steps|The handoff package is {value}.|Record evidence, tested hypotheses, changes and next steps so another technician can continue safely.
Audit the monitoring and IPAM inventory|inventory_audit|undocumented|evidence_recorded|The ownership and address reconciliation audit is {value}.|Compare discovered assets with assigned addresses and document discrepancies without deleting unexplained devices.`,
};
