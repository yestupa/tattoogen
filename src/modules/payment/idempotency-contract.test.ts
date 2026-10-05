import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const service = readFileSync(new URL('./service.ts', import.meta.url), 'utf8');
const schema = (dialect: 'sqlite' | 'postgres' | 'mysql') =>
  readFileSync(
    new URL(`../../config/db/schema.${dialect}.ts`, import.meta.url),
    'utf8'
  );

describe('payment success idempotency', () => {
  it('claims a payable order inside the credit-grant transaction', () => {
    expect(service).toContain('const processed = await db().transaction');
    expect(service).toContain(
      'inArray(order.status, [OrderStatus.CREATED, OrderStatus.PENDING])'
    );
    expect(service).toContain('.set({ status: OrderStatus.PAID })');
    expect(service).toContain('.returning({ id: order.id })');
    expect(service).toContain('if (!claimed.length) return false');
    expect(service.indexOf('if (!claimed.length) return false')).toBeLessThan(
      service.indexOf('await tx.insert(credit).values')
    );
  });

  it('uses a stable unique provider transaction key for renewals', () => {
    expect(service).toContain('const renewalTransactionId =');
    expect(service).toContain('eq(order.transactionId, renewalTransactionId)');
    expect(service).toContain('transactionId: renewalTransactionId');
    for (const dialect of ['sqlite', 'postgres', 'mysql'] as const) {
      expect(schema(dialect)).toContain(
        "uniqueIndex('uq_order_transaction_provider')"
      );
    }
  });
});
