DROP INDEX `idx_order_transaction_provider`;--> statement-breakpoint
CREATE UNIQUE INDEX `uq_order_transaction_provider` ON `order` (`transaction_id`,`payment_provider`);
