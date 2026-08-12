import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import { Search, Plus, FileText, CheckCircle, XCircle } from 'lucide-react';

const Challans: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challans, setChallans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Confirm Modal State
  const [confirmState, setConfirmState] = useState<{isOpen: boolean, id: string | null, action: 'confirm' | 'cancel' | null}>({ isOpen: false, id: null, action: null });
  
  const canEdit = user?.role === 'ADMIN' || user?.role === 'SALES';

  const fetchChallans = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/challans`);
      setChallans(res.data.data);
    } catch (error) {
      console.error('Failed to fetch challans', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, []);

  const executeAction = async () => {
    if (!confirmState.id || !confirmState.action) return;
    const { id, action } = confirmState;
    
    try {
      if (action === 'confirm') {
        await api.post(`/challans/${id}/confirm`);
        toast('success', 'Challan confirmed successfully!');
      } else {
        await api.post(`/challans/${id}/cancel`);
        toast('success', 'Challan cancelled successfully!');
      }
      fetchChallans();
    } catch (err: any) {
      toast('error', err.response?.data?.message || `Failed to ${action} challan`);
    } finally {
      setConfirmState({ isOpen: false, id: null, action: null });
    }
  };

  const confirmChallan = (id: string) => {
    setConfirmState({ isOpen: true, id, action: 'confirm' });
  };

  const cancelChallan = (id: string) => {
    setConfirmState({ isOpen: true, id, action: 'cancel' });
  };

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: '1200px', width: '100%' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1>Sales Challans</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage dispatches and orders.</p>
        </div>
        {canEdit && (
          <button className="btn btn-primary">
            <Plus size={16} /> Create Challan
          </button>
        )}
      </div>

      <div className="card flex flex-col gap-4">
        <div className="table-container">
          {loading ? (
            <div className="flex justify-center p-8"><div className="animate-spin"><Search size={24} /></div></div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Challan #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challans.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.challan_number}</td>
                    <td>{c.customer?.name}</td>
                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td>{c.total_quantity} qty</td>
                    <td>
                      <span className={`badge ${c.status === 'CONFIRMED' ? 'badge-success' : c.status === 'DRAFT' ? 'badge-warning' : 'badge-danger'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-secondary" style={{ padding: '0.25rem' }} title="View"><FileText size={16} /></button>
                        {canEdit && c.status === 'DRAFT' && (
                          <>
                            <button onClick={() => confirmChallan(c.id)} className="btn btn-secondary" style={{ padding: '0.25rem', color: 'var(--success-color)' }} title="Confirm"><CheckCircle size={16} /></button>
                            <button onClick={() => cancelChallan(c.id)} className="btn btn-secondary" style={{ padding: '0.25rem', color: 'var(--danger-color)' }} title="Cancel"><XCircle size={16} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {challans.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No challans found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={confirmState.isOpen}
        title={confirmState.action === 'confirm' ? 'Confirm Challan' : 'Cancel Challan'}
        message={confirmState.action === 'confirm' ? 'Are you sure you want to confirm this challan? This will definitively deduct stock from inventory and cannot be undone.' : 'Are you sure you want to cancel this draft challan?'}
        confirmText={confirmState.action === 'confirm' ? 'Yes, Confirm' : 'Yes, Cancel'}
        onConfirm={executeAction}
        onCancel={() => setConfirmState({ isOpen: false, id: null, action: null })}
        isDestructive={confirmState.action === 'cancel'}
      />
    </div>
  );
};

export default Challans;
