# Configuration
$BUCKET_NAME = "sshf-ui-static-dev2"
$PROJECT_ID = "sshf-ui-dev"
$REGION = "us-central1"  # or your preferred region

# Create bucket if it doesn't exist
try {
    gsutil mb -b on -p $PROJECT_ID -l $REGION gs://$BUCKET_NAME
} catch {
    Write-Host "Bucket may already exist, continuing..."
}

# Set bucket as public
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# Enable website serving
@"
{
    "mainPageSuffix": "index.html",
    "notFoundPage": "404.html"
}
"@ | Out-File -FilePath "website.json" -Encoding UTF8

gsutil web set -m index.html -e 404.html gs://$BUCKET_NAME

# Set Cache-Control headers for different file types
# HTML files - shorter cache
gsutil -h "Cache-Control:public, max-age=3600" cp -r out/*.html gs://$BUCKET_NAME/

# Static assets - longer cache
gsutil -h "Cache-Control:public, max-age=31536000, immutable" cp -r out/_next gs://$BUCKET_NAME/_next
gsutil -h "Cache-Control:public, max-age=31536000, immutable" cp -r out/assets gs://$BUCKET_NAME/assets

# Other static files at root - using try/catch since files might not exist
try {
    gsutil -h "Cache-Control:public, max-age=31536000, immutable" cp -r out/*.ico gs://$BUCKET_NAME/
    gsutil -h "Cache-Control:public, max-age=31536000, immutable" cp -r out/*.txt gs://$BUCKET_NAME/
    gsutil -h "Cache-Control:public, max-age=31536000, immutable" cp -r out/*.json gs://$BUCKET_NAME/
} catch {
    Write-Host "Some static files might not exist, continuing..."
}

# Set CORS policy
@"
[
    {
      "origin": ["*"],
      "method": ["GET", "HEAD", "OPTIONS"],
      "responseHeader": ["Content-Type"],
      "maxAgeSeconds": 3600
    }
]
"@ | Out-File -FilePath "cors.json" -Encoding UTF8

gsutil cors set cors.json gs://$BUCKET_NAME

# Clean up temporary files
Remove-Item -Path website.json, cors.json -Force

Write-Host "Deployment complete! Your site is available at: https://storage.googleapis.com/$BUCKET_NAME/index.html" 