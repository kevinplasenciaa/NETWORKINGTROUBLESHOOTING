# Validation record

The validation date is 2026-10-09. Tests execute the application’s actual server-side state and workflow functions; browser tests exercise the production Next.js server using system Chromium.

## Server suite

`npm test`: **216 passed, 0 failed, 0 skipped** at the recorded run.

- Exact 200 total; all nine primary-category counts, 130/50/20 task tags and 70/90/40 difficulty tags.
- For every seed: initial outcome fails, authored correction passes, segmentation/broad-access shortcuts fail, initial state resets, attempts are isolated and SQLite retains updates.
- All 200 additionally run through actual service-layer plan/approval/window/configure/commit/validate/reset operations, rather than engine fixtures alone.
- 12 representative CLI and GUI journeys, candidate-vs-running behavior and commit requirements.
- Longest-prefix routing, ordered policy, SG-vs-NACL return semantics, OSPF EXSTART/Hello mismatch, DNS-vs-IP distinction, current-state packet filters.
- Confirmed commit timeout, management disconnection and checkpoint recovery.
- Safe alternate STP/NSG configurations; approval gates and stale validation.
- No initial reference solution/hints in public attempt or queue payloads; browser identities cannot access another owner’s attempt.
- Required diagnosis/resolution/debrief, unaided scoring and explicit help tracking.
- Report diagram and user-input escaping; saved shift events and client KB corrections.

These tests establish correctness of the **declared finite-state scope**, not fidelity of all vendor protocols or equivalence to production clouds.

## Production build

`npm ci --cache /tmp/nettask-npm-cache` is the frozen-lockfile installation path. `npm run build` compiles the Next.js application and performs TypeScript checks. The production server is tested via local HTTP requests; no public deployment has been performed.

## Browser suite

`npm run test:e2e`: **3 passed, 0 failed, 0 skipped** against the production server and system Chromium. Checks include CLI completion with notes/debrief and a reload, AWS GUI/CLI consistency with an unsafe-change rejection, and a fresh mobile identity. The first run discovered a local-origin mismatch in mutation protection; it was corrected to compare the request Host and permit an explicitly configured proxy origin.

## External verification limitation

Official vendor documentation and supplementary-provider requests returned proxy 403 responses. These resources and version-specific command verification remain **unverified**, not passed or silently skipped. Saved environment domain additions do not establish live connectivity until applied and retried.
