import { Customer } from '@/types';

export const STATIC_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'Perumahan Alam Singgasana',
    address: 'Ngabetan, Kec. Cerme, Kabupaten Gresik, Jawa Timur 61171',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Perumahan Cerme Indah RW 4',
    address: 'Betiting, Kec. Cerme, Kabupaten Gresik, Jawa Timur 61171',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Perumahan Cerme Square',
    address: 'Jl. Raya Embong Kerang No.8, Kejambon, Ngabetan, Kec. Cerme, Kabupaten Gresik, Jawa Timur 61171',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Perumahan Green Cerme',
    address: 'Karangan, Kambingan, Kec. Cerme, Kabupaten Gresik, Jawa Timur 61171',
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Perumahan Patra Raya',
    address: 'Jl. Raya Embong Kerang, Kendal, Dungus Kidul, Kec. Cerme, Kabupaten Gresik, Jawa Timur 61171',
    created_at: new Date().toISOString()
  }
];
