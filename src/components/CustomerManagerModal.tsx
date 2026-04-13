'use client';

import React, { useState } from 'react';
import { Trash2, Edit2, X, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Customer } from '@/types';

interface CustomerManagerProps {
  customers: Customer[];
  onClose: () => void;
  refresh: () => void;
}

export default function CustomerManagerModal({ customers, onClose, refresh }: CustomerManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const startEdit = (c: Customer) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditAddress(c.address);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditAddress('');
  };

  const handleSave = async (id: string | null) => {
    if (!editName.trim()) return;
    setIsLoading(true);
    
    try {
      if (id) {
        await supabase.from('customers').update({ name: editName, address: editAddress }).eq('id', id);
      } else {
        await supabase.from('customers').insert([{ name: editName, address: editAddress }]);
      }
      refresh();
      cancelEdit();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus pelanggan ini?')) {
      await supabase.from('customers').delete().eq('id', id);
      refresh();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[80vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
        
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-xl">Kelola Data Pelanggan</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {editingId === 'new' && (
            <div className="p-4 mb-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl space-y-3">
              <input 
                type="text" 
                placeholder="Nama Pelanggan" 
                value={editName} 
                onChange={e => setEditName(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
              />
              <textarea 
                placeholder="Alamat" 
                value={editAddress} 
                onChange={e => setEditAddress(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
              />
              <div className="flex justify-end gap-2">
                <button onClick={cancelEdit} className="px-4 py-2 text-slate-500 font-bold">Batal</button>
                <button onClick={() => handleSave(null)} disabled={isLoading} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan'}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {customers.length === 0 && editingId !== 'new' && (
              <p className="text-center text-slate-500 py-8">Belum ada pelanggan.</p>
            )}

            {customers.map((c) => (
              <div key={c.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50 dark:bg-slate-800/30">
                {editingId === c.id ? (
                  <div className="flex-1 space-y-3 w-full">
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={e => setEditName(e.target.value)}
                      className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                    />
                    <textarea 
                      value={editAddress} 
                      onChange={e => setEditAddress(e.target.value)}
                      className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={cancelEdit} className="px-4 py-2 text-slate-500 font-bold">Batal</button>
                      <button onClick={() => handleSave(c.id)} disabled={isLoading} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Data'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="font-bold text-lg">{c.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{c.address}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <button onClick={() => startEdit(c)} className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <button 
            type="button"
            onClick={() => setEditingId('new')}
            disabled={editingId === 'new'}
            className="w-full py-3 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-slate-600 dark:text-slate-300 rounded-xl font-bold flex flex-row items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            <Plus className="w-5 h-5" />
            Pelanggan Baru
          </button>
        </div>

      </div>
    </div>
  );
}
