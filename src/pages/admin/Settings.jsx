import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, Check, X, Trash2, Pencil } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const Settings = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ name: '', id: '', password: '', role: 'user', pageAccess: [] });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const { showToast } = useToast();

    const allPages = [
        "Dashboard",
        "Order",
        "Dispatch Planning",
        "Inform to Party Before Dispatch",
        "Dispatch Completed",
        "Inform to Party After Dispatch"
    ];

    useEffect(() => {
        setUsers([]);
    }, []);

    const filteredUsers = users.filter(user =>
        Object.values(user).some(val =>
            String(val).toLowerCase().includes(userSearchTerm.toLowerCase())
        )
    );

    const handleAddUser = (e) => {
        e.preventDefault();
        if (editingUser) {
            // Update existing user
            const updatedUsers = users.map(u => u.id === editingUser ? newUser : u);
            setUsers(updatedUsers);
            setEditingUser(null);
            showToast("User updated successfully");
        } else {
            // Add new user
            const updatedUsers = [...users, newUser];
            setUsers(updatedUsers);
            showToast("User added successfully");
        }
        setIsModalOpen(false);
        setNewUser({ id: '', name: '', password: '', role: 'user', pageAccess: ['Dashboard'] });
    };

    const handleEditUser = (user) => {
        setEditingUser(user.id);
        setNewUser({ ...user });
        setIsModalOpen(true);
    };

    const handleDeleteUser = (id) => {
        if (id === 'admin') return;
        const updatedUsers = users.filter(u => u.id !== id);
        setUsers(updatedUsers);
        showToast("User removed", "error");
    };

    const handleToggleAccess = (page) => {
        const current = [...newUser.pageAccess];
        if (current.includes(page)) {
            setNewUser({ ...newUser, pageAccess: current.filter(p => p !== page) });
        } else {
            setNewUser({ ...newUser, pageAccess: [...current, page] });
        }
    };

    return (
        <div className="p-3 sm:p-6 lg:p-8">
            {/* Header Row with Title, Search, and Actions */}
            <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Settings</h1>
                    <p className="text-gray-500 text-xs">Manage users & data</p>
                </div>

                <div className="flex-1" />

                <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-40 lg:w-56 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent outline-none text-sm"
                />

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors font-bold text-sm shadow-md"
                >
                    <UserPlus size={16} />
                    Add User
                </button>
            </div>

            {/* Default Credentials Info */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-blue-800 mb-2">Default Login Credentials</h3>
                <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold text-xs">Admin</span>
                        <span className="text-gray-600">ID: <code className="bg-white px-1.5 py-0.5 rounded border text-gray-800">admin</code></span>
                        <span className="text-gray-600">Pass: <code className="bg-white px-1.5 py-0.5 rounded border text-gray-800">admin123</code></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-bold text-xs">User</span>
                        <span className="text-gray-600">ID: <code className="bg-white px-1.5 py-0.5 rounded border text-gray-800">user</code></span>
                        <span className="text-gray-600">Pass: <code className="bg-white px-1.5 py-0.5 rounded border text-gray-800">user123</code></span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 max-h-[450px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Credentials</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Page Access</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((u, idx) => (
                                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{u.name}</div>
                                        <div className="text-xs text-blue-600 font-medium uppercase">{u.role}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-mono bg-gray-50 px-2 py-1 rounded inline-block">ID: {u.id}</div>
                                        <div className="text-[10px] text-gray-400 mt-1">Pass: {u.password}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {u.pageAccess.map(p => (
                                                <span key={p} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] whitespace-nowrap">
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {u.id !== 'admin' && (
                                                <>
                                                    <button
                                                        onClick={() => handleEditUser(u)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Edit User"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500 italic">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100 italic">
                    {filteredUsers.map((u) => (
                        <div key={u.id} className="p-4 space-y-3 bg-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">{u.name}</h4>
                                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">{u.role}</p>
                                </div>
                                {u.id !== 'admin' && (
                                    <button
                                        onClick={() => handleDeleteUser(u.id)}
                                        className="p-2 text-red-600 bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">User ID</p>
                                    <p className="text-xs font-mono font-bold text-gray-700">{u.id}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Password</p>
                                    <p className="text-xs font-mono font-bold text-gray-700">{u.password}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase mb-2">Allowed Pages</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {u.pageAccess.map(p => (
                                        <span key={p} className="px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded text-[10px] font-medium shadow-sm">
                                            {p}
                                        </span>
                                    ))}
                                    {u.pageAccess.length === 0 && <span className="text-[10px] text-gray-400 italic">No access</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white sm:rounded-2xl shadow-2xl w-full h-full sm:h-auto sm:max-w-md overflow-y-auto">
                        <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddUser} className="p-4 sm:p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 outline-none text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUser.id}
                                        onChange={(e) => setNewUser({ ...newUser, id: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 outline-none text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Page Access</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {allPages.map(page => (
                                        <label key={page} className="flex items-center gap-2 text-xs p-2.5 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={newUser.pageAccess.includes(page)}
                                                onChange={() => handleToggleAccess(page)}
                                                className="rounded text-red-800 focus:ring-red-800 w-4 h-4 cursor-pointer"
                                            />
                                            {page}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-4 border-t sm:flex sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-bold text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 sm:py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 shadow-md font-bold text-sm"
                                >
                                    Save User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
