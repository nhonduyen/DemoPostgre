import { useState } from 'react';
import ProductsPage from './pages/ProductsPage';
import UsersPage from './pages/UsersPage';

function App() {
  const [activeTab, setActiveTab] = useState<'users' | 'products'>('users');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white/90 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-2xl font-semibold">PostgresDemo Admin</h1>
            <p className="text-sm text-slate-500">Manage users and products via the API controllers.</p>
          </div>
          <div className="flex gap-2">
            <button
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === 'users' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 shadow-sm'
              }`}
              onClick={() => setActiveTab('users')}
            >
              Users
            </button>
            <button
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === 'products' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 shadow-sm'
              }`}
              onClick={() => setActiveTab('products')}
            >
              Products
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {activeTab === 'users' ? <UsersPage /> : <ProductsPage />}
      </main>
    </div>
  );
}

export default App;
