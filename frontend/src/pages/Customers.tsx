import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import { Search, Plus, Edit2, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import CustomerModal from '../components/CustomerModal';
import { useNavigate } from 'react-router-dom';

const Customers: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  
  // Confirm Delete State
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: string | null}>({ isOpen: false, id: null });
  
  const canEdit = user?.role === 'ADMIN' || user?.role === 'SALES';
  const canDelete = user?.role === 'ADMIN';

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/customers?search=${search}&page=${page}&limit=10`);
      setCustomers(res.data.data);
      if (res.data.meta) {
        setTotalPages(res.data.meta.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch customers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, page]);

  const handleAdd = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const confirmDelete = (id: string) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const executeDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await api.delete(`/customers/${deleteConfirm.id}`);
      toast('success', 'Customer deleted successfully!');
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer', error);
      toast('error', 'Failed to delete customer');
    } finally {
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: '1200px', width: '100%' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1>Customers</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your CRM contacts.</p>
        </div>
        {canEdit && (
          <button className="btn btn-primary" onClick={handleAdd}>
            <Plus size={16} /> Add Customer
          </button>
        )}
      </div>

      <div className="card flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="input-field" 
              style={{ paddingLeft: '2rem' }} 
              placeholder="Search customers..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="flex justify-center p-8"><div className="animate-spin"><Search size={24} /></div></div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Business Name</th>
                  <th>Type</th>
                  <th>Mobile</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td>{c.business_name || '-'}</td>
                    <td><span className="badge badge-info">{c.customer_type}</span></td>
                    <td>{c.mobile}</td>
                    <td>
                      <span className={`badge ${c.status === 'ACTIVE' ? 'badge-success' : c.status === 'LEAD' ? 'badge-warning' : 'badge-danger'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-secondary" style={{ padding: '0.25rem' }} onClick={() => navigate(`/customers/${c.id}`)}>
                          <Eye size={16} />
                        </button>
                        {canEdit && (
                          <button className="btn btn-secondary" style={{ padding: '0.25rem' }} onClick={() => handleEdit(c)}>
                            <Edit2 size={16} />
                          </button>
                        )}
                        {canDelete && (
                          <button className="btn btn-secondary" style={{ padding: '0.25rem', color: 'var(--danger-color)' }} onClick={() => confirmDelete(c.id)}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No customers found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-between items-center" style={{ marginTop: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                className="btn btn-secondary" 
                disabled={page === 1} 
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button 
                className="btn btn-secondary" 
                disabled={page === totalPages} 
                onClick={() => setPage(page + 1)}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <CustomerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchCustomers}
        customer={editingCustomer}
      />
      
      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmText="Yes, Delete"
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
        isDestructive={true}
      />
    </div>
  );
};

export default Customers;
