import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, FileText, LogOut, Menu, X } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['ADMIN'] },
    { name: 'Customers', path: '/customers', icon: <Users size={20} />, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { name: 'Products', path: '/products', icon: <Package size={20} />, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { name: 'Movements', path: '/stock-movements', icon: <FileText size={20} />, roles: ['ADMIN', 'WAREHOUSE', 'ACCOUNTS'] },
    { name: 'Challans', path: '/challans', icon: <FileText size={20} />, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
  ];

  const allowedNavItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Mobile Menu Button */}
      <button 
        style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 50, display: 'none' }} 
        className="btn btn-secondary md-hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside 
        style={{ 
          width: 'var(--sidebar-width)', 
          backgroundColor: 'var(--surface-color)', 
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 40,
          transition: 'transform 0.3s ease-in-out',
          transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(0)' /* Adjust in CSS for mobile if needed */
        }}
      >
        <div style={{ height: 'var(--header-height)', display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: 0, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={24} /> ERP Portal
          </h2>
        </div>

        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {allowedNavItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: location.pathname === item.path ? 'var(--primary-color)' : 'var(--text-secondary)',
                backgroundColor: location.pathname === item.path ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                textDecoration: 'none',
                fontWeight: location.pathname === item.path ? 600 : 500,
                transition: 'all var(--transition-fast)'
              }}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user.name.charAt(0)}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{user.name}</p>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{user.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: 'var(--radius-md)', transition: 'all var(--transition-fast)' }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)') || (e.currentTarget.style.color = 'var(--danger-color)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent') || (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: 'var(--sidebar-width)', flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
