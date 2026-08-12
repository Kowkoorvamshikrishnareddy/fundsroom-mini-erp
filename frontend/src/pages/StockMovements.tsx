import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const StockMovements: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultProductId = searchParams.get('product_id') || '';
  
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [movementType, setMovementType] = useState('');
  const [productId, setProductId] = useState(defaultProductId);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState<any[]>([]);

  // Fetch products for dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products?limit=100'); // Assuming up to 100 products for filter
        setProducts(res.data.data);
      } catch (err) {
        console.error('Failed to fetch products', err);
      }
    };
    fetchProducts();
  }, []);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search,
        page: page.toString(),
        limit: '10'
      });
      
      if (movementType) query.append('movement_type', movementType);
      if (productId) query.append('product_id', productId);

      const res = await api.get(`/stock-movements?${query.toString()}`);
      setMovements(res.data.data);
      if (res.data.meta) {
        setTotalPages(res.data.meta.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch stock movements', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [search, page, movementType, productId]);

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: '1200px', width: '100%' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1>Stock Movements</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View historical inventory changes.</p>
        </div>
      </div>

      <div className="card flex flex-col gap-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-4" style={{ flex: 1 }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                className="input-field" 
                style={{ paddingLeft: '2rem' }} 
                placeholder="Search by reason..." 
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            
            <select 
              className="input-field" 
              style={{ width: '200px' }}
              value={productId}
              onChange={(e) => { setProductId(e.target.value); setPage(1); }}
            >
              <option value="">All Products</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
            
            <select 
              className="input-field" 
              style={{ width: '150px' }}
              value={movementType}
              onChange={(e) => { setMovementType(e.target.value); setPage(1); }}
            >
              <option value="">All Types</option>
              <option value="IN">Stock IN</option>
              <option value="OUT">Stock OUT</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="flex justify-center p-8"><div className="animate-spin"><Search size={24} /></div></div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Reason</th>
                  <th>Created By</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td>{new Date(m.created_at).toLocaleString()}</td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 500 }}>{m.product.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.product.sku}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${m.movement_type === 'IN' ? 'badge-success' : 'badge-danger'}`}>
                        {m.movement_type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {m.movement_type === 'IN' ? '+' : '-'}{m.quantity}
                    </td>
                    <td>{m.reason}</td>
                    <td>{m.creator.name}</td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No stock movements found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
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
    </div>
  );
};

export default StockMovements;
