'use client';

import React from 'react';
import { X, User } from 'lucide-react';
import { Customer } from '@/types';

interface CustomerManagerProps {
  customers: Customer[];
  onClose: () => void;
}

export default function CustomerManagerModal({ customers, onClose }: CustomerManagerProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[80vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
        
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-xl">Data Pelanggan (Statis)</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-3">
            {customers.map((c) => (
              <div key={c.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex gap-4 bg-slate-50/50 dark:bg-slate-800/30 items-start">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{c.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{c.address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center">
          <p className="text-xs text-slate-400 font-medium italic">Data ini bersifat statis dan tidak dapat diubah.</p>
        </div>

      </div>
    </div>
  );
}
