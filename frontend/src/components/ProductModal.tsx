import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: any; // If provided, edit mode
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSuccess, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unit_price: '',
    current_stock: '',
    minimum_stock: '',
    warehouse_location: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || '',
        unit_price: product.unit_price?.toString() || '',
        current_stock: product.current_stock?.toString() || '0',
        minimum_stock: product.minimum_stock?.toString() || '0',
        warehouse_location: product.warehouse_location || '',
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        category: '',
        unit_price: '',
        current_stock: '0',
        minimum_stock: '0',
        warehouse_location: '',
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        unit_price: parseFloat(formData.unit_price),
        current_stock: parseInt(formData.current_stock, 10),
        minimum_stock: parseInt(formData.minimum_stock, 10),
      };

      if (product) {
        await api.put(`/products/${product.id}`, payload);
        toast('success', 'Product updated successfully');
      } else {
        await api.post('/products', payload);
        toast('success', 'Product created successfully');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast(err.response?.data?.message || 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
          <h2>{product ? 'Edit Product' : 'Add Product'}</h2>
          <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Product Name *</label>
              <input type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>SKU / Code *</label>
              <input type="text" name="sku" className="input-field" value={formData.sku} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Category</label>
              <input type="text" name="category" className="input-field" value={formData.category} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Unit Price *</label>
              <input type="number" step="0.01" name="unit_price" className="input-field" value={formData.unit_price} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Current Stock *</label>
              <input type="number" name="current_stock" className="input-field" value={formData.current_stock} onChange={handleChange} required disabled={!!product} />
              {product && <small style={{ color: 'var(--text-secondary)' }}>Use stock adjustments to change current stock.</small>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Minimum Stock Alert</label>
              <input type="number" name="minimum_stock" className="input-field" value={formData.minimum_stock} onChange={handleChange} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Warehouse Location</label>
              <input type="text" name="warehouse_location" className="input-field" value={formData.warehouse_location} onChange={handleChange} />
            </div>
          </div>

          <div className="flex justify-end gap-2" style={{ marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
