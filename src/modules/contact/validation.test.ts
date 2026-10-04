import { describe, expect, it } from 'vitest';

import { contactRequestSchema, isLikelyHumanContact } from './validation';

const validRequest = {
  requesterName: 'Avery',
  requesterEmail: 'avery@example.com',
  category: 'generation',
  subject: 'My generated design is missing',
  message: 'I completed a generation but cannot find the result in my library.',
  locale: 'en',
  website: '',
  startedAt: 1_700_000_000_000,
};

describe('contact request validation', () => {
  it('accepts a complete public support request', () => {
    expect(contactRequestSchema.safeParse(validRequest).success).toBe(true);
  });

  it('rejects invalid contact details and oversized content', () => {
    expect(
      contactRequestSchema.safeParse({
        ...validRequest,
        requesterEmail: 'not-an-email',
        message: 'x'.repeat(5001),
      }).success
    ).toBe(false);
  });

  it('accepts only the supported ticket categories', () => {
    expect(
      contactRequestSchema.safeParse({
        ...validRequest,
        category: 'anything-goes',
      }).success
    ).toBe(false);
  });
});

describe('contact anti-spam checks', () => {
  it('rejects the honeypot and submissions completed too quickly', () => {
    expect(
      isLikelyHumanContact({
        website: 'spam.example',
        startedAt: 1_700_000_000_000,
        now: 1_700_000_010_000,
      })
    ).toBe(false);

    expect(
      isLikelyHumanContact({
        website: '',
        startedAt: 1_700_000_000_000,
        now: 1_700_000_001_000,
      })
    ).toBe(false);
  });

  it('accepts a realistically timed form submission', () => {
    expect(
      isLikelyHumanContact({
        website: '',
        startedAt: 1_700_000_000_000,
        now: 1_700_000_005_000,
      })
    ).toBe(true);
  });
});
