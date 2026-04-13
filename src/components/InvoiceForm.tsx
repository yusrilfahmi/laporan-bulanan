'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Download, Eye, FileText, Loader2, X, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Customer } from '@/types';
import { format } from 'date-fns';
import { generatePDF, previewPDF } from '@/utils/pdfGenerator';
import CustomerManagerModal from './CustomerManagerModal';

const schema = z.object({
  report_type: z.enum(['invoice', 'retribusi']),
  customer_id: z.string().min(1, 'Pilih pelanggan terlebih dahulu'),
  invoice_date: z.string(),
  items: z.array(z.object({
    item_date: z.string(),
    quantity: z.coerce.number().min(0),
  })),
});

type FormValues = z.infer<typeof schema>;

export default function InvoiceForm() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const { register, control, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      report_type: 'invoice',
      customer_id: '',
      invoice_date: format(new Date(), 'yyyy-MM-dd'),
      items: [{ item_date: format(new Date(), 'yyyy-MM-dd'), quantity: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Use watch() for all form values to ensure deep reactivity
  const formData = watch();
  const reportType = formData.report_type;
  const items = formData.items || [];

  // Fetch customers
  async function fetchCustomers() {
    setIsLoading(true);
    const { data, error } = await supabase.from('customers').select('*').order('name');
    if (data) setCustomers(data);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  // REAL-TIME CALCULATIONS (Derived state - no useEffect needed)
  const defaultPrice = reportType === 'invoice' ? 350000 : 30;
  
  const calculatedItems = items.map((item: any, index: number) => {
    // Force read from formData directly to ensure reactivity
    const q = formData.items?.[index]?.quantity || 0;
    return {
      ...item,
      quantity: q,
      subtotal: q * defaultPrice
    };
  });

  const grandTotal = calculatedItems.reduce((sum: number, item: any) => sum + item.subtotal, 0);

  const handleAction = async (type: 'download' | 'preview') => {
    const formData = watch();
    
    if (!formData.customer_id) {
      alert("Silahkan pilih pelanggan terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    try {
      let customerData = customers.find(c => c.id === formData.customer_id);

      const pdfPayload = {
        ...formData,
        items: calculatedItems,
        grand_total: grandTotal,
        customer: customerData as Customer,
      };

      if (type === 'download') {
        await generatePDF(pdfPayload);
      } else {
        const url = await previewPDF(pdfPayload);
        setPreviewUrl(url);
      }
    } catch (error) {
      console.error('Error with PDF:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerDatePicker = (e: React.MouseEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
    try {
      (e.target as any).showPicker();
    } catch (err) { }
  };

  const handleAppend = () => {
    const lastItem = formData.items?.[formData.items.length - 1];
    append({
      item_date: lastItem ? lastItem.item_date : format(new Date(), 'yyyy-MM-dd'),
      quantity: lastItem ? lastItem.quantity : 0
    });
    
    setTimeout(() => {
      try {
        const dateInputs = document.querySelectorAll<HTMLInputElement>('input[type="date"]');
        const lastInput = dateInputs[dateInputs.length - 1]; // Select the last added date input
        if (lastInput) {
          lastInput.focus();
          (lastInput as any).showPicker();
        }
      } catch (err) { }
    }, 50);
  };

  if (isLoading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report Type */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Jenis Laporan</label>
            <select
              {...register('report_type')}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="invoice">Invoice</option>
              <option value="retribusi">Invoice Retribusi</option>
            </select>
          </div>

          {/* Invoice Date */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tanggal Invoice</label>
            <input
              type="date"
              {...register('invoice_date')}
              onClick={triggerDatePicker}
              onFocus={triggerDatePicker}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left"
            />
          </div>

          {/* Customer Selection */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Pelanggan
            </label>
            <div className="flex flex-col md:flex-row gap-3">
              <select
                {...register('customer_id')}
                className={`flex-1 p-4 bg-slate-50 dark:bg-slate-800 border ${errors.customer_id ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
              >
                <option value="">-- Pilih Pelanggan --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(true)}
                className="px-6 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all font-bold md:w-auto flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-600"
              >
                <Users className="w-5 h-5" />
                Atur Pelanggan
              </button>
            </div>
            {errors.customer_id && <p className="text-red-500 text-sm mt-1">{errors.customer_id.message}</p>}
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Detail Layanan</h3>
            <button
              type="button"
              onClick={handleAppend}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-bold shadow-lg shadow-blue-500/30"
            >
              <Plus className="w-5 h-5" />
              Tambah Item
            </button>
          </div>

          <div className="overflow-x-auto -mx-6 sm:mx-0 rounded-xl">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {reportType === 'invoice' ? 'Jumlah (Rit)' : 'Berat (Kg)'}
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Subtotal
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20">
                        Hapus
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                    {fields.map((field, index) => {
                      const currentQuantity = formData.items?.[index]?.quantity || 0;
                      const currentSubtotal = currentQuantity * defaultPrice;
                      
                      return (
                      <tr key={field.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="date"
                            {...register(`items.${index}.item_date`)}
                            onClick={triggerDatePicker}
                            onFocus={triggerDatePicker}
                            className="bg-transparent border-none focus:ring-0 outline-none w-36 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="number"
                            step="any"
                            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="bg-transparent border-dashed border-b border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-0 outline-none w-24 text-sm font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            Rp {new Intl.NumberFormat('id-ID').format(currentSubtotal)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Grand Total */}
        <div className="flex flex-col xl:flex-row items-center justify-between gap-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center md:text-left">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Total Pembayaran</p>
            <div className="text-4xl font-black text-slate-900 dark:text-white">
              <span className="text-blue-600">Rp {new Intl.NumberFormat('id-ID').format(grandTotal)}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 w-full xl:w-auto">
            <button
              type="button"
              onClick={() => handleAction('preview')}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 rounded-2xl transition-all font-bold min-w-[160px] disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}
              Pratinjau
            </button>
            <button
              type="button"
              onClick={() => handleAction('download')}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all font-bold shadow-xl shadow-blue-500/30 min-w-[160px] disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              Cetak PDF
            </button>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl h-[90vh] bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950">
              <h2 className="font-bold text-xl flex items-center gap-2">
                <FileText className="text-blue-600" />
                Draft Invoice
              </h2>
              <button 
                onClick={() => setPreviewUrl(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-800">
              <iframe src={previewUrl} className="w-full h-full border-none" />
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-950">
              <button 
                onClick={() => setPreviewUrl(null)}
                className="px-6 py-2 font-bold text-slate-500 hover:text-slate-700"
              >
                Tutup
              </button>
              <button 
                onClick={() => handleAction('download')}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20"
              >
                Download Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
      {isCustomerModalOpen && (
        <CustomerManagerModal 
          customers={customers} 
          refresh={fetchCustomers} 
          onClose={() => setIsCustomerModalOpen(false)} 
        />
      )}
    </>
  );
}
