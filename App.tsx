
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Kanban from './pages/Kanban';
import ServiceOrderList from './pages/ServiceOrderList';
import ServiceOrderDetails from './pages/ServiceOrderDetails';
import ServiceOrderCreate from './pages/ServiceOrderCreate';
import Collaborators from './pages/Collaborators';
import Login from './pages/Login';
import Register from './pages/Register';

const ProtectedRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 uppercase tracking-widest text-gray-400 text-xs">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Carregando...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/kanban" element={<Kanban />} />
        <Route path="/orders" element={<ServiceOrderList />} />
        <Route path="/orders/new" element={<ServiceOrderCreate />} />
        <Route path="/orders/edit/:id" element={<ServiceOrderCreate />} />
        <Route path="/orders/:id" element={<ServiceOrderDetails />} />
        <Route path="/collaborators" element={<Collaborators />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}

export default App;
