import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { createProduct, deleteProduct, fetchProducts, updateProduct } from '../features/products/productSlice';

function ProductsPage() {
  const dispatch = useAppDispatch();
  const { items, page, pageSize, total, status, error } = useAppSelector((state) => state.products);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingPrice, setEditingPrice] = useState('');
  const [editingDescription, setEditingDescription] = useState('');

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, pageSize }));
  }, [dispatch, pageSize]);

  const handleCreate = async () => {
    const parsedPrice = Number(price);
    if (!name.trim() || Number.isNaN(parsedPrice)) {
      return;
    }
    await dispatch(createProduct({ name: name.trim(), price: parsedPrice, description: description.trim() }));
    setName('');
    setPrice('');
    setDescription('');
  };

  const handleEdit = (id: string, rowName: string, rowPrice: number, rowDescription?: string | null) => {
    setEditingId(id);
    setEditingName(rowName);
    setEditingPrice(String(rowPrice));
    setEditingDescription(rowDescription ?? '');
  };

  const handleUpdate = async () => {
    if (!editingId || !editingName.trim()) {
      return;
    }
    const parsedPrice = Number(editingPrice);
    if (Number.isNaN(parsedPrice)) {
      return;
    }

    await dispatch(
      updateProduct({
        id: editingId,
        name: editingName.trim(),
        price: parsedPrice,
        description: editingDescription.trim(),
      })
    );
    setEditingId(null);
    setEditingName('');
    setEditingPrice('');
    setEditingDescription('');
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Products</h2>
        <p className="mt-2 text-sm text-slate-500">Create, update, delete, and page products using the API controller.</p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_150px]">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Product name"
            className="rounded-2xl border border-slate-300 px-4 py-3 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
          <input
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="Price"
            type="number"
            min="0"
            step="0.01"
            className="rounded-2xl border border-slate-300 px-4 py-3 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Description"
            className="rounded-2xl border border-slate-300 px-4 py-3 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
          <button onClick={handleCreate} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
            Create product
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold">Product list</h3>
          <div className="text-sm text-slate-500">
            {total} total · page {page} · {pageSize} per page
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {status === 'loading' && <div className="text-slate-500">Loading products…</div>}
          {status === 'failed' && <div className="text-red-600">{error}</div>}
          {items.length === 0 && status === 'idle' && <div className="text-slate-500">No products found.</div>}

          {items.map((product) => (
            <div key={product.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:flex sm:items-center sm:justify-between">
              <div className="space-y-2 sm:flex-1">
                <div className="font-medium text-slate-900">{product.name}</div>
                <div className="text-sm text-slate-500">Price: ${product.price.toFixed(2)}</div>
                <div className="text-sm text-slate-500">{product.description || 'No description'}</div>
                <div className="text-sm text-slate-500">ID: {product.id}</div>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:mt-0 sm:flex-row">
                {editingId === product.id ? (
                  <>
                    <input
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      className="rounded-2xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    />
                    <input
                      value={editingPrice}
                      onChange={(event) => setEditingPrice(event.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                      className="rounded-2xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    />
                    <button onClick={handleUpdate} className="rounded-2xl bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700">
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="rounded-2xl border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-100">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(product.id, product.name, product.price, product.description)}
                      className="rounded-2xl border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => dispatch(deleteProduct(product.id))}
                      className="rounded-2xl bg-rose-600 px-4 py-2 text-white transition hover:bg-rose-500"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ProductsPage;
