import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Search, Plus, Edit2, Archive, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductModal from '../components/ProductModal';
import { useNavigate } from 'react-router-dom';

const Products: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const canEdit = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products?search=${search}&page=${page}&limit=10`);
      setProducts(res.data.data);
      if (res.data.meta) {
        setTotalPages(res.data.meta.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, page]);

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: '1200px', width: '100%' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1>Products & Inventory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your inventory and stock.</p>
        </div>
        {canEdit && (
          <button className="btn btn-primary" onClick={handleAdd}>
            <Plus size={16} /> Add Product
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
              placeholder="Search by name or SKU..." 
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
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td>{p.sku}</td>
                    <td>{p.category || '-'}</td>
                    <td>${Number(p.unit_price).toFixed(2)}</td>
                    <td style={{ fontWeight: 600, color: p.current_stock <= p.minimum_stock ? 'var(--danger-color)' : 'inherit' }}>
                      {p.current_stock}
                    </td>
                    <td>
                      {p.current_stock === 0 ? <span className="badge badge-danger">Out of Stock</span> : p.current_stock <= p.minimum_stock ? <span className="badge badge-warning">Low Stock</span> : <span className="badge badge-success">In Stock</span>}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {canEdit && (
                          <button className="btn btn-secondary" style={{ padding: '0.25rem' }} onClick={() => handleEdit(p)}>
                            <Edit2 size={16} />
                          </button>
                        )}
                        <button className="btn btn-secondary" style={{ padding: '0.25rem' }} title="Stock Movements" onClick={() => navigate(`/stock-movements?product_id=${p.id}`)}>
                          <Archive size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No products found.</td></tr>
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

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProducts}
        product={editingProduct}
      />
    </div>
  );
};

export default Products;
