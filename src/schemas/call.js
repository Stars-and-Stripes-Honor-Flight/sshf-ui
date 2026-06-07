import { z } from 'zod';

export const HOW_HEARD_ABOUT_VALUES = [
  'Unknown',
  'VA or vet org',
  'radio segment',
  'tv interview or segment',
  'school or community event',
  'an SSHF event or fundraiser',
  'newspaper or magazine ad or story',
  'social media',
  'family or friend',
  'airport signage or experience',
  'Kwik Trip Pump ad',
  'other',
];

export const howHeardAboutSchema = z.enum(HOW_HEARD_ABOUT_VALUES).default('Unknown');

export const howHeardAboutOptions = HOW_HEARD_ABOUT_VALUES.map((value) => ({
  value,
  label: value,
}));
