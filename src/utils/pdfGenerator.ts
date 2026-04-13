import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ReportType, Customer } from '@/types';

interface PDFItem {
  item_date: string;
  quantity: number;
  subtotal: number;
}

interface GeneratePDFProps {
  report_type: ReportType;
  invoice_date: string;
  customer: Customer;
  items: PDFItem[];
  grand_total: number;
}

const buildPDF = (data: GeneratePDFProps) => {
  const doc = new jsPDF();
  const isInvoice = data.report_type === 'invoice';

  // --- Top Header ---
  doc.setFontSize(10);
  doc.setTextColor(0);
  const formattedInvoiceDate = data.invoice_date ? format(new Date(data.invoice_date), 'dd/MM/yyyy') : '-';
  doc.text(`Tanggal: ${formattedInvoiceDate}`, 14, 20);

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  if (isInvoice) {
    doc.text('INVOICE', 196, 20, { align: 'right' });
  } else {
    doc.text('INVOICE', 196, 18, { align: 'right' });
    doc.text('RETRIBUSI', 196, 27, { align: 'right' });
  }

  // Draw a horizontal line under the header
  doc.setDrawColor(150);
  doc.setLineWidth(0.5);
  doc.line(14, 32, 196, 32);

  // --- Company & Customer Info ---
  doc.setFontSize(10);
  
  // Left: Perusahaan
  doc.setFont('helvetica', 'bold');
  doc.text('PERUSAHAAN:', 14, 42);
  if (isInvoice) {
    doc.text('Bagas Khairudin', 14, 47);
    doc.setFont('helvetica', 'normal');
    doc.text('Cerme Indah, Jl Kurma, RT 6 RW 4 Blok O Nomor 235\n082232601312', 14, 52);
  } else {
    doc.text('Usaha Kebersihan Mandiri', 14, 47);
    doc.setFont('helvetica', 'normal');
    doc.text('Cerme Indah, Jl Kurma, RT 6 RW 4 Blok O Nomor 235\n081330397993', 14, 52);
  }

  // Right: Pelanggan
  doc.setFont('helvetica', 'bold');
  doc.text('PELANGGAN:', 110, 42);
  doc.text(data.customer?.name || 'UMUM', 110, 47);
  doc.setFont('helvetica', 'normal');
  const splitAddress = doc.splitTextToSize(data.customer?.address || '-', 86);
  doc.text(splitAddress, 110, 52);

  // --- Table Content ---
  const tableData = data.items.map((item) => {
    const formattedItemDate = item.item_date ? format(new Date(item.item_date), 'dd/MM/yyyy') : '-';
    if (isInvoice) {
      return [
        `pembuangan sampah pemukiman tanggal ${formattedItemDate}`,
        `${item.quantity} Rit`,
        'Rp 350.000',
        `${new Intl.NumberFormat('id-ID').format(item.subtotal)}`,
        '-'
      ];
    } else {
      return [
        formattedItemDate,
        `${item.quantity}`, // No "Kg" explicitly in value as per image 3
        `${new Intl.NumberFormat('id-ID', { minimumFractionDigits: 3 }).format(item.subtotal / 1000)}` // formatted as 24.000
      ];
    }
  });

  const columns = isInvoice 
    ? ['Nama', 'Jumlah', 'Harga Satuan Per Rit', 'SubTotal', 'PPN']
    : ['Tanggal', 'Satuan Berat (Kg)', 'SubTotal'];

  autoTable(doc, {
    startY: 75,
    head: [columns],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [225, 225, 225], // Light Gray
      textColor: [0, 0, 0], // Black text
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      textColor: [0, 0, 0],
    },
    columnStyles: isInvoice 
      ? { 
          0: { cellWidth: 70, halign: 'left' },
          1: { halign: 'center' },
          2: { halign: 'center' },
          3: { halign: 'right' },
          4: { halign: 'center' }
        } 
      : { 
          0: { halign: 'left' },
          1: { halign: 'center' },
          2: { halign: 'right' }
        },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;

  // --- Footer ---
  // Right side totals
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('SUB TOTAL', 130, finalY);
  doc.text(`Rp ${new Intl.NumberFormat('id-ID').format(data.grand_total)}`, 196, finalY, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text('Total', 130, finalY + 8);
  doc.text(`Rp ${new Intl.NumberFormat('id-ID').format(data.grand_total)}`, 196, finalY + 8, { align: 'right' });

  // Draw small lines for totals? (optional, skipping for now to keep it clean)

  // Left side Bank Info
  doc.setFont('helvetica', 'bold');
  doc.text('Pembayaran Transfer:', 14, finalY);
  doc.setFont('helvetica', 'normal');
  
  if (isInvoice) {
    doc.text('Atas Nama: Bagas Khairudin\nNo Rek: 1501157479\nBank: BCA', 14, finalY + 5);
  } else {
    doc.text('Atas Nama: Sukayat\nNo Rek: 0272833893\nBank: Bank Jatim', 14, finalY + 5);
  }

  return doc;
};

export const generatePDF = async (data: GeneratePDFProps) => {
  const doc = buildPDF(data);
  doc.save(`Invoice_${data.report_type}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
};

export const previewPDF = async (data: GeneratePDFProps): Promise<string> => {
  const doc = buildPDF(data);
  const blob = doc.output('bloburl');
  return blob as unknown as string;
};
