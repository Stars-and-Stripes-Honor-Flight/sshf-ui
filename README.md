This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

1. Copy the example env file and fill in a local `GOOGLE_CLIENT_SECRET` if you
   need the OAuth sign-in flow:

```bash
cp .env.example .env.local
```

`.env.local` is gitignored. The four `NEXT_PUBLIC_*` values in `.env.example`
are the development defaults (API URL, Google client ID, full-access group,
and `NEXT_PUBLIC_ENVIRONMENT=Development`). Without them the client will not
point at a backend — there is no hardcoded API fallback.

2. Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Before a Cloud Run deploy, CI runs `npm run check-build-env` to ensure the four
`NEXT_PUBLIC_*` build variables are set.

## Schema sync (OpenAPI → Zod)

The backend OpenAPI 3.0 contract is the source of truth. This repo keeps a checked-in copy at `docs/openapi.json` and generates Zod schemas under `src/schemas/generated/` with [Orval](https://orval.dev/).

### When to sync

Run sync after the API team deploys a contract change (new/renamed fields, enums, DTOs):

```bash
# Fetch from the deployed dev API and regenerate Zod schemas
npm run sync-schemas

# Or fetch from a locally running API (http://localhost:8080)
npm run sync-schemas:local

# Regenerate from the existing docs/openapi.json without fetching
npm run generate-schemas
```

Then review and commit both the spec and generated schemas:

```bash
git diff docs/openapi.json src/schemas/generated/
git add docs/openapi.json src/schemas/generated/
git commit -m "chore: sync schemas from API"
```

Override the fetch URL with `SYNC_SCHEMAS_URL` if needed.

### Conflict handling

- Prefer **re-running sync** over hand-merging files under `src/schemas/generated/`.
- Never hand-edit `docs/openapi.json` or generated files. If the UI needs a different shape, change form wrappers or fix the API spec.
- If generated output and form validation disagree, keep form rules in `src/schemas/*.js` and surface API mismatches to the API project.

### Custom validation on top of generated schemas

Hand-written form schemas remain the UI import surface (`@/schemas/veteran`, etc.). Each re-exports the generated API schema for optional use:

```js
import { veteranSchema, veteranApiSchema } from '@/schemas/veteran';
// or: import { Veteran } from '@/schemas/generated';
```

To add stricter form rules later, wrap or extend the generated schema (`.extend`, `.pick`, `.merge`, `.superRefine`) in `src/schemas/*.js` — do not edit generated files.

Key generated models include `Veteran`, `Guardian`, `Flight`, flight-detail/assignment DTOs, and search/error schemas.


## Deployment

This project deploys to Google Cloud Run via GitHub Actions:

- **Development** — merge to `main` runs `.github/workflows/cloudrun-source.yml`
  (source deploy into `sshf-ui-dev`).
- **Production** — publishing a GitHub Release `vX.Y.Z` runs
  `.github/workflows/cloudrun-release-prd.yml` (source deploy into
  `sshf-ui-prd` behind a `production` environment approval gate).

Because Next.js inlines `NEXT_PUBLIC_*` at build time, each environment builds
from source with its own GitHub Actions variables. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
for the full pipeline, secrets, and release process.

### Required GitHub configuration

**Repository secrets** (dev deploy):

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `GCP_PROJECT_ID` | GCP project ID | `sshf-ui-dev` |
| `GCP_SERVICE_NAME` | Cloud Run service name | `sshf-ui` |
| `GCP_REGION` | GCP region | `us-central1` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Workload Identity Provider path | `projects/.../providers/...` |
| `GCP_SERVICE_ACCOUNT` | Deploy service account email | `...@sshf-ui-dev.iam.gserviceaccount.com` |
| `GCP_SECRET_NAME` | Secret Manager secret for `GOOGLE_CLIENT_SECRET` | `sshf-ui-google-client-secret-dev` |

**Repository variables** (dev client build):

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `https://sshf-api-330507742215.us-central1.run.app` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `....apps.googleusercontent.com` |
| `NEXT_PUBLIC_ROLE_FULL_ACCESS` | `sshf_app_dev_full_access@starsandstripeshonorflight.org` |
| `NEXT_PUBLIC_ENVIRONMENT` | `Development` |
| `NEXT_PUBLIC_FEATURE_ADHOC_QUERY` | `true` (optional; unset hides Ad-hoc Query) |

Production uses the GitHub `production` environment with the same secret/variable
names scoped to `sshf-ui-prd` and production values. Only `GOOGLE_CLIENT_SECRET`
is a real secret (Secret Manager); the `NEXT_PUBLIC_*` values are public by design.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

