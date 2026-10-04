import { and, eq, sql } from 'drizzle-orm';

import { db } from '@/core/db';
import { getConfiguredEmailProvider } from '@/core/email/configured';
import { envConfigs } from '@/config';
import { notificationEvent } from '@/config/db/schema';
import { getAllConfigs } from '@/modules/config/service';
import { getUuid } from '@/lib/hash';

const DEFAULT_NOTIFICATION_RECIPIENT = 'yestupaofficial@gmail.com';

type NotificationMessage = { subject: string; text: string };

function iso(value?: Date | string | null) {
  if (!value) return new Date().toISOString();
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime())
    ? new Date().toISOString()
    : date.toISOString();
}

export function buildSignupNotification(params: {
  appName: string;
  userId: string;
  name: string;
  email: string;
  locale?: string | null;
  createdAt?: Date | string | null;
}): NotificationMessage {
  return {
    subject: `New verified signup - ${params.appName}`,
    text: [
      `A new user completed email verification on ${params.appName}.`,
      '',
      `Name: ${params.name || '-'}`,
      `Email: ${params.email}`,
      `User ID: ${params.userId}`,
      `Locale: ${params.locale || '-'}`,
      `Registered at: ${iso(params.createdAt)}`,
    ].join('\n'),
  };
}

export function buildPaymentNotification(params: {
  appName: string;
  orderNo: string;
  userEmail?: string | null;
  productName?: string | null;
  amount?: number | null;
  currency?: string | null;
  provider?: string | null;
  paidAt?: Date | string | null;
}): NotificationMessage {
  const amount = Number.isFinite(params.amount)
    ? ((params.amount || 0) / 100).toFixed(2)
    : '-';
  const currency = params.currency?.toUpperCase() || '-';
  return {
    subject: `Payment received - ${params.appName}`,
    text: [
      `A payment completed on ${params.appName}.`,
      '',
      `Order: ${params.orderNo}`,
      `Customer: ${params.userEmail || '-'}`,
      `Product: ${params.productName || '-'}`,
      `Amount: ${amount} ${currency}`,
      `Provider: ${params.provider || '-'}`,
      `Paid at: ${iso(params.paidAt)}`,
    ].join('\n'),
  };
}

function sanitizeDeliveryError(value: unknown) {
  return String(value ?? 'Unknown delivery error')
    .replace(/\b(?:re|fc|fcak)_[a-z0-9_-]{8,}\b/gi, 'redacted')
    .replace(/\bBearer\s+\S+/gi, 'Bearer redacted')
    .slice(0, 500);
}

async function claimNotification(params: {
  eventKey: string;
  type: string;
  recipient: string;
  payload: Record<string, unknown>;
}) {
  const now = new Date();
  try {
    await db()
      .insert(notificationEvent)
      .values({
        id: getUuid(),
        eventKey: params.eventKey,
        type: params.type,
        recipient: params.recipient,
        payloadJson: JSON.stringify(params.payload),
        status: 'pending',
        attempts: 1,
        createdAt: now,
        updatedAt: now,
      });
    return true;
  } catch {
    const [existing] = await db()
      .select({ status: notificationEvent.status })
      .from(notificationEvent)
      .where(eq(notificationEvent.eventKey, params.eventKey))
      .limit(1);
    if (!existing || existing.status !== 'failed') return false;
    const claimed = await db()
      .update(notificationEvent)
      .set({
        status: 'pending',
        attempts: sql`${notificationEvent.attempts} + 1`,
        lastError: null,
        updatedAt: now,
      })
      .where(
        and(
          eq(notificationEvent.eventKey, params.eventKey),
          eq(notificationEvent.status, 'failed')
        )
      )
      .returning({ id: notificationEvent.id });
    return claimed.length > 0;
  }
}

async function deliverOperationalNotification(params: {
  eventKey: string;
  type: 'verified_signup' | 'payment';
  payload: Record<string, unknown>;
  message: NotificationMessage;
  enabledConfig: string;
}) {
  const configs = await getAllConfigs();
  if (configs[params.enabledConfig] === 'false') return false;
  const email = getConfiguredEmailProvider(configs);
  if (!email) return false;

  const recipient =
    configs.operational_notification_email?.trim() ||
    DEFAULT_NOTIFICATION_RECIPIENT;
  if (
    !(await claimNotification({
      eventKey: params.eventKey,
      type: params.type,
      recipient,
      payload: params.payload,
    }))
  ) {
    return true;
  }

  const result = await email.provider.sendEmail({
    to: recipient,
    subject: params.message.subject,
    text: params.message.text,
  });
  await db()
    .update(notificationEvent)
    .set({
      status: result.success ? 'sent' : 'failed',
      sentAt: result.success ? new Date() : null,
      lastError: result.success ? null : sanitizeDeliveryError(result.error),
      updatedAt: new Date(),
    })
    .where(eq(notificationEvent.eventKey, params.eventKey));
  return result.success;
}

export async function notifyVerifiedSignup(user: {
  id: string;
  name: string;
  email: string;
  locale?: string | null;
  createdAt?: Date | string | null;
}) {
  const configs = await getAllConfigs();
  const appName = configs.app_name || envConfigs.app_name;
  return deliverOperationalNotification({
    eventKey: `verified-signup:${user.id}`,
    type: 'verified_signup',
    payload: { userId: user.id, email: user.email },
    message: buildSignupNotification({ appName, userId: user.id, ...user }),
    enabledConfig: 'signup_notification_enabled',
  });
}

export async function notifyPaymentSuccess(payment: {
  orderNo: string;
  userEmail?: string | null;
  productName?: string | null;
  amount?: number | null;
  currency?: string | null;
  paymentProvider?: string | null;
  paidAt?: Date | string | null;
}) {
  const configs = await getAllConfigs();
  const appName = configs.app_name || envConfigs.app_name;
  return deliverOperationalNotification({
    eventKey: `payment:${payment.orderNo}`,
    type: 'payment',
    payload: { orderNo: payment.orderNo, email: payment.userEmail || '' },
    message: buildPaymentNotification({
      appName,
      ...payment,
      provider: payment.paymentProvider,
    }),
    enabledConfig: 'payment_notification_enabled',
  });
}
