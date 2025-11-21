
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
  const { isAuthenticated } = useAppContext();

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
