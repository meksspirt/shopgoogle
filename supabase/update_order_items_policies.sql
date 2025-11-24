-- Add missing policies for order_items table
-- Run this if you already have the database set up

-- Add view policy for order_items
create policy if not exists "Public can view order items"
  on order_items for select
  using ( true );

-- Add delete policy for order_items
create policy if not exists "Public can delete order items"
  on order_items for delete
  using ( true );
