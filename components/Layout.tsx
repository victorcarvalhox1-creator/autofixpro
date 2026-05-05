import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Kanban, Settings, LogOut, Users, Menu, X, MessageCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Kanban, label: 'Quadro Kanban', path: '/kanban' },
    { icon: ClipboardList, label: 'Ordens de Serviço', path: '/orders' },
    { icon: Users, label: 'Equipe & Comissões', path: '/collaborators' },
  ];

  return (
    <div className="flex h-screen bg-brand-gray-bg overflow-hidden font-sans">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-brand-midnight/50 z-20 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-brand-midnight text-brand-snow shadow-xl transform transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:inset-auto md:flex md:flex-col
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6 flex items-center justify-between border-b border-brand-slate">
          <BrandLogo dark horizontal showSubtitle className="scale-75 origin-left" />
          {/* Close button only visible on mobile */}
          <button onClick={closeMobileMenu} className="md:hidden text-brand-gray hover:text-brand-snow">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 py-6 space-y-2 px-3 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-brand-slate text-brand-amber shadow-md' 
                    : 'text-brand-gray-light hover:bg-brand-slate hover:text-brand-snow'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-brand-amber font-bold' : 'text-brand-gray-light group-hover:text-brand-snow'} />
                <span className="font-mono text-sm uppercase tracking-wider font-bold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-brand-slate space-y-2">
          <a 
            href="https://wa.me/5582988926979"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 w-full text-brand-amber font-mono text-sm uppercase tracking-wider font-bold hover:text-brand-snow hover:bg-brand-slate rounded-lg transition-colors"
          >
            <MessageCircle size={18} />
            <span>Suporte</span>
          </a>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-brand-gray-light font-mono text-sm uppercase tracking-wider font-bold hover:text-brand-snow hover:bg-brand-slate rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        <header className="h-16 bg-white border-b border-brand-gray-border flex items-center justify-between px-4 md:px-8 shadow-sm z-10 shrink-0">
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleMobileMenu}
                className="p-2 text-brand-gray hover:bg-brand-gray-bg rounded-lg md:hidden"
              >
                <Menu size={24} />
              </button>
              <h2 className="text-lg md:text-xl font-mono font-bold text-brand-midnight truncate tracking-tight">
                  {menuItems.find(i => i.path === location.pathname)?.label || 'VL.IA'}
              </h2>
            </div>
            
            <div className="flex items-center gap-3 md:gap-4">
                <div className="h-8 w-8 rounded-full bg-brand-slate text-brand-amber flex items-center justify-center font-bold text-sm">
                    {user ? user.charAt(0).toUpperCase() : 'V'}
                </div>
                <span className="text-sm font-medium text-brand-gray hidden sm:block">{user || 'Admin'}</span>
            </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 md:p-8 w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;