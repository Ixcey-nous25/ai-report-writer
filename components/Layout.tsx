import React from 'react';
import { 
  LayoutDashboard, 
  History, 
  LogOut, 
  Menu,
  X,
  User
} from 'lucide-react';
import { View } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  setView: (view: View) => void;
  onLogout: () => void;
  userEmail?: string;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeView, 
  setView, 
  onLogout,
  userEmail 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Helper to determine button styling based on active state
  const getNavClass = (view: View) => {
    const baseClass = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group";
    const activeClass = "bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100";
    const inactiveClass = "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm";
    
    return `${baseClass} ${activeView === view ? activeClass : inactiveClass}`;
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-slate-50 border-r border-slate-200 
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo Section */}
        <div className="p-6">
          <div className="flex items-center gap-3 px-2">
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
              <LayoutDashboard size={20} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">CopyGenius AI</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-2 py-4">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
          
          <button 
            onClick={() => { setView('dashboard'); setIsMobileMenuOpen(false); }}
            className={getNavClass('dashboard')}
          >
            <LayoutDashboard size={20} className={activeView === 'dashboard' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
            <span>Generator</span>
          </button>

          <button 
            onClick={() => { setView('history'); setIsMobileMenuOpen(false); }}
            className={getNavClass('history')}
          >
            <History size={20} className={activeView === 'history' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
            <span>History</span>
          </button>
        </nav>

        {/* User Profile & Logout Section (Bottom) */}
        <div className="p-4 border-t border-slate-200 bg-slate-100/50">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-slate-100 p-2 rounded-full">
                <User size={16} className="text-slate-500" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-900 truncate">My Account</p>
                <p className="text-xs text-slate-500 truncate" title={userEmail}>
                  {userEmail || 'User'}
                </p>
              </div>
            </div>
            
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-600 text-white p-1.5 rounded-md">
              <LayoutDashboard size={18} />
            </div>
            <span className="font-bold text-slate-900">CopyGenius</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
};