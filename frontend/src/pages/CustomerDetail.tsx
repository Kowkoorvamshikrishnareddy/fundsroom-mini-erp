import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft, Plus, Clock, FileText, Phone, Mail, Building, MapPin } from 'lucide-react';

const CustomerDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [note, setNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/customers/${id}`);
      setCustomer(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note) return;
    
    try {
      setSubmittingNote(true);
      await api.post(`/customers/${id}/followups`, {
        note,
        follow_up_date: followUpDate || undefined
      });
      setNote('');
      setFollowUpDate('');
      toast('success', 'Follow-up added successfully!');
      fetchCustomer(); // Refresh to get new followups
    } catch (err: any) {
      toast('error', err.response?.data?.message || 'Failed to add follow up');
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin"><Clock size={32} /></div></div>;
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col gap-4 items-center p-12">
        <h2>{error || 'Customer not found'}</h2>
        <button className="btn btn-primary" onClick={() => navigate('/customers')}>Back to Customers</button>
      </div>
    );
  }

  const canAddFollowUp = user?.role === 'ADMIN' || user?.role === 'SALES';

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: '1200px', width: '100%' }}>
      <div className="flex items-center gap-4">
        <button 
          className="btn btn-secondary" 
          style={{ padding: '0.5rem' }} 
          onClick={() => navigate('/customers')}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {customer.name}
            <span className={`badge ${customer.status === 'ACTIVE' ? 'badge-success' : customer.status === 'LEAD' ? 'badge-warning' : 'badge-danger'}`}>
              {customer.status}
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Customer ID: {customer.id} | Added on {new Date(customer.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Contact Info Card */}
        <div className="card flex flex-col gap-4">
          <h3>Contact Information</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Phone size={18} style={{ color: 'var(--text-secondary)' }} />
              <span>{customer.mobile}</span>
            </div>
            {customer.email && (
              <div className="flex items-center gap-3">
                <Mail size={18} style={{ color: 'var(--text-secondary)' }} />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.business_name && (
              <div className="flex items-center gap-3">
                <Building size={18} style={{ color: 'var(--text-secondary)' }} />
                <span>{customer.business_name} <span className="badge badge-info" style={{ marginLeft: '0.5rem' }}>{customer.customer_type}</span></span>
              </div>
            )}
            {customer.gst_number && (
              <div className="flex items-center gap-3">
                <FileText size={18} style={{ color: 'var(--text-secondary)' }} />
                <span>GST: {customer.gst_number}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-3">
                <MapPin size={18} style={{ color: 'var(--text-secondary)' }} />
                <span>{customer.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Follow Ups Card */}
        <div className="card flex flex-col gap-4">
          <h3>Follow-up History</h3>
          
          {canAddFollowUp && (
            <form onSubmit={handleAddFollowUp} className="flex flex-col gap-3" style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
              <textarea 
                className="input-field" 
                placeholder="Add a new follow-up note..." 
                rows={2} 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
              ></textarea>
              <div className="flex gap-2 items-center">
                <input 
                  type="date" 
                  className="input-field" 
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" disabled={submittingNote || !note}>
                  <Plus size={16} /> Add Note
                </button>
              </div>
            </form>
          )}

          <div className="flex flex-col gap-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {customer.followups && customer.followups.length > 0 ? (
              customer.followups.map((f: any) => (
                <div key={f.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ marginBottom: '0.5rem' }}>{f.note}</p>
                  <div className="flex justify-between items-center" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span>By {f.creator?.name} on {new Date(f.created_at).toLocaleDateString()}</span>
                    {f.follow_up_date && (
                      <span className="badge badge-warning">Next: {new Date(f.follow_up_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>No follow-up history found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
