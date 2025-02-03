#!/bin/bash

# Configuration
BUCKET_NAME="sshf-ui-static-dev"
PROJECT_ID="sshf-ui-dev"
REGION="us-central1"  # or your preferred region

# Create bucket if it doesn't exist
gsutil mb -p $PROJECT_ID -l $REGION gs://$BUCKET_NAME || true

# Set bucket as public
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# Enable website serving
cat > website.json << EOF
{
    "mainPageSuffix": "index.html",
    "notFoundPage": "404.html"
}
EOF
gsutil web set -m index.html -e 404.html gs://$BUCKET_NAME

# Set Cache-Control headers for different file types
# HTML files - shorter cache
gsutil -h "Cache-Control:public, max-age=3600" cp -r out/*.html gs://$BUCKET_NAME/

# Static assets - longer cache
gsutil -h "Cache-Control:public, max-age=31536000, immutable" cp -r out/_next gs://$BUCKET_NAME/_next
gsutil -h "Cache-Control:public, max-age=31536000, immutable" cp -r out/assets gs://$BUCKET_NAME/assets

# Other static files at root
gsutil -h "Cache-Control:public, max-age=31536000, immutable" cp -r out/*.{ico,txt,json} gs://$BUCKET_NAME/ 2>/dev/null || true

# Set CORS policy
cat > cors.json << EOF
[
    {
      "origin": ["*"],
      "method": ["GET", "HEAD", "OPTIONS"],
      "responseHeader": ["Content-Type"],
      "maxAgeSeconds": 3600
    }
]
EOF
gsutil cors set cors.json gs://$BUCKET_NAME

# Clean up temporary files
rm website.json cors.json

echo "Deployment complete! Your site is available at: https://storage.googleapis.com/$BUCKET_NAME/index.html" 