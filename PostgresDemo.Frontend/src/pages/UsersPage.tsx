import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { createUser, deleteUser, fetchUsers, updateUser } from '../features/users/userSlice';

function UsersPage() {
  const dispatch = useAppDispatch();
  const { items, page, pageSize, total, status, error } = useAppSelector((state) => state.users);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, pageSize }));
  }, [dispatch, pageSize]);

  const handleCreate = async () => {
    if (!name.trim()) {
      return;
    }

    await dispatch(createUser(name.trim()));
    setName('');
  };

  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleUpdate = async () => {
    if (!editingId || !editingName.trim()) {
      return;
    }

    await dispatch(updateUser({ id: editingId, name: editingName.trim() }));
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Users</h2>
        <p className="mt-2 text-sm text-slate-500">Create, update, delete, and page through users managed by the API.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="New user name"
            className="rounded-2xl border border-slate-300 px-4 py-3 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
          <button onClick={handleCreate} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
            Create user
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold">User list</h3>
          <div className="text-sm text-slate-500">
            {total} total · page {page} · {pageSize} per page
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {status === 'loading' && <div className="text-slate-500">Loading users…</div>}
          {status === 'failed' && <div className="text-red-600">{error}</div>}
          {items.length === 0 && status === 'idle' && <div className="text-slate-500">No users found.</div>}

          {items.map((user) => (
            <div key={user.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:flex sm:items-center sm:justify-between">
              <div className="space-y-2 sm:flex-1">
                <div className="font-medium text-slate-900">{user.name}</div>
                <div className="text-sm text-slate-500">ID: {user.id}</div>
                <div className="text-sm text-slate-500">Created: {new Date(user.createdAt).toLocaleString()}</div>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:mt-0 sm:flex-row">
                {editingId === user.id ? (
                  <>
                    <input
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
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
                    <button onClick={() => handleEdit(user.id, user.name)} className="rounded-2xl border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-100">
                      Edit
                    </button>
                    <button
                      onClick={() => dispatch(deleteUser(user.id))}
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

export default UsersPage;
