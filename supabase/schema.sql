-- Create enum for report type
CREATE TYPE report_type_enum AS ENUM ('invoice', 'retribusi');

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    report_type report_type_enum NOT NULL,
    invoice_date DATE NOT NULL,
    total_amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_date DATE NOT NULL,
    quantity NUMERIC NOT NULL,
    price_per_unit NUMERIC NOT NULL,
    subtotal NUMERIC NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Add basic policies (allowing all access for now as it's a generator app)
CREATE POLICY "Allow all for customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for invoice_items" ON invoice_items FOR ALL USING (true) WITH CHECK (true);
