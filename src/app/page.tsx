import InvoiceForm from '@/components/InvoiceForm';
import { FileText, Settings, History, LayoutDashboard } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar / Navigation (Modern Aesthetics) */}
      <div className="fixed left-0 top-0 h-full w-20 md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center md:items-start p-4 gap-8 z-50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
            <FileText className="text-white w-6 h-6" />
          </div>
          <span className="hidden md:block font-bold text-xl tracking-tight">Invoicer.app</span>
        </div>

        <nav className="flex flex-col gap-2 w-full">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<History size={20} />} label="Riwayat" />
          <NavItem icon={<Settings size={20} />} label="Pengaturan" />
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="pl-20 md:pl-64 pt-8 pb-20 px-4 md:px-12 max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                Buat <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Invoice Baru</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Kelola penagihan dengan cepat dan profesional.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-bold">
                Status: Ready
              </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="relative group">
          {/* Subtle decoration */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative">
            <InvoiceForm />
          </div>
        </div>

        {/* Footer info */}
        <footer className="mt-12 text-center text-slate-400 dark:text-slate-600 text-sm">
          © {new Date().getFullYear()} Invoicer Application. Built with precision.
        </footer>
      </div>
    </main>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`
      flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all w-full
      ${active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
    `}>
      {icon}
      <span className="hidden md:block font-semibold">{label}</span>
    </div>
  );
}
