# Handoff: Production Environment Setup for sshf-ui

**Audience:** the AI agent (and supervising human) tasked with creating the
production environment for sshf-ui, mirroring the completed sshf-api prod
setup. Written 2026-07-25 at the end of the sshf-api session. All facts below
were verified with read-only gcloud/gh commands on that date.

## Mission

Stand up `sshf-ui-prd` as a production environment sourced from `sshf-ui-dev`,
with a release-gated CI/CD pipeline, mirroring the pattern established for
sshf-api — **except where Next.js build-time configuration forces a different
promotion strategy (see the Critical Difference section; read it before
planning).**

## Reference implementation (already completed for sshf-api)

The sshf-api repo (`C:\Users\steve\Repos\sshf-api`) contains the working
reference. Study these before writing anything:

- `docs/DEPLOYMENT.md` — the full CI/CD design and rationale
- `.github/workflows/cloudrun-source.yml` — dev deploy (v3 actions + SHA image tagging)
- `.github/workflows/cloudrun-promote-prd.yml` — release-triggered promotion with approval gate

Completed sshf-api prod resources (naming patterns to mirror):

| Resource | Value |
|---|---|
| Runtime SA | `sshf-api-acc-prd@sshf-api-prd.iam.gserviceaccount.com` (only `secretmanager.secretAccessor`) |
| Deploy SA | `github-service-account@sshf-api-prd.iam.gserviceaccount.com` (`run.admin`, `serviceAccountUser` on runtime SA, registry writer) |
| WIF | pool `github-pool`, provider `sshf-api`, condition `assertion.repository_owner_id == '189932599' && assertion.repository_id == '<repo id>'` |
| Registry | `us-central1-docker.pkg.dev/sshf-api-prd/sshf-api/sshf-api` (note: 4 path segments) |
| Secrets | `sshf-api-*-prd` naming, values loaded by the user |
| GitHub | `production` environment, required reviewer `shmakes`, env-scoped `GCP_*` secrets |
| Versioning | semver git tags `vX.Y.Z` via GitHub Releases trigger promotion |

## THE CRITICAL DIFFERENCE: Next.js build-time configuration

sshf-ui is **Next.js 15** (Devias template). Verified facts:

- `NEXT_PUBLIC_*` variables (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`,
  `NEXT_PUBLIC_ROLE_FULL_ACCESS`, `NEXT_PUBLIC_SHOW_TEST_BANNER`) are **inlined
  into the client JS bundle at `next build` time**. Evidence:
  `src/lib/api.js:9`, `src/lib/auth/domain/client.js:6`, `src/config.js:13-18`,
  and the dev workflow's own comment (`cloudrun-source.yml:67-68`).
- `GOOGLE_CLIENT_SECRET` is server-side **runtime** config
  (`src/app/api/auth/token/route.js:4-5`) — a genuine secret, never in the bundle.
- There is **no runtime config endpoint** and no `next.config.*` in the repo.

**Consequence:** a container image built with dev's `NEXT_PUBLIC_API_URL`
serves dev's API URL forever. The sshf-api "build once, promote digest"
pipeline CANNOT be copied as-is.

Two options — present this decision to the user before implementing:

1. **Per-environment build at release (recommended, lower risk).** Keep dev as
   merge-to-main source deploy. For prod, the release-triggered workflow does a
   **source deploy into `sshf-ui-prd`** from the tagged commit,
   passing prod values as **build** env vars
   (`--update-build-env-vars` / `.env.production`, the same mechanism the dev
   workflow already uses for `NEXT_PUBLIC_SHOW_TEST_BANNER`). You lose
   binary-identical promotion but keep the approval gate, versioned releases,
   and prod isolation. Note `NEXT_PUBLIC_*` values are public by definition
   (they ship in the bundle) — they are not secrets, even though dev stores
   them in Secret Manager for convenience.
2. **Refactor to runtime config first.** Serve environment config from the
   Next.js server at request time (dynamic rendering or an `/api/config`
   route), then digest promotion works like sshf-api. Larger code change,
   test-first rules apply; only do this if the user opts in.

Also verify during implementation: dev's Cloud Run service stores all five
env vars as runtime `secretKeyRef`s, but client-visible values only work
because they were present **at build time**. Do not assume the runtime refs
are what the client bundle uses.

## Verified current state (2026-07-25)

### sshf-ui-dev (project number 593951006010)

- Cloud Run service `sshf-ui`, us-central1, public (`allUsers` invoker),
  1 CPU / 512Mi / timeout 300 / max 100, startup CPU boost.
  URL: `https://sshf-ui-593951006010.us-central1.run.app`
- Single SA `sshf-ui@sshf-ui-dev.iam.gserviceaccount.com` doubles as runtime
  AND deploy identity, with over-broad roles (`artifactregistry.admin`,
  `storage.admin`, `run.admin`, ...). **Do not replicate this in prod** — use
  the sshf-api split (separate runtime + deploy SAs, least privilege).
- Secrets: `sshf-ui-google-client-secret-dev`,
  `sshf-ui-next-public-api-url-dev`, `sshf-ui-next-public-google-client-id-dev`,
  `sshf-ui-next-public-role-full-access-dev`,
  `sshf-ui-next-public-show-test-banner` (note: last one has no `-dev` suffix).
- **No WIF pool in sshf-ui-dev** — the dev workflow authenticates against the
  pool in `sshf-api-dev` (org-wide `repository_owner` condition). The new
  prod pools are hardened per-repo, so `sshf-ui-prd` needs its **own** pool.
- Registry: `cloud-run-source-deploy` (source deploys), images untagged.

### sshf-ui-prd (project number 824787296892)

Greenfield: only `roles/owner` for steve.schmechel; Cloud Run, Secret
Manager, and Artifact Registry APIs disabled; no SAs, WIF, or repos.
Deterministic prod URL will be: `https://sshf-ui-824787296892.us-central1.run.app`

### Repo (`C:\Users\steve\Repos\sshf-ui`)

- GitHub `Stars-and-Stripes-Honor-Flight/sshf-ui`, repo ID `895307061`,
  owner ID `189932599`, default branch `main`.
- Workflows: `cloudrun-source.yml` (merged PR → dev source deploy),
  `run-tests.yml` (PR tests). Legacy GCS scripts `deploy.ps1`/`deploy.sh`
  exist — likely obsolete; ask the user before touching.
- `package.json` version is `7.2.1` (leftover Devias template versioning) and
  the name is still `@devias-kit-pro/nextjs-template`. Ask the user what the
  first prod release tag should be (fresh `v1.0.0` recommended).
- Hardcoded dev URLs exist: `src/lib/api.js:9` (dev API fallback — must not
  leak into a prod build; always set `NEXT_PUBLIC_API_URL` at build time),
  `scripts/resolve-openapi-url.mjs:3`, `docs/openapi.json`.
- `.cursor/rules/` exists (10 files incl. `test-first-planning.mdc`) — the
  same plan-first/test-first and secrets-hygiene rules apply in that repo.

## Coordination facts with the completed sshf-api prod

- Prod API URL: `https://sshf-api-928260206537.us-central1.run.app`
  → this is prod's `NEXT_PUBLIC_API_URL`.
- The prod API's `ALLOWED_ORIGINS` **already includes**
  `https://sshf-ui-824787296892.us-central1.run.app` — no API-side CORS change
  needed for the UI's Cloud Run URL. When the custom domain
  (`db.starsandstripeshonorflight.org` or similar) arrives, it must be added
  to the API's `ALLOWED_ORIGINS` and the OAuth client.
- The user created a **prod OAuth client** (stored in the API project's
  `sshf-api-auth-clientid-prd`). The UI should use the SAME client:
  its ID becomes `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, and its **client secret**
  goes into a new `sshf-ui-google-client-secret-prd`. The client's authorized
  JavaScript origins and redirect URIs must include the prod UI URL — user
  action in the `sshf-api-prd` console.
- `NEXT_PUBLIC_ROLE_FULL_ACCESS`: the Workspace group
  `sshf_app_prd_full_access@starsandstripeshonorflight.org` exists (verified);
  confirm with the user that this is the prod value.
- `NEXT_PUBLIC_SHOW_TEST_BANNER` should be `false`/absent for prod (confirm).
- No Admin SDK / Workspace access needed for the UI's runtime SA — group
  checks happen in the API, not the UI (verified: UI server routes only do
  OAuth token exchange).

## Suggested execution order

1. Confirm the promotion-strategy decision (Option 1 vs 2 above) with the user.
2. Enable APIs on `sshf-ui-prd`: `run`, `secretmanager`, `artifactregistry`,
   `iam`, `iamcredentials`, `sts` — **plus `cloudbuild` if Option 1 (prod
   source builds)**. Admin SDK not needed.
3. Create SAs: `sshf-ui-acc-prd` (runtime; `secretmanager.secretAccessor`) and
   `github-service-account` (deploy; `run.admin`, `serviceAccountUser` on
   runtime SA; for Option 1 add the source-deploy roles Cloud Build needs —
   check `run.sourceDeveloper`/`cloudbuild.builds.editor` against current docs).
4. Create secrets (containers only; user loads values):
   `sshf-ui-google-client-secret-prd`, `sshf-ui-next-public-api-url-prd`,
   `sshf-ui-next-public-google-client-id-prd`,
   `sshf-ui-next-public-role-full-access-prd`,
   `sshf-ui-next-public-show-test-banner-prd`.
5. WIF: pool `github-pool` + OIDC provider `sshf-ui` in `sshf-ui-prd`, with
   condition `assertion.repository_owner_id == '189932599' &&
   assertion.repository_id == '895307061'`; bind `workloadIdentityUser` for
   the repo principalSet to the deploy SA.
6. GitHub: `production` environment on sshf-ui repo (required reviewer
   `shmakes`, user ID 686667) + env secrets `GCP_PROJECT_ID=sshf-ui-prd`,
   `GCP_SERVICE_NAME=sshf-ui`, `GCP_REGION=us-central1`,
   `GCP_WORKLOAD_IDENTITY_PROVIDER=projects/824787296892/locations/global/workloadIdentityPools/github-pool/providers/sshf-ui`,
   `GCP_SERVICE_ACCOUNT=github-service-account@sshf-ui-prd.iam.gserviceaccount.com`.
   The gh CLI is authenticated as `shmakes` and can do all of this.
7. Release workflow + bootstrap deploy + smoke test, then documentation
   (mirror `docs/DEPLOYMENT.md`, adjusted for the chosen build strategy).

## Lessons learned in the sshf-api session (read before running commands)

- **Check before creating.** The user pre-created some resources (runtime SA,
  all secrets with values). Expect "already exists" conflicts; treat them as
  discoveries, not errors. Check secret values exist with
  `gcloud secrets versions list <name>` — NEVER `versions access`.
- **Artifact Registry paths have four segments**:
  `HOST/PROJECT/REPOSITORY/IMAGE`. `.../sshf-ui-prd/sshf-ui` is a repository,
  not an image — pushing to it fails with `NAME_INVALID`.
- **Cloud Run URLs are deterministic**: `https://<service>-<project-number>.<region>.run.app`.
  You can configure OAuth clients and env values before the first deploy.
- **PowerShell quoting bites**: gcloud `--format` strings containing spaces
  after commas and `gh --jq` expressions with spaces get mangled. Use simple
  `value(...)` formats, single-quoted compact jq, and the `"^;^KEY=a,b,c"`
  delimiter syntax for comma-containing `--set-env-vars` values.
- **Cloud mutations trigger approval cards** (Cursor auto-review). Retry the
  exact same command with the approval mechanism; the card UI occasionally
  errors ("Could not find bubble") — just retry. Batch related IAM bindings
  into one command to reduce approval round-trips.
- **Secrets hygiene**: create secret containers only; the user loads values.
  Never print tokens, secret values, or pipe them through command args (use
  `--password-stdin` / PowerShell variables).
- **Missing enabled APIs fail silently downstream.** sshf-api's group lookups
  returned empty because `admin.googleapis.com` wasn't enabled in prod and the
  app swallowed the 403. For the UI, the analogous risk is a prod build
  succeeding with a missing `NEXT_PUBLIC_API_URL` and silently baking in the
  dev fallback URL from `src/lib/api.js:9` — add a build-time guard or verify
  the bundle after the first deploy.
- **Verify by read-back.** After each provisioning phase, list/describe what
  was created. After deploy, smoke test: the UI should return 200 on `/` and
  the sign-in flow should reach Google with the prod client ID.
- The sshf-api dev deploy workflow was upgraded to `google-github-actions/*@v3`
  actions — do the same for sshf-ui while touching its workflows.

## User manual steps to schedule (small list)

1. OAuth client (in `sshf-api-prd` console): add the prod UI origin
   `https://sshf-ui-824787296892.us-central1.run.app` to authorized JavaScript
   origins and the appropriate redirect URI(s) used by the UI's auth flow
   (check `src/lib/auth/domain/` for the exact callback path).
2. Load the five `-prd` secret values (client secret, API URL, client ID,
   full-access role group, test banner flag).
3. Approve the GitHub production deployments.
4. Later: custom domain mapping + adding it to OAuth origins and the API's
   `ALLOWED_ORIGINS`.
