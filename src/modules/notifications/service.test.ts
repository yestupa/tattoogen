import { describe, expect, it } from 'vitest';

import { buildPaymentNotification, buildSignupNotification } from './service';

describe('operational notification content', () => {
  it('builds a verified signup alert without secrets', () => {
    const message = buildSignupNotification({
      appName: 'Tattoo Generator',
      userId: 'user-1',
      name: 'Avery',
      email: 'avery@example.com',
      locale: 'en',
      createdAt: new Date('2026-10-05T00:00:00.000Z'),
    });
    expect(message.subject).toContain('New verified signup');
    expect(message.text).toContain('avery@example.com');
    expect(message.text).toContain('user-1');
    expect(message.text).not.toMatch(/password|api.?key/i);
  });

  it('builds a paid order alert with amount and order identity', () => {
    const message = buildPaymentNotification({
      appName: 'Tattoo Generator',
      orderNo: 'order-42',
      userEmail: 'buyer@example.com',
      productName: 'Premium',
      amount: 1999,
      currency: 'usd',
      provider: 'stripe',
      paidAt: new Date('2026-10-05T01:00:00.000Z'),
    });
    expect(message.subject).toContain('Payment received');
    expect(message.text).toContain('order-42');
    expect(message.text).toContain('19.99 USD');
  });
});
