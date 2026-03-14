import React, { useState, useEffect } from 'react';
import { Mail, History, Save } from 'lucide-react';
import SearchableDropdown from '../../components/SearchableDropdown';

const AfterDispatchInformToParty = () => {
    const [pendingItems, setPendingItems] = useState([]);
    const [historyItems, setHistoryItems] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedRows, setSelectedRows] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [clientFilter, setClientFilter] = useState('');
    const [godownFilter, setGodownFilter] = useState('');

    useEffect(() => {
        setPendingItems([]);
        setHistoryItems([]);
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

    const handleCheckboxToggle = (idx) => {
        setSelectedRows({ ...selectedRows, [idx]: !selectedRows[idx] });
    };

    const handleSave = () => {
        const newlyNotified = [];

        Object.keys(selectedRows).forEach(idx => {
            if (selectedRows[idx]) {
                const item = { ...pendingItems[idx], postNotified: true };
                newlyNotified.push(item);
            }
        });

        const remainingPending = pendingItems.filter((_, idx) => !selectedRows[idx]);
        setPendingItems(remainingPending);
        setHistoryItems([...historyItems, ...newlyNotified]);
        setSelectedRows({});
    };

    return (
        <div className="p-3 sm:p-6 lg:p-8">
            {/* Header Row with Title, Tabs, Filters, and Actions */}
            <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-xl font-bold text-gray-800">Inform to Party After Dispatch</h1>

                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'pending' ? 'bg-white text-indigo-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Mail size={16} />
                        Pending
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-white text-indigo-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
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
                    className="w-32 lg:w-40 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-800 focus:border-transparent outline-none text-sm"
                />
                <SearchableDropdown
                    value={clientFilter}
                    onChange={setClientFilter}
                    options={allUniqueClients}
                    allLabel="All Clients"
                    className="w-32 lg:w-40"
                    focusColor="indigo-800"
                />
                <SearchableDropdown
                    value={godownFilter}
                    onChange={setGodownFilter}
                    options={allUniqueGodowns}
                    allLabel="All Godowns"
                    className="w-32 lg:w-40"
                    focusColor="indigo-800"
                />

                {activeTab === 'pending' && Object.values(selectedRows).some(v => v) && (
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-800 text-white rounded-lg hover:bg-indigo-900 shadow-md font-bold text-sm"
                    >
                        <Save size={16} />
                        Confirm Post-Notify
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 max-h-[460px] overflow-y-auto">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-600 font-bold sticky top-0 z-10 shadow-sm">
                                {activeTab === 'pending' && <th className="px-4 py-3">Action</th>}
                                <th className="px-4 py-3">Serial Number</th>
                                <th className="px-4 py-3">Order No</th>
                                <th className="px-4 py-3 text-indigo-700">Dispatch Number</th>
                                <th className="px-4 py-3">Dispatch Qty</th>
                                <th className="px-4 py-3">Dispatch Date</th>
                                <th className="px-4 py-3 text-green-700">Comp Date</th>
                                <th className="px-4 py-3">Client Name</th>
                                <th className="px-4 py-3">Godown Name</th>
                                <th className="px-4 py-3">Order Date</th>
                                <th className="px-4 py-3">Item Name</th>
                                <th className="px-4 py-3">Status</th>
                                {activeTab === 'history' && <th className="px-4 py-3">Notified</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-sm">
                            {[...(activeTab === 'pending' ? filteredPending : filteredHistory)].reverse().map((item, idx) => (
                                <tr key={idx} className={`${selectedRows[idx] ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`}>
                                    {activeTab === 'pending' && (
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={!!selectedRows[idx]}
                                                onChange={() => handleCheckboxToggle(idx)}
                                                className="rounded text-indigo-800 focus:ring-indigo-800"
                                            />
                                        </td>
                                    )}
                                    <td className="px-4 py-3 font-medium">{item.serialNo}</td>
                                    <td className="px-4 py-3">{item.orderNo}</td>
                                    <td className="px-4 py-3 font-bold text-indigo-700 uppercase">{item.dispatchNo}</td>
                                    <td className="px-4 py-3 font-semibold">{item.dispatchQty}</td>
                                    <td className="px-4 py-3">{item.dispatchDate}</td>
                                    <td className="px-4 py-3 font-medium text-green-700">{item.completeDate || '-'}</td>
                                    <td className="px-4 py-3">{item.clientName}</td>
                                    <td className="px-4 py-3">{item.godownName}</td>
                                    <td className="px-4 py-3">{item.orderDate}</td>
                                    <td className="px-4 py-3 font-medium">{item.itemName}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">
                                            {item.status}
                                        </span>
                                    </td>
                                    {activeTab === 'history' && (
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold">YES</span>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {(activeTab === 'pending' ? filteredPending : filteredHistory).length === 0 && (
                                <tr>
                                    <td colSpan="13" className="px-4 py-8 text-center text-gray-500 italic">
                                        No items found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-200">
                    {[...(activeTab === 'pending' ? filteredPending : filteredHistory)].reverse().map((item, idx) => (
                        <div key={idx} className={`p-4 space-y-3 ${selectedRows[idx] ? 'bg-indigo-50/30' : 'bg-white'}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3 items-start">
                                    {activeTab === 'pending' && (
                                        <input
                                            type="checkbox"
                                            checked={!!selectedRows[idx]}
                                            onChange={() => handleCheckboxToggle(idx)}
                                            className="mt-1 rounded text-indigo-800 focus:ring-indigo-800 w-5 h-5"
                                        />
                                    )}
                                    <div>
                                        <p className="text-[10px] font-bold text-indigo-700 uppercase leading-none mb-1">{item.dispatchNo}</p>
                                        <h4 className="text-sm font-bold text-gray-900 leading-tight">{item.clientName}</h4>
                                        <p className="text-[10px] mt-1 text-gray-500">Order: {item.orderNo} | {item.itemName}</p>
                                    </div>
                                </div>
                                {activeTab === 'history' && (
                                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">SENT: YES</span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] text-gray-600 pt-1">
                                <div className="flex flex-col">
                                    <span className="text-gray-400 text-[9px] uppercase font-bold tracking-tight">Disp Qty</span>
                                    <span className="font-bold text-indigo-800">{item.dispatchQty}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-400 text-[9px] uppercase font-bold tracking-tight">Comp Date</span>
                                    <span className="font-bold text-green-700">{item.completeDate}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-400 text-[9px] uppercase font-bold tracking-tight">Godown</span>
                                    <span className="font-medium truncate">{item.godownName}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-400 text-[9px] uppercase font-bold tracking-tight">Status</span>
                                    <span className="font-medium">{item.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(activeTab === 'pending' ? filteredPending : filteredHistory).length === 0 && (
                        <div className="p-8 text-center text-gray-500 italic text-sm">No items found matching your filters.</div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default AfterDispatchInformToParty;
