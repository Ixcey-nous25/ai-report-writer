
import React from 'react';
import { LayoutDashboard, History, LogOut, Package2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  setView: (view: any) => void;
  onLogout: () => void;
  userEmail?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, setView, onLogout, userEmail }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Package2 className="text-white w-6 h-6" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">AI Copywriter</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeView === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard size={20} />
            Generator
          </button>
          <button
            onClick={() => setView('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeView === 'history' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <History size={20} />
            History
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100 mt-auto">
          <div className="px-4 py-2 mb-4">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Logged in as</p>
            <p className="text-sm text-slate-700 truncate">{userEmail}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
