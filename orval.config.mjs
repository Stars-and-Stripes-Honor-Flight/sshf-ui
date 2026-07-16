import { defineConfig } from 'orval';

/**
 * Generates Zod schemas from docs/openapi.json.
 * Prefer `npm run sync-schemas` (fetch + generate) over calling orval directly.
 *
 * Component schemas land in src/schemas/generated/*.zod.ts.
 * Endpoint validators land in endpoints.ts (unused by the app; keep for completeness).
 */
export default defineConfig({
  sshf: {
    input: {
      target: './docs/openapi.json',
    },
    output: {
      client: 'zod',
      mode: 'single',
      target: './src/schemas/generated/endpoints.ts',
      schemas: './src/schemas/generated',
      clean: true,
      prettier: true,
      override: {
        zod: {
          version: 3,
          generateReusableSchemas: true,
        },
      },
    },
  },
});
