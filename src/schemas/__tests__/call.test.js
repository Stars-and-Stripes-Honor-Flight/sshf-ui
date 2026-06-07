import { HOW_HEARD_ABOUT_VALUES, howHeardAboutSchema } from '@/schemas/call';
import openapi from '../../../docs/openapi.json';

describe('call schema', () => {
  test('HOW_HEARD_ABOUT_VALUES matches OpenAPI Veteran call.how_heard_about enum', () => {
    const openapiEnum = openapi.components.schemas.Veteran.properties.call.properties.how_heard_about.enum;
    expect(HOW_HEARD_ABOUT_VALUES).toEqual(openapiEnum);
  });

  test('HOW_HEARD_ABOUT_VALUES matches OpenAPI Guardian call.how_heard_about enum', () => {
    const openapiEnum = openapi.components.schemas.Guardian.properties.call.properties.how_heard_about.enum;
    expect(HOW_HEARD_ABOUT_VALUES).toEqual(openapiEnum);
  });

  test('howHeardAboutSchema defaults to Unknown', () => {
    expect(howHeardAboutSchema.parse(undefined)).toBe('Unknown');
  });

  test('howHeardAboutSchema rejects invalid values', () => {
    expect(() => howHeardAboutSchema.parse('invalid')).toThrow();
  });
});
