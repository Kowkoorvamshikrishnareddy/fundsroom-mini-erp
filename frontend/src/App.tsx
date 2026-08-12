import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Products from './pages/Products';
import StockMovements from './pages/StockMovements';
import Challans from './pages/Challans';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      
      <Route path="/" element={<Layout />}>
        {user?.role === 'ADMIN' && <Route index element={<Dashboard />} />}
        {user?.role !== 'ADMIN' && <Route index element={<Navigate to="/products" replace />} />}
        
        {['ADMIN', 'SALES', 'ACCOUNTS'].includes(user?.role || '') && (
          <>
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
          </>
        )}
        
        {['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'].includes(user?.role || '') && (
          <>
            <Route path="products" element={<Products />} />
            <Route path="stock-movements" element={<StockMovements />} />
          </>
        )}
        
        {['ADMIN', 'SALES', 'ACCOUNTS'].includes(user?.role || '') && (
          <Route path="challans" element={<Challans />} />
        )}
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
