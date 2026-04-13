export type ReportType = 'invoice' | 'retribusi';

export interface Customer {
  id: string;
  name: string;
  address: string;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  item_date: string;
  quantity: number;
  price_per_unit: number;
  subtotal: number;
}

export interface Invoice {
  id: string;
  customer_id: string;
  report_type: ReportType;
  invoice_date: string;
  total_amount: number;
  created_at: string;
  customers?: Customer;
  invoice_items?: InvoiceItem[];
}

export interface InvoiceFormData {
  report_type: ReportType;
  customer_id: string;
  is_new_customer: boolean;
  new_customer_name: string;
  new_customer_address: string;
  invoice_date: string;
  items: {
    item_date: string;
    quantity: number;
    subtotal: number;
  }[];
  grand_total: number;
}
