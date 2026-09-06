# Dependency Verification for PR #154

## Actually Used Dependencies (Kept)

### @aws-sdk/client-s3 & @aws-sdk/credential-providers
**Used in:** `src/components/core/download-icon.js`
- Imported by flight export pages and flight details
- Required for S3 file downloads

### prop-types
**Used in:** 3 files
- `src/components/core/table/api-table.js`
- `src/app/(main)/layout.js`
- `src/app/(main)/settings/layout.js`

## Dead Code Removed

### @supabase/ssr (removed)
**Previously used in:** `src/lib/supabase/*.js` (3 files)
- These files were never imported anywhere in the codebase
- Referenced `config.supabase` which doesn't exist
- Files deleted: client.js, server.js, middleware.js

## Font Configuration

### Status: Using System Fonts
- Removed `@fontsource/*` packages (Inter, Roboto Mono, Plus Jakarta Sans)
- Typography config still references "Inter" as preferred font
- Falls back to system fonts: -apple-system, BlinkMacSystemFont, "Segoe UI", etc.
- **This is intentional** - reduces bundle size, uses native fonts

### Build Verification
- ✅ Build successful with no font warnings
- ✅ All 319 tests passing
- ✅ 0 vulnerabilities
- 11 more packages removed (down to 951 total)

## Summary
All remaining "added" dependencies are legitimately used in active code.
The @supabase files were dead code masquerading as active imports.
