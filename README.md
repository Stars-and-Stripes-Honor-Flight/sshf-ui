This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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

This project is deployed to Google Cloud Run via GitHub Actions. The deployment workflow (`.github/workflows/cloudrun-source.yml`) runs automatically when a pull request is merged to the `main` branch.

### Required GitHub Secrets

Configure these secrets in GitHub repository settings (`Settings > Secrets and variables > Actions`):

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `GCP_PROJECT_ID` | Your GCP project ID | `sshf-ui-dev` |
| `GCP_SERVICE_NAME` | Cloud Run service name | `sshf-ui` |
| `GCP_REGION` | GCP region for deployment | `us-central1` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Workload Identity Provider path | `projects/123456789/locations/global/workloadIdentityPools/github-pool/providers/github` |
| `GCP_SERVICE_ACCOUNT` | Service account email for deployment | `github-actions@sshf-ui-dev.iam.gserviceaccount.com` |
| `GCP_SECRET_NAME` | Name of Google Secret Manager secret | `sshf-ui-google-client-secret-dev` |

### Google Secret Manager

The `GOOGLE_CLIENT_SECRET` is pulled from Google Secret Manager at runtime (not stored in GitHub). Ensure the secret exists in your GCP project and the Cloud Run service account has access to it.

### GCP Setup

If you're reusing an existing Workload Identity Pool from another project (e.g., sshf-api), you may need to update the pool's attribute condition to include this repository:

```bash
gcloud iam workload-identity-pools providers update "github" \
  --project="YOUR_PROJECT_ID" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --attribute-condition="assertion.repository_owner == 'YOUR_GITHUB_ORG' && assertion.repository in ['YOUR_ORG/sshf-api', 'YOUR_ORG/sshf-ui']"
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

