-- Migrate delivery note statuses removed from the simplified flow
-- SHIPPED / DELIVERED → VALIDATED (delivery was already done)
-- CANCELLED → DRAFT (so they can be re-evaluated or deleted)
UPDATE delivery_notes SET status = 'VALIDATED' WHERE status IN ('SHIPPED', 'DELIVERED');
UPDATE delivery_notes SET status = 'DRAFT'     WHERE status = 'CANCELLED';
