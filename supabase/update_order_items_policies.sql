-- Add missing policies for order_items table
-- Run this if you already have the database set up

-- Drop existing policies if they exist (to avoid conflicts)
drop policy if exists "Public can view order items" on order_items;
drop policy if exists "Public can delete order items" on order_items;

-- Add view policy for order_items
create policy "Public can view order items"
  on order_items for select
  using ( true );

-- Add delete policy for order_items
create policy "Public can delete order items"
  on order_items for delete
  using ( true );
