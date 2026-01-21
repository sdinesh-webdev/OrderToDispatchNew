import React, { useState, useEffect } from 'react';
import { Save, History, ClipboardList } from 'lucide-react';
import SearchableDropdown from '../../components/SearchableDropdown';

const DispatchPlanning = () => {
    const [orders, setOrders] = useState([]);
    const [dispatchHistory, setDispatchHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedRows, setSelectedRows] = useState({});
    const [editData, setEditData] = useState({});

    const [searchTerm, setSearchTerm] = useState('');
    const [clientFilter, setClientFilter] = useState('');
    const [godownFilter, setGodownFilter] = useState('');

    useEffect(() => {
        const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        const savedHistory = JSON.parse(localStorage.getItem('dispatchHistory') || '[]');
        setOrders(savedOrders.filter(o => !o.planned));
        setDispatchHistory(savedHistory);
    }, []);

    // Get unique clients and godowns for filters
    const allUniqueClients = [...new Set([...orders.map(o => o.clientName), ...dispatchHistory.map(h => h.clientName)])].sort();
    const allUniqueGodowns = [...new Set([...orders.map(o => o.godownName), ...dispatchHistory.map(h => h.godownName)])].sort();

    const filteredOrders = orders.filter(order => {
        const matchesSearch = Object.values(order).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesClient = clientFilter === '' || order.clientName === clientFilter;
        const matchesGodown = godownFilter === '' || order.godownName === godownFilter;
        return matchesSearch && matchesClient && matchesGodown;
    });

    const filteredHistory = dispatchHistory.filter(item => {
        const matchesSearch = Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesClient = clientFilter === '' || item.clientName === clientFilter;
        const matchesGodown = godownFilter === '' || item.godownName === godownFilter;
        return matchesSearch && matchesClient && matchesGodown;
    });

    const handleCheckboxToggle = (idx, order) => {
        const isSelected = !selectedRows[idx];
        setSelectedRows({ ...selectedRows, [idx]: isSelected });

        if (isSelected) {
            setEditData({
                ...editData,
                [idx]: {
                    dispatchQty: order.qty,
                    dispatchDate: new Date().toISOString().split('T')[0],
                    gstIncluded: 'Yes'
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
        const lastDN = dispatchHistory.length > 0
            ? parseInt(dispatchHistory[dispatchHistory.length - 1].dispatchNo.split('-')[1])
            : 0;

        let currentDNCount = lastDN;
        const newHistoryEntries = [];
        const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');

        Object.keys(selectedRows).forEach((idx) => {
            if (selectedRows[idx]) {
                currentDNCount++;
                const order = orders[idx];
                const planningData = editData[idx];

                const historyEntry = {
                    ...order,
                    dispatchNo: `DN-${String(currentDNCount).padStart(3, '0')}`,
                    dispatchQty: planningData.dispatchQty,
                    dispatchDate: planningData.dispatchDate,
                    gstIncluded: planningData.gstIncluded,
                    planned: true,
                    notified: false // For next step
                };

                newHistoryEntries.push(historyEntry);

                // Update original orders list to mark as planned
                const orderIdx = allOrders.findIndex(o => o.serialNo === order.serialNo);
                if (orderIdx > -1) allOrders[orderIdx].planned = true;
            }
        });

        const updatedHistory = [...dispatchHistory, ...newHistoryEntries];
        localStorage.setItem('dispatchHistory', JSON.stringify(updatedHistory));
        localStorage.setItem('orders', JSON.stringify(allOrders));

        setDispatchHistory(updatedHistory);
        setOrders(allOrders.filter(o => !o.planned));
        setSelectedRows({});
        setEditData({});
    };

    return (
        <div className="p-3 sm:p-6 lg:p-8">
            {/* Header Row with Title, Tabs, Filters, and Actions */}
            <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-xl font-bold text-gray-800">Disp Plan</h1>

                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'pending' ? 'bg-white text-red-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <ClipboardList size={16} />
                        Pending
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-white text-red-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
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
                    className="w-32 lg:w-40 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent outline-none text-sm"
                />
                <SearchableDropdown
                    value={clientFilter}
                    onChange={setClientFilter}
                    options={allUniqueClients}
                    allLabel="All Clients"
                    className="w-32 lg:w-40"
                />
                <SearchableDropdown
                    value={godownFilter}
                    onChange={setGodownFilter}
                    options={allUniqueGodowns}
                    allLabel="All Godowns"
                    className="w-32 lg:w-40"
                />

                {activeTab === 'pending' && Object.values(selectedRows).some(v => v) && (
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 shadow-md font-bold text-sm"
                    >
                        <Save size={16} />
                        Save Planning
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {activeTab === 'pending' ? (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 max-h-[460px] overflow-y-auto">
                            <table className="w-full text-left border-collapse min-w-[1200px]">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-600 font-bold sticky top-0 z-10 shadow-sm">
                                        <th className="px-4 py-3">Action</th>
                                        <th className="px-4 py-3">Serial Number</th>
                                        <th className="px-4 py-3">Order No</th>
                                        <th className="px-4 py-3">Dispatch Qty</th>
                                        <th className="px-4 py-3">Dispatch Date</th>
                                        <th className="px-4 py-3">GST Included</th>
                                        <th className="px-4 py-3">Client Name</th>
                                        <th className="px-4 py-3">Godown Name</th>
                                        <th className="px-4 py-3">Order Date</th>
                                        <th className="px-4 py-3">Item Name</th>
                                        <th className="px-4 py-3">Rate</th>
                                        <th className="px-4 py-3 text-center">Qty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-sm">
                                    {[...filteredOrders].reverse().map((order, idx) => (
                                        <tr key={idx} className={`${selectedRows[idx] ? 'bg-red-50/50' : 'hover:bg-gray-50'} transition-colors`}>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={!!selectedRows[idx]}
                                                    onChange={() => handleCheckboxToggle(idx, order)}
                                                    className="rounded text-red-800 focus:ring-red-800 w-4 h-4 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-4 py-3 font-medium">{order.serialNo}</td>
                                            <td className="px-4 py-3">{order.orderNo}</td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    disabled={!selectedRows[idx]}
                                                    value={editData[idx]?.dispatchQty || ''}
                                                    onChange={(e) => handleEditChange(idx, 'dispatchQty', e.target.value)}
                                                    className="w-20 px-2 py-1 border rounded disabled:bg-gray-100 text-xs outline-none focus:border-red-800"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="date"
                                                    disabled={!selectedRows[idx]}
                                                    value={editData[idx]?.dispatchDate || ''}
                                                    onChange={(e) => handleEditChange(idx, 'dispatchDate', e.target.value)}
                                                    className="px-2 py-1 border rounded disabled:bg-gray-100 text-xs outline-none focus:border-red-800"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    disabled={!selectedRows[idx]}
                                                    value={editData[idx]?.gstIncluded || ''}
                                                    onChange={(e) => handleEditChange(idx, 'gstIncluded', e.target.value)}
                                                    className="px-2 py-1 border rounded disabled:bg-gray-100 text-xs outline-none focus:border-red-800"
                                                >
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">{order.clientName}</td>
                                            <td className="px-4 py-3">{order.godownName}</td>
                                            <td className="px-4 py-3">{order.orderDate}</td>
                                            <td className="px-4 py-3">{order.itemName}</td>
                                            <td className="px-4 py-3">{order.rate}</td>
                                            <td className="px-4 py-3 text-center">{order.qty}</td>
                                        </tr>
                                    ))}
                                    {filteredOrders.length === 0 && (
                                        <tr>
                                            <td colSpan="12" className="px-4 py-8 text-center text-gray-500 italic">No items found matching your filters.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-gray-200">
                            {[...filteredOrders].reverse().map((order, idx) => (
                                <div key={idx} className={`p-4 space-y-4 ${selectedRows[idx] ? 'bg-red-50/30' : 'bg-white'}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                checked={!!selectedRows[idx]}
                                                onChange={() => handleCheckboxToggle(idx, order)}
                                                className="mt-1 rounded text-red-800 focus:ring-red-800 w-5 h-5"
                                            />
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">SN: {order.serialNo}</p>
                                                <h4 className="text-sm font-bold text-gray-900">{order.clientName}</h4>
                                                <p className="text-[10px] mt-1 text-gray-500">Order: {order.orderNo} | {order.itemName}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedRows[idx] && (
                                        <div className="grid grid-cols-2 gap-3 bg-red-50/50 p-3 rounded-lg border border-red-100">
                                            <div className="col-span-2">
                                                <label className="block text-[10px] font-bold text-red-800 mb-1 uppercase">Dispatch Date</label>
                                                <input
                                                    type="date"
                                                    value={editData[idx]?.dispatchDate || ''}
                                                    onChange={(e) => handleEditChange(idx, 'dispatchDate', e.target.value)}
                                                    className="w-full px-3 py-1.5 border border-red-200 rounded text-xs outline-none focus:border-red-800 bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-red-800 mb-1 uppercase">Disp Qty</label>
                                                <input
                                                    type="number"
                                                    value={editData[idx]?.dispatchQty || ''}
                                                    onChange={(e) => handleEditChange(idx, 'dispatchQty', e.target.value)}
                                                    className="w-full px-3 py-1.5 border border-red-200 rounded text-xs outline-none focus:border-red-800 bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-red-800 mb-1 uppercase">GST</label>
                                                <select
                                                    value={editData[idx]?.gstIncluded || ''}
                                                    onChange={(e) => handleEditChange(idx, 'gstIncluded', e.target.value)}
                                                    className="w-full px-3 py-1.5 border border-red-200 rounded text-xs outline-none focus:border-red-800 bg-white"
                                                >
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-500 pt-2 border-t border-gray-50">
                                        <div>
                                            <p className="uppercase text-[8px] font-bold text-gray-400">Rate</p>
                                            <p className="font-bold text-gray-700">{order.rate}</p>
                                        </div>
                                        <div>
                                            <p className="uppercase text-[8px] font-bold text-gray-400">Order Qty</p>
                                            <p className="font-bold text-gray-700">{order.qty}</p>
                                        </div>
                                        <div>
                                            <p className="uppercase text-[8px] font-bold text-gray-400">Godown</p>
                                            <p className="font-bold text-gray-700 truncate">{order.godownName}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredOrders.length === 0 && (
                                <div className="p-8 text-center text-gray-500 italic text-sm">No items found matching your filters.</div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Desktop Table History */}
                        <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 max-h-[460px] overflow-y-auto">
                            <table className="w-full text-left border-collapse min-w-[1200px]">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-600 font-bold sticky top-0 z-10 shadow-sm">
                                        <th className="px-4 py-3">Serial Number</th>
                                        <th className="px-4 py-3">Order No</th>
                                        <th className="px-4 py-3 text-red-800">Dispatch Number</th>
                                        <th className="px-4 py-3">Dispatch Qty</th>
                                        <th className="px-4 py-3">Dispatch Date</th>
                                        <th className="px-4 py-3">GST Included</th>
                                        <th className="px-4 py-3">Client Name</th>
                                        <th className="px-4 py-3">Godown Name</th>
                                        <th className="px-4 py-3">Order Date</th>
                                        <th className="px-4 py-3">Item Name</th>
                                        <th className="px-4 py-3">Rate</th>
                                        <th className="px-4 py-3 text-center">Qty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-sm italic">
                                    {[...filteredHistory].reverse().map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-center">{item.serialNo}</td>
                                            <td className="px-4 py-3">{item.orderNo}</td>
                                            <td className="px-4 py-3 font-bold text-red-800">{item.dispatchNo}</td>
                                            <td className="px-4 py-3 font-semibold">{item.dispatchQty}</td>
                                            <td className="px-4 py-3">{item.dispatchDate}</td>
                                            <td className="px-4 py-3">{item.gstIncluded}</td>
                                            <td className="px-4 py-3">{item.clientName}</td>
                                            <td className="px-4 py-3">{item.godownName}</td>
                                            <td className="px-4 py-3">{item.orderDate}</td>
                                            <td className="px-4 py-3">{item.itemName}</td>
                                            <td className="px-4 py-3">{item.rate}</td>
                                            <td className="px-4 py-3 text-center font-bold">{item.qty}</td>
                                        </tr>
                                    ))}
                                    {filteredHistory.length === 0 && (
                                        <tr>
                                            <td colSpan="12" className="px-4 py-8 text-center text-gray-500">No planning history found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card History */}
                        <div className="md:hidden divide-y divide-gray-200">
                            {[...filteredHistory].reverse().map((item, idx) => (
                                <div key={idx} className="p-4 space-y-3 bg-white">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-bold text-red-800 uppercase leading-none mb-1">{item.dispatchNo}</p>
                                            <h4 className="text-sm font-bold text-gray-900 leading-tight">{item.clientName}</h4>
                                        </div>
                                        <span className="bg-red-50 text-red-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">SN: {item.serialNo}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] text-gray-600">
                                        <div className="flex justify-between border-b border-gray-50 pb-1">
                                            <span className="text-gray-400">Order No</span>
                                            <span className="font-medium">{item.orderNo}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-50 pb-1">
                                            <span className="text-gray-400">Disp Qty</span>
                                            <span className="font-bold text-red-800">{item.dispatchQty}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-50 pb-1">
                                            <span className="text-gray-400">Disp Date</span>
                                            <span className="font-medium">{item.dispatchDate}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-50 pb-1">
                                            <span className="text-gray-400">GST</span>
                                            <span className="font-medium">{item.gstIncluded}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-gray-400 mb-0.5">Item Details</p>
                                            <p className="font-bold text-gray-800 uppercase">{item.itemName} @ {item.rate}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {dispatchHistory.length === 0 && (
                                <div className="p-8 text-center text-gray-500 text-sm italic">History is empty.</div>
                            )}
                        </div>
                    </>
                )}
            </div>

        </div>
    );
};

export default DispatchPlanning;
