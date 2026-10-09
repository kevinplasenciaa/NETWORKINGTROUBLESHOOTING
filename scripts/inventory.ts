import { writeFileSync } from 'node:fs';
import { scenarios } from '../src/lib/scenarios';
const rows=scenarios.map(s=>`| ${s.ticket.id} | ${s.ticket.title} | ${s.ticket.category} | ${s.ticket.kind} | ${s.ticket.difficulty} | ${s.ticket.assets[1].vendor} | ${s.ticket.client.name} |`);
writeFileSync('docs/scenario-inventory.md',`# NetTask scenario inventory\n\nExactly 200 authored scenario mechanisms. Each lab has its own starting configuration, hidden reference outcome, five hints and behavior/constraint checks. Subjects are spoiler-free. All environments and evidence are simulated.\n\n| ID | Subject | Category | Type | Level | Platform | Client |\n| --- | --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}\n`);
console.log(`Wrote ${rows.length} scenarios to docs/scenario-inventory.md.`);
