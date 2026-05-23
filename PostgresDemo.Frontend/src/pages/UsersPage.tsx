import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAppDispatch, useAppSelector } from '../hooks';
import { createUser, deleteUser, fetchUsers, updateUser } from '../features/users/userSlice';

function UsersPage() {
  const dispatch = useAppDispatch();
  const { items, page, pageSize, total, status, error } = useAppSelector((state) => state.users);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameExists, setUsernameExists] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingUsername, setEditingUsername] = useState('');
  const [editingPassword, setEditingPassword] = useState('');
  const [editingOriginalUsername, setEditingOriginalUsername] = useState('');
  const [editingUsernameExists, setEditingUsernameExists] = useState(false);
  const [editingUsernameChecking, setEditingUsernameChecking] = useState(false);
  const [editingError, setEditingError] = useState('');

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, pageSize }));
  }, [dispatch, pageSize]);

  const checkUsernameExists = async (value: string, originalUsername?: string) => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === originalUsername?.trim()) {
      setUsernameExists(false);
      setEditingUsernameExists(false);
      return false;
    }

    setUsernameChecking(true);
    setEditingUsernameChecking(true);
    try {
      const response = await api.get<{ exists: boolean }>('/users/exists', {
        params: { username: trimmed },
      });
      setUsernameExists(response.data.exists);
      setEditingUsernameExists(response.data.exists);
      return response.data.exists;
    } catch {
      setUsernameExists(false);
      setEditingUsernameExists(false);
      return false;
    } finally {
      setUsernameChecking(false);
      setEditingUsernameChecking(false);
    }
  };

  const handleCreate = async () => {
    const trimmedName = name.trim();
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedUsername || !trimmedPassword) {
      setFormError('Name, username, and password are required.');
      return;
    }

    const exists = await checkUsernameExists(trimmedUsername);
    if (exists) {
      setFormError('That username is already taken.');
      return;
    }

    setFormError('');
    const resultAction = await dispatch(createUser({ name: trimmedName, username: trimmedUsername, password: trimmedPassword }));

    if (createUser.rejected.match(resultAction)) {
      setFormError('Could not create user. Please try again.');
      return;
    }

    setName('');
    setUsername('');
    setPassword('');
    setUsernameExists(false);
  };

  const handleEdit = (id: string, currentName: string, currentUsername: string) => {
    setEditingId(id);
    setEditingName(currentName);
    setEditingUsername(currentUsername);
    setEditingOriginalUsername(currentUsername);
    setEditingPassword('');
    setEditingError('');
    setEditingUsernameExists(false);
  };

  const handleUpdate = async () => {
    const trimmedName = editingName.trim();
    const trimmedUsername = editingUsername.trim();
    const trimmedPassword = editingPassword.trim();

    if (!editingId || !trimmedName || !trimmedUsername) {
      setEditingError('Name and username are required.');
      return;
    }

    const usernameChanged = trimmedUsername !== editingOriginalUsername.trim();
    if (usernameChanged) {
      const exists = await checkUsernameExists(trimmedUsername, editingOriginalUsername);
      if (exists) {
        setEditingError('That username is already taken.');
        return;
      }
    }

    setEditingError('');
    const resultAction = await dispatch(
      updateUser({
        id: editingId,
        name: trimmedName,
        username: trimmedUsername,
        ...(trimmedPassword ? { password: trimmedPassword } : {}),
      })
    );

    if (updateUser.rejected.match(resultAction)) {
      setEditingError('Could not update user. Please try again.');
      return;
    }

    setEditingId(null);
    setEditingName('');
    setEditingUsername('');
    setEditingPassword('');
    setEditingOriginalUsername('');
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Users</h2>
        <p className="mt-2 text-sm text-slate-500">Create, update, delete, and page through users managed by the API.</p>

        <div className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Full name"
              className="rounded-2xl border border-slate-300 px-4 py-3 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
            <input
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setUsernameExists(false);
                setFormError('');
              }}
              onBlur={() => void checkUsernameExists(username)}
              placeholder="Username"
              className="rounded-2xl border border-slate-300 px-4 py-3 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              type="password"
              className="rounded-2xl border border-slate-300 px-4 py-3 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm text-red-600">
              {usernameChecking
                ? 'Checking username availability…'
                : usernameExists
                ? 'That username is already taken.'
                : ''}
            </div>
            <button
              onClick={handleCreate}
              disabled={usernameChecking}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Create user
            </button>
            {formError && <div className="text-sm text-rose-600">{formError}</div>}
          </div>
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
                <div className="text-sm text-slate-500">Username: {user.username}</div>
                <div className="text-sm text-slate-500">ID: {user.id}</div>
                <div className="text-sm text-slate-500">Created: {new Date(user.createdAt).toLocaleString()}</div>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:mt-0 sm:flex-row">
                {editingId === user.id ? (
                  <>
                    <div className="grid gap-2">
                      <input
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        placeholder="Full name"
                        className="rounded-2xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      />
                      <input
                        value={editingUsername}
                        onChange={(event) => {
                          setEditingUsername(event.target.value);
                          setEditingUsernameExists(false);
                          setEditingError('');
                        }}
                        onBlur={() => void checkUsernameExists(editingUsername, editingOriginalUsername)}
                        placeholder="Username"
                        className="rounded-2xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      />
                      <input
                        value={editingPassword}
                        onChange={(event) => setEditingPassword(event.target.value)}
                        placeholder="New password (leave blank to keep current)"
                        type="password"
                        className="rounded-2xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      />
                      <div className="text-sm text-red-600">
                        {editingUsernameChecking
                          ? 'Checking username availability…'
                          : editingUsernameExists
                          ? 'That username is already taken.'
                          : ''}
                      </div>
                      {editingError && <div className="text-sm text-rose-600">{editingError}</div>}
                    </div>
                    <button onClick={handleUpdate} className="rounded-2xl bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700">
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="rounded-2xl border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-100">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(user.id, user.name, user.username)} className="rounded-2xl border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-100">
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
