# NetTask

NetTask is a self-contained MSP ticket workbench and deterministic network lab application. It uses Next.js, React, TypeScript and server-side SQLite. All customers, devices, terminals, cloud resources and packet evidence are simulated. It does not call AI services or require cloud subscriptions or appliance licenses.

## Run

Use Node **24** (the development environment uses 24.19.0):

```sh
cd /workspace/NETWORKINGTROUBLESHOOTING
npm ci --cache /tmp/nettask-npm-cache
npm run dev
```

Production:

```sh
npm run build
npm start
```

The server listens on port 3000. Open it through your development environment's application access, or `http://localhost:3000` on your own machine. No external assets or fonts are needed at runtime.

```sh
npm test                  # engine, all 200 seeds, workflow and persistence
npm run test:e2e          # browser journeys; start the app first
npm run inventory         # regenerate the spoiler-free inventory
```

Browser tests use `/usr/bin/chromium`; set `CHROMIUM_PATH` if your browser is elsewhere. The server suite writes only to its own `/tmp/nettask-tests-<pid>` database. For browser tests use `NETTASK_DATA_DIR=/tmp/nettask-browser-data npm start` to keep test attempts separate from personal practice.

## Start practicing

1. Choose Guided Study, Independent Lab or Shift Mode. Open the ticket queue; filter by category, priority, level or status.
2. Read the customer description and approved requirements. Record a working hypothesis in Activity.
3. Inspect Assets/RMM and open endpoint, device or out-of-band terminal sessions. `help` describes the exact simulation scope; `lab inspect` collects current evidence.
4. Back up a checkpoint. For change/maintenance tickets save a complete plan, request simulated approval and open the maintenance window.
5. Use the shared configuration console or supported terminal commands. Junos/PAN-OS changes stage a candidate; commit before validating. Use save/startup controls for reboot persistence.
6. Capture packets, contact the simulated customer/vendor/onsite engineer, run the full regression validation, and write a resolution and interview debrief.
7. Resolve the ticket. Review scoring, reference explanation and replay; export a printable HTML simulated-lab report with a diagram, changes and checks.

## Curriculum

Exactly **200** individually authored mechanisms, across 12 fictional clients. These are finite, scenario-scoped labs rather than 200 full virtual appliance topologies. The faulty or incomplete starting state, corrective reference, hints and evaluation live on the server. Only observable configuration and requested help/debrief are returned to the browser.

| Category | Count |
| --- | ---: |
| Switching | 30 |
| Routing | 25 |
| Security | 35 |
| Network services | 20 |
| Wireless | 15 |
| WAN & HA | 15 |
| Azure | 25 |
| AWS | 25 |
| Operations | 10 |

Separate tags: **130 incidents, 50 change requests, 20 maintenance tasks**; **70 foundational, 90 intermediate, 40 advanced**. See [the complete inventory](docs/scenario-inventory.md).

Representative tested journeys: NT-0001, NT-0002, NT-0031, NT-0056 (ASA), NT-0059 (FortiOS), NT-0062 (Junos), NT-0064 (PAN-OS), NT-0094 (DNS), NT-0111 (wireless), NT-0141 (Azure), NT-0166 (AWS), NT-0177 (hybrid AWS VPN). Both Windows and Linux endpoints are exercised.

## Persistence and deployment

Data is stored in `.data/nettask.sqlite` using WAL journaling. Set `NETTASK_DATA_DIR` to a persistent directory for deployment. Keep the database plus its WAL/SHM files together while the process runs; stop the server before filesystem copies. Filesystems on ephemeral/serverless hosts are unsuitable without a persistent-volume adapter. This app is intended for one private learning installation, not public multitenant hosting.

An HTTP-only, SameSite cookie identifies the browser's independent progress. Reloads and application restarts preserve data; clearing cookies loses access to that browser identity. This is identity isolation, **not account authentication**. Set `NETTASK_SECURE_COOKIE=true` behind HTTPS. If a reverse proxy replaces Host headers, set `NETTASK_PUBLIC_ORIGIN` to the exact trusted public origin. Cross-origin mutations are rejected.

## Architecture

- `src/app/workbench.tsx`: ticket UI, dashboard and lab tools; type-only server imports.
- `src/lib/catalogue.ts` and `symptoms.ts`: authored hidden mechanisms and separate spoiler-free subjects.
- `src/lib/scenarios.ts` and `scenario-schema.ts`: validated seeds, client/device profiles, requirements and hints.
- `src/lib/network.ts`: CIDR matching, longest-prefix/AD/metric selection, ordered policies, stateful SG vs stateless NACL return behavior, OSPF/EIGRP adjacency, seeded sampling.
- `src/lib/engine.ts`: shared state, traffic checks, candidate/commit, checkpoint behavior, clock, evaluation and documentation coverage.
- `src/lib/adapters.ts` and `evidence.ts`: scoped terminal commands, vendor-mode handling and state-derived diagnostic/capture/monitoring evidence.
- `src/lib/storage.ts` and `service.ts`: SQLite attempts, actions, workflow, contact responses, help tracking, shift events and KB corrections.
- `src/lib/report.ts`: escaped printable HTML reports with SVG diagrams.
- `src/lib/integrations.ts`: interface for future user-provided isolated-lab adapters; no real integrations are included.

See [supported features and limitations](docs/supported-features.md) and [validation results](docs/validation.md). The current implementation is a working bounded simulator; it does not meet the full appliance-fidelity and verified-resource portions of the original specification.
