import React, { useState, useEffect } from 'react';
import { CheckCircle, History, Save } from 'lucide-react';
import SearchableDropdown from '../../components/SearchableDropdown';

const DispatchComplete = () => {
    const [pendingItems, setPendingItems] = useState([]);
    const [historyItems, setHistoryItems] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedRows, setSelectedRows] = useState({});
    const [editData, setEditData] = useState({});

    const itemNames = ['Item 1', 'Item 2', 'Raw Material', 'Finished Good'];

    const [searchTerm, setSearchTerm] = useState('');
    const [clientFilter, setClientFilter] = useState('');
    const [godownFilter, setGodownFilter] = useState('');

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('dispatchHistory') || '[]');
        setPendingItems(history.filter(h => h.notified && !h.completeStageComplete));
        setHistoryItems(history.filter(h => h.completeStageComplete));
    }, []);

    const allUniqueClients = [...new Set([...pendingItems.map(o => o.clientName), ...historyItems.map(h => h.clientName)])].sort();
    const allUniqueGodowns = [...new Set([...pendingItems.map(o => o.godownName), ...historyItems.map(h => h.godownName)])].sort();

    const filteredPending = pendingItems.filter(item => {
        const matchesSearch = Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesClient = clientFilter === '' || item.clientName === clientFilter;
        const matchesGodown = godownFilter === '' || item.godownName === godownFilter;
        return matchesSearch && matchesClient && matchesGodown;
    });

    const filteredHistory = historyItems.filter(item => {
        const matchesSearch = Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesClient = clientFilter === '' || item.clientName === clientFilter;
        const matchesGodown = godownFilter === '' || item.godownName === godownFilter;
        return matchesSearch && matchesClient && matchesGodown;
    });

    const handleCheckboxToggle = (idx, item) => {
        const isSelected = !selectedRows[idx];
        setSelectedRows({ ...selectedRows, [idx]: isSelected });

        if (isSelected) {
            setEditData({
                ...editData,
                [idx]: {
                    itemName: item.itemName,
                    godownName: item.godownName,
                    dispatchQty: item.dispatchQty,
                    completeDate: new Date().toISOString().split('T')[0],
                    status: 'Complete'
                }
            });
        } else {
            const newEditData = { ...editData };
            delete newEditData[idx];
            setEditData(newEditData);
        }
    };

    const handleEditChange = (idx, field, value) => {
        setEditData({
            ...editData,
            [idx]: { ...editData[idx], [field]: value }
        });
    };

    const handleSave = () => {
        const history = JSON.parse(localStorage.getItem('dispatchHistory') || '[]');

        Object.keys(selectedRows).forEach(idx => {
            if (selectedRows[idx]) {
                const item = pendingItems[idx];
                const edit = editData[idx];
                const realIdx = history.findIndex(h => h.dispatchNo === item.dispatchNo && h.serialNo === item.serialNo);
                if (realIdx > -1) {
                    history[realIdx] = {
                        ...history[realIdx],
                        itemName: edit.itemName,
                        godownName: edit.godownName,
                        dispatchQty: edit.dispatchQty,
                        completeDate: edit.completeDate,
                        status: edit.status,
                        completeStageComplete: true,
                        postNotifyStage: false // For next step
                    };
                }
            }
        });

        localStorage.setItem('dispatchHistory', JSON.stringify(history));
        setPendingItems(history.filter(h => h.notified && !h.completeStageComplete));
        setHistoryItems(history.filter(h => h.completeStageComplete));
        setSelectedRows({});
        setEditData({});
    };

    return (
        <div className="p-3 sm:p-6 lg:p-8">
            {/* Header Row with Title, Tabs, Filters, and Actions */}
            <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-xl font-bold text-gray-800">Disp Done</h1>

                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'pending' ? 'bg-white text-green-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <CheckCircle size={16} />
                        Pending
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-white text-green-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <History size={16} />
                        History
                    </button>
                </div>

                <div className="flex-1" />

                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-32 lg:w-40 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent outline-none text-sm"
                />
                <SearchableDropdown
                    value={clientFilter}
                    onChange={setClientFilter}
                    options={allUniqueClients}
                    allLabel="All Clients"
                    className="w-32 lg:w-40"
                    focusColor="green-800"
                />
                <SearchableDropdown
                    value={godownFilter}
                    onChange={setGodownFilter}
                    options={allUniqueGodowns}
                    allLabel="All Godowns"
                    className="w-32 lg:w-40"
                    focusColor="green-800"
                />

                {activeTab === 'pending' && Object.values(selectedRows).some(v => v) && (
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 shadow-md font-bold text-sm"
                    >
                        <Save size={16} />
                        Save Completion
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 max-h-[460px] overflow-y-auto">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-600 font-bold sticky top-0 z-10 shadow-sm">
                                {activeTab === 'pending' && <th className="px-4 py-3">Action</th>}
                                <th className="px-4 py-3">Serial Number</th>
                                <th className="px-4 py-3">Order No</th>
                                <th className="px-4 py-3 text-green-700">Dispatch Number</th>
                                <th className="px-4 py-3">Dispatch Qty</th>
                                <th className="px-4 py-3">Dispatch Date</th>
                                <th className="px-4 py-3">GST Included</th>
                                <th className="px-4 py-3">Client Name</th>
                                <th className="px-4 py-3">Godown Name</th>
                                <th className="px-4 py-3">Order Date</th>
                                <th className="px-4 py-3">Item Name</th>
                                <th className="px-4 py-3">Status</th>
                                {activeTab === 'pending' && <th className="px-4 py-3 text-green-700">Complete Date</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-sm">
                            {[...(activeTab === 'pending' ? filteredPending : filteredHistory)].reverse().map((item, idx) => (
                                <tr key={idx} className={`${selectedRows[idx] ? 'bg-green-50/50' : 'hover:bg-gray-50'}`}>
                                    {activeTab === 'pending' && (
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={!!selectedRows[idx]}
                                                onChange={() => handleCheckboxToggle(idx, item)}
                                                className="rounded text-green-800 focus:ring-green-800 w-4 h-4 cursor-pointer"
                                            />
                                        </td>
                                    )}
                                    <td className="px-4 py-3 font-medium">{item.serialNo}</td>
                                    <td className="px-4 py-3">{item.orderNo}</td>
                                    <td className="px-4 py-3 font-bold text-green-700">{item.dispatchNo}</td>
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="number"
                                            disabled={!selectedRows[idx] || activeTab === 'history'}
                                            value={activeTab === 'pending' ? (editData[idx]?.dispatchQty || '') : item.dispatchQty}
                                            onChange={(e) => handleEditChange(idx, 'dispatchQty', e.target.value)}
                                            className="w-16 px-1 py-0.5 border rounded text-xs disabled:bg-transparent disabled:border-transparent outline-none"
                                        />
                                    </td>
                                    <td className="px-4 py-3">{item.dispatchDate}</td>
                                    <td className="px-4 py-3">{item.gstIncluded}</td>
                                    <td className="px-4 py-3">{item.clientName}</td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="text"
                                            disabled={!selectedRows[idx] || activeTab === 'history'}
                                            value={activeTab === 'pending' ? (editData[idx]?.godownName || '') : item.godownName}
                                            onChange={(e) => handleEditChange(idx, 'godownName', e.target.value)}
                                            className="w-24 px-1 py-0.5 border rounded text-xs disabled:bg-transparent disabled:border-transparent outline-none"
                                        />
                                    </td>
                                    <td className="px-4 py-3">{item.orderDate}</td>
                                    <td className="px-4 py-3">
                                        {activeTab === 'pending' ? (
                                            <select
                                                disabled={!selectedRows[idx]}
                                                value={editData[idx]?.itemName || ''}
                                                onChange={(e) => handleEditChange(idx, 'itemName', e.target.value)}
                                                className="w-24 px-1 py-0.5 border rounded text-xs disabled:bg-transparent disabled:border-transparent outline-none"
                                            >
                                                {itemNames.map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        ) : item.itemName}
                                    </td>
                                    <td className="px-4 py-3 font-bold">
                                        {activeTab === 'pending' ? (
                                            <select
                                                disabled={!selectedRows[idx]}
                                                value={editData[idx]?.status || ''}
                                                onChange={(e) => handleEditChange(idx, 'status', e.target.value)}
                                                className="w-24 px-1 py-0.5 border rounded text-xs text-green-700 outline-none"
                                            >
                                                <option value="Complete">Complete</option>
                                                <option value="Pending">Pending</option>
                                            </select>
                                        ) : (
                                            <span className="text-green-700">{item.status}</span>
                                        )}
                                    </td>
                                    {activeTab === 'pending' && (
                                        <td className="px-4 py-3">
                                            <input
                                                type="date"
                                                disabled={!selectedRows[idx]}
                                                value={editData[idx]?.completeDate || ''}
                                                onChange={(e) => handleEditChange(idx, 'completeDate', e.target.value)}
                                                className="px-1 py-0.5 border rounded text-xs outline-none"
                                            />
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {(activeTab === 'pending' ? filteredPending : filteredHistory).length === 0 && (
                                <tr>
                                    <td colSpan="13" className="px-4 py-8 text-center text-gray-500 italic">No items found matching your filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default DispatchComplete;
