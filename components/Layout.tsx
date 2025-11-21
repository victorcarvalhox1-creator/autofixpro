import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Kanban, Settings, LogOut, Wrench, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAppContext();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Kanban, label: 'Quadro Kanban', path: '/kanban' },
    { icon: ClipboardList, label: 'Ordens de Serviço', path: '/orders' },
    { icon: Users, label: 'Equipe & Comissões', path: '/collaborators' },
    // In a real app, more modules here
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col shadow-xl z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-700">
          <div className="bg-blue-600 p-2 rounded-lg">
             <Wrench size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">AutoFix Pro</h1>
            <p className="text-xs text-slate-400">Gestão Inteligente</p>
          </div>
        </div>
        
        <nav className="flex-1 py-6 space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-0">
            <h2 className="text-xl font-semibold text-gray-800">
                {menuItems.find(i => i.path === location.pathname)?.label || 'AutoFix Pro'}
            </h2>
            <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {user ? user.charAt(0) : 'A'}
                </div>
                <span className="text-sm font-medium text-gray-600">{user || 'Administrador'}</span>
            </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;