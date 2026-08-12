import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, Package, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard');
        setStats(res.data.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
        toast('error', 'Failed to fetch dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [toast]);

  if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin"><Package size={40} /></div></div>;

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: '1200px', width: '100%' }}>
      <div>
        <h1>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Overview of your business operations.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="card flex flex-col gap-2" style={{ borderTop: '4px solid var(--primary-color)' }}>
          <div className="flex justify-between items-center">
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Total Customers</h3>
            <div style={{ padding: '0.5rem', backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary-color)', borderRadius: 'var(--radius-full)' }}><Users size={20} /></div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats?.kpis?.totalCustomers || 0}</div>
        </div>

        <div className="card flex flex-col gap-2" style={{ borderTop: '4px solid var(--success-color)' }}>
          <div className="flex justify-between items-center">
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Total Products</h3>
            <div style={{ padding: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', borderRadius: 'var(--radius-full)' }}><Package size={20} /></div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats?.kpis?.totalProducts || 0}</div>
        </div>

        <div className="card flex flex-col gap-2" style={{ borderTop: '4px solid var(--warning-color)' }}>
          <div className="flex justify-between items-center">
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Low Stock Items</h3>
            <div style={{ padding: '0.5rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning-color)', borderRadius: 'var(--radius-full)' }}><AlertTriangle size={20} /></div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats?.kpis?.lowStockCount || 0}</div>
        </div>

        <div className="card flex flex-col gap-2" style={{ borderTop: '4px solid var(--danger-color)' }}>
          <div className="flex justify-between items-center">
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Out of Stock</h3>
            <div style={{ padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', borderRadius: 'var(--radius-full)' }}><FileText size={20} /></div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats?.kpis?.outOfStockProducts || 0}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
        <div className="card flex flex-col gap-4">
          <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Recent Challans</h3>
            <Link to="/challans" style={{ color: 'var(--primary-color)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontWeight: 500 }}>
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {stats?.recentChallans?.length > 0 ? stats.recentChallans.map((c: any) => (
              <div key={c.id} className="flex justify-between items-center" style={{ padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.challan_number}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{c.customer?.name}</div>
                </div>
                <span className={`badge ${c.status === 'CONFIRMED' ? 'badge-success' : c.status === 'DRAFT' ? 'badge-warning' : 'badge-danger'}`}>
                  {c.status}
                </span>
              </div>
            )) : <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No recent challans.</p>}
          </div>
        </div>

        <div className="card flex flex-col gap-4">
          <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Upcoming Followups</h3>
            <Link to="/customers" style={{ color: 'var(--primary-color)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontWeight: 500 }}>
              View Customers <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {stats?.upcomingFollowups?.length > 0 ? stats.upcomingFollowups.map((f: any) => (
              <div key={f.id} className="flex justify-between items-center" style={{ padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{f.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Due: {new Date(f.follow_up_date).toLocaleDateString()}</div>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--info-color)', borderRadius: 'var(--radius-full)' }}><Users size={16} /></div>
              </div>
            )) : <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No upcoming followups.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
