import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { createProduct, createProductsBulk, deleteProduct, fetchProducts, updateProduct } from '../features/products/productSlice';

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
  const [generateCount, setGenerateCount] = useState('5');
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState('');

  const sampleProductNames = ['Wireless Mouse', 'Coffee Mug', 'Desk Lamp', 'Bluetooth Speaker', 'Notebook', 'Travel Backpack', 'Water Bottle', 'Desk Plant', 'Phone Stand', 'Noise Cancelling Headphones'];
  const sampleProductDescriptions = [
    'A reliable everyday essential.',
    'Designed for comfort and style.',
    'Perfect for remote work and home office.',
    'High quality and built to last.',
    'A great gift for friends and family.',
    'Compact, practical, and easy to use.',
    'Made from premium materials.',
    'Modern design with excellent performance.',
    'Clean lines and powerful features.',
    'Simple, durable, and affordable.',
  ];

  const getSampleProduct = (index: number) => {
    const nameIndex = index % sampleProductNames.length;
    const descriptionIndex = (index + 2) % sampleProductDescriptions.length;
    const baseName = sampleProductNames[nameIndex];
    return {
      name: `${baseName} ${Date.now().toString().slice(-4)}${index}`,
      price: Number((Math.random() * 190 + 10).toFixed(2)),
      description: sampleProductDescriptions[descriptionIndex],
    };
  };

  const handleGenerateProducts = async () => {
    const count = Number(generateCount);
    if (!count || count < 1 || count > 50) {
      setGenerateMessage('Enter a number between 1 and 50.');
      return;
    }

    setGenerating(true);
    setGenerateMessage(`Creating ${count} sample products...`);
    const products = Array.from({ length: count }, (_, i) => getSampleProduct(i));
    let created = 0;

    try {
      const resultAction = await dispatch(createProductsBulk({ products }));
      if (createProductsBulk.fulfilled.match(resultAction)) {
        created = resultAction.payload.length;
      }
      await dispatch(fetchProducts({ page: 1, pageSize }));
      setGenerateMessage(`Created ${created} sample product${created === 1 ? '' : 's'}.`);
      setGenerateCount('5');
    } catch {
      setGenerateMessage(`Created ${created} sample product${created === 1 ? '' : 's'} before an error occurred.`);
    } finally {
      setGenerating(false);
    }
  };

  const totalProductPages = Math.max(1, Math.ceil(total / pageSize));
  const handleProductPageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalProductPages) {
      return;
    }

    dispatch(fetchProducts({ page: newPage, pageSize }));
  };

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

        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={generateCount}
              onChange={(event) => setGenerateCount(event.target.value)}
              type="number"
              min="1"
              max="50"
              placeholder="Number of products"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
            <button
              onClick={handleGenerateProducts}
              disabled={generating}
              className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {generating ? 'Generating products…' : 'Generate sample products'}
            </button>
          </div>
          <div className="mt-3 text-sm text-slate-500">Create sample products with price and description for testing.</div>
          {generateMessage && <div className="mt-2 text-sm text-slate-700">{generateMessage}</div>}
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
          <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:flex-row">
            <button
              onClick={() => handleProductPageChange(page - 1)}
              disabled={page <= 1 || status === 'loading'}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Previous
            </button>
            <div className="text-sm text-slate-600">
              Page {page} of {totalProductPages}
            </div>
            <button
              onClick={() => handleProductPageChange(page + 1)}
              disabled={page >= totalProductPages || status === 'loading'}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next
            </button>
          </div>        </div>
      </section>
    </div>
  );
}

export default ProductsPage;
