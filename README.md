This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


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

