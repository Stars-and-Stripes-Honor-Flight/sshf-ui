import * as generated from '@/schemas/generated';
import { flightApiSchema, flightSchema } from '@/schemas/flight';
import { guardianApiSchema, guardianSchema } from '@/schemas/guardian';
import { veteranApiSchema, veteranSchema } from '@/schemas/veteran';

describe('generated OpenAPI Zod schemas', () => {
  test('exports Veteran, Guardian, and Flight component schemas', () => {
    expect(generated.Veteran).toBeDefined();
    expect(generated.Guardian).toBeDefined();
    expect(generated.Flight).toBeDefined();
  });

  test('exports the UserPermissions summary from GET /user/permissions', () => {
    expect(generated.UserPermissions).toBeDefined();
    expect(typeof generated.UserPermissions.safeParse).toBe('function');
    const parsed = generated.UserPermissions.safeParse({
      email: 'jane@example.com',
      hasAccess: true,
      roles: ['READ'],
      permissions: ['records:read', 'exports:read'],
      evaluatedAt: '2026-10-01T15:04:05.000Z',
      expiresAt: '2026-10-01T15:19:05.000Z',
    });
    expect(parsed.success).toBe(true);
  });

  test('Veteran, Guardian, and Flight schemas support safeParse', () => {
    expect(typeof generated.Veteran.safeParse).toBe('function');
    expect(typeof generated.Guardian.safeParse).toBe('function');
    expect(typeof generated.Flight.safeParse).toBe('function');
  });

  test('form schema modules re-export API schemas without replacing form schemas', () => {
    expect(veteranApiSchema).toBe(generated.Veteran);
    expect(guardianApiSchema).toBe(generated.Guardian);
    expect(flightApiSchema).toBe(generated.Flight);
    expect(veteranSchema).not.toBe(generated.Veteran);
    expect(guardianSchema).not.toBe(generated.Guardian);
    expect(flightSchema).not.toBe(generated.Flight);
  });
});
