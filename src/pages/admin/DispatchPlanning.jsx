import React, { useState, useEffect } from 'react';
import { Save, History, ClipboardList, X } from 'lucide-react';
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
    const [orderNoFilter, setOrderNoFilter] = useState('');
    const [itemFilter, setItemFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [stockLocationFilter, setStockLocationFilter] = useState('');
    const godowns = ['Godown 1', 'Godown 2', 'Main Store', 'North Warehouse'];

    const dummyStockData = [
        "Gdn:10", "Gdn:0", "Gdn:0", "Gdn:0", "Gdn:0", "Gdn:0", "Gdn:388, DP:0, Darba:-20",
        "Gdn:4", "Gdn:0", "Gdn:13", "Gdn:59", "Gdn:72", "Gdn:36", "Gdn:4", "Gdn:158",
        "Gdn:90", "Gdn:19", "Gdn:158", "Gdn:200", "Gdn:90", "Gdn:51", "Gdn:5", "Gdn:5",
        "Gdn:53", "Gdn:22", "Gdn:6", "Gdn:0", "Gdn:0, DP:10", "Gdn:368, DP:0, Darba:-5",
        "Gdn:156, DP:0, Darba:-55", "Gdn:388, DP:0, Darba:-20", "Gdn:368, DP:0, Darba:-5",
        "Gdn:156, DP:0, Darba:-55", "Gdn:41", "Gdn:32", "Gdn:0", "Gdn:11", "Gdn:0",
        "Gdn:0", "Gdn:17", "Gdn:14", "Gdn:22", "Gdn:3", "Gdn:200", "Gdn:90", "Gdn:158",
        "Gdn:0", "Gdn:15", "Gdn:31, Darba:0", "Gdn:14, Darba:0", "Gdn:0", "Gdn:10",
        "Gdn:0", "Gdn:200", "Gdn:90", "Gdn:43", "Gdn:90", "Gdn:200", "Gdn:28", "Gdn:40",
        "Gdn:0", "Gdn:22", "Gdn:3", "Gdn:200", "Gdn:90", "Gdn:0, DP:4, Darba:0",
        "Gdn:0, DP:-37, Darba:0", "Gdn:32", "Gdn:7", "Gdn:17", "Gdn:0", "Gdn:30",
        "Gdn:44", "Gdn:8", "Gdn:0, DP:4, Darba:0", "Gdn:0, DP:-37, Darba:0",
        "Gdn:1, DP:-27, Darba:0", "Gdn:0, DP:-27, Darba:0", "Gdn:128", "Gdn:64", "Gdn:86",
        "Gdn:17", "Gdn:42", "Gdn:16", "Gdn:9", "Gdn:17", "Gdn:8", "Gdn:1", "Gdn:0",
        "Gdn:30", "Gdn:0, DP:4, Darba:0", "Gdn:0, DP:-37, Darba:0", "Gdn:1, DP:-27, Darba:0",
        "Gdn:0, DP:-27, Darba:0", "Gdn:6", "Gdn:7", "Gdn:6", "Gdn:0", "Gdn:0", "Gdn:9",
        "Gdn:5", "Gdn:17", "Gdn:1", "Gdn:0", "Gdn:0", "Gdn:0", "Gdn:0", "Gdn:11", "Gdn:5",
        "Gdn:42", "Gdn:10", "Gdn:19", "Gdn:21", "Gdn:388, DP:0, Darba:-20",
        "Gdn:368, DP:0, Darba:-5", "Gdn:156, DP:0, Darba:-55", "Gdn:44, DP:0, Darba:0",
        "Gdn:31, Darba:-40", "Gdn:36", "Gdn:10", "Gdn:0", "Gdn:0", "Gdn:152", "Gdn:41",
        "Gdn:23", "Gdn:11", "Gdn:9", "Gdn:11", "Gdn:36", "Gdn:17", "Gdn:46",
        "Gdn:27, Darba:0", "Gdn:3, Darba:0", "Gdn:31, Darba:0", "Gdn:40", "Gdn:0",
        "Gdn:9", "Gdn:55", "Gdn:46", "Gdn:3", "Gdn:9", "Gdn:5", "Gdn:7", "Gdn:53",
        "Gdn:39", "Gdn:47", "Gdn:25", "Gdn:41", "Gdn:5", "Gdn:8", "Gdn:0", "Gdn:10",
        "Gdn:0, DP:-27, Darba:0", "Gdn:55", "Gdn:9", "Gdn:51", "Gdn:23", "Gdn:3",
        "Gdn:200", "Gdn:90", "Gdn:0, DP:4, Darba:0", "Gdn:0, DP:-37, Darba:0",
        "Gdn:1, DP:-27, Darba:0", "Gdn:0, DP:-27, Darba:0", "Gdn:388, DP:0, Darba:-20",
        "Gdn:368, DP:0, Darba:-5", "Gdn:156, DP:0, Darba:-55", "Gdn:0, Dusera:22",
        "Gdn:0, Dusera:0", "Gdn:0, Dusera:3", "Gdn:0, Dusera:-1", "Gdn:0, Dusera:0",
        "Gdn:0, Dusera:8", "Dusera:12", "Gdn:0, Dusera:3", "Gdn:0, Dusera:44",
        "Gdn:0, Dusera:28", "Gdn:0, Dusera:3", "Gdn:0, Dusera:168", "Gdn:0, Dusera:0",
        "Gdn:0, Dusera:44", "Gdn:0, Dusera:49", "Gdn:0, Dusera:36", "Gdn:0, Dusera:28",
        "Gdn:0, Dusera:3", "Gdn:0, Dusera:168", "Gdn:0, Dusera:0", "Gdn:0, Dusera:44",
        "Gdn:0, Dusera:3", "Gdn:0, Dusera:168", "Gdn:0, Dusera:22", "Dusera:8",
        "Gdn:0, Dusera:28", "Gdn:0, Dusera:3", "Gdn:0, Dusera:168", "Gdn:0, Dusera:0",
        "Gdn:0, Dusera:44", "Gdn:0, Dusera:49", "Gdn:0, Dusera:36", "Dusera:12",
        "Dusera:-8", "Dusera:2"
    ];

    const [isLoading, setIsLoading] = useState(false);
    const API_URL = import.meta.env.VITE_SHEET_orderToDispatch_URL;

    // Professional Date Formatter
    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).replace(/ /g, '-');
        } catch (e) {
            return dateStr;
        }
    };

    const fetchOrders = async () => {
        console.log('[DispatchPlanning] Fetching from:', API_URL);
        setIsLoading(true);
        try {
            // Fetch Pending Orders from 'ORDER'
            const response = await fetch(`${API_URL}?sheet=ORDER&mode=table`);
            const result = await response.json();
            if (result.success) {
                const mappedData = result.data.map((item, index) => ({
                    ...item,
                    originalIndex: index,
                    orderNo: item.orderNumber,
                    qty: item.qty || 0
                }));
                
                // Filter: Column Q is not null AND Column R is null
                const filteredPending = mappedData.filter(item => {
                    const hasQ = item.columnQ !== undefined && item.columnQ !== null && String(item.columnQ).trim() !== '';
                    const hasR = item.columnR !== undefined && item.columnR !== null && String(item.columnR).trim() !== '';
                    return hasQ && !hasR;
                });
                
                setOrders(filteredPending);
            }

            // Fetch History from 'Planning'
            const historyResponse = await fetch(`${API_URL}?sheet=Planning&mode=table`);
            const historyResult = await historyResponse.json();
            if (historyResult.success) {
                setDispatchHistory(historyResult.data.map(item => ({
                    ...item,
                    orderNo: item.orderNumber || item.orderNo
                })));
            }
        } catch (error) {
            console.error('[DispatchPlanning] Fetch Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Get unique values for filters
    const allUniqueClients = [...new Set([...orders.map(o => o.clientName), ...dispatchHistory.map(h => h.clientName)])].sort();
    const allUniqueGodowns = [...new Set([...orders.map(o => o.godownName), ...dispatchHistory.map(h => h.godownName)])].sort();
    const allUniqueOrderNos = [...new Set([...orders.map(o => o.orderNo), ...dispatchHistory.map(h => h.orderNo)])].sort();
    const allUniqueItems = [...new Set([...orders.map(o => o.itemName), ...dispatchHistory.map(h => h.itemName)])].sort();
    const allUniqueDates = [...new Set([...orders.map(o => o.orderDate), ...dispatchHistory.map(h => h.orderDate)])].sort();

    const filteredOrders = orders
        .map((order, index) => ({ ...order, originalIndex: index }))
        .filter(order => {
            const matchesSearch = Object.values(order).some(val =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            );
            const matchesClient = clientFilter === '' || order.clientName === clientFilter;
            const matchesGodown = godownFilter === '' || order.godownName === godownFilter;
            const matchesOrderNo = orderNoFilter === '' || order.orderNo === orderNoFilter;
            const matchesItem = itemFilter === '' || order.itemName === itemFilter;
            const matchesDate = dateFilter === '' || order.orderDate === dateFilter;
            
            // Stock Location Filter logic
            const stockData = dummyStockData[order.originalIndex % dummyStockData.length] || '';
            const matchesStockLocation = stockLocationFilter === '' || stockData.toLowerCase().includes(stockLocationFilter.toLowerCase());

            return matchesSearch && matchesClient && matchesGodown && matchesOrderNo && matchesItem && matchesDate && matchesStockLocation;
        });

    const filteredHistory = dispatchHistory.filter(item => {
        const matchesSearch = Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesClient = clientFilter === '' || item.clientName === clientFilter;
        const matchesGodown = godownFilter === '' || item.godownName === godownFilter;
        const matchesOrderNo = orderNoFilter === '' || item.orderNo === orderNoFilter;
        const matchesItem = itemFilter === '' || item.itemName === itemFilter;
        const matchesDate = dateFilter === '' || item.orderDate === dateFilter;
        return matchesSearch && matchesClient && matchesGodown && matchesOrderNo && matchesItem && matchesDate;
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
                    gstIncluded: 'Yes',
                    godownName: order.godownName
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

    const handleSave = async () => {
        const rowsToSubmit = [];
        
        Object.keys(selectedRows).forEach((idx) => {
            if (selectedRows[idx]) {
                const order = orders[idx];
                const planningData = editData[idx];

                rowsToSubmit.push({
                    ...order,
                    dispatchQty: planningData.dispatchQty,
                    dispatchDate: planningData.dispatchDate,
                    gstIncluded: planningData.gstIncluded,
                    godownName: planningData.godownName || order.godownName
                });
            }
        });

        if (rowsToSubmit.length === 0) return;

        setIsLoading(true);
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors', // Basic Apps Script usage
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sheetId: import.meta.env.VITE_orderToDispatch_SHEET_ID,
                    sheet: "Planning",
                    rows: rowsToSubmit
                })
            });

            // Since no-cors doesn't give us the body, we'll assume success if it doesn't throw
            alert('Planning saved successfully!');
            fetchOrders(); // Refresh data
            setSelectedRows({});
            setEditData({});
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save planning. Please check console.');
        } finally {
            setIsLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setClientFilter('');
        setGodownFilter('');
        setOrderNoFilter('');
        setItemFilter('');
        setDateFilter('');
        setStockLocationFilter('');
    };

    const handleCancelSelection = () => {
        setSelectedRows({});
        setEditData({});
    };

    return (
        <div className="p-3 sm:p-6 lg:p-8">
            {/* Header Row with Title, Tabs, Filters, and Actions */}
            <div className="flex flex-col gap-4 mb-6 bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-gray-100">
                {/* Top Section: Title & Tabs & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Dispatch Planning</h1>

                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-white text-red-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                <ClipboardList size={16} />
                                Pending
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-red-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                <History size={16} />
                                History
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {(searchTerm || clientFilter || godownFilter || orderNoFilter || itemFilter || dateFilter || stockLocationFilter) && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-bold border border-red-100"
                            >
                                <X size={14} />
                                Clear Filters
                            </button>
                        )}
                        
                        {activeTab === 'pending' && Object.values(selectedRows).some(v => v) && (
                            <div className="flex items-center gap-2 sm:border-l sm:border-gray-200 sm:pl-3">
                                <button
                                    onClick={handleCancelSelection}
                                    className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-bold text-[13px] border border-gray-200"
                                >
                                    <X size={14} />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-3 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 shadow-md font-bold text-[13px]"
                                >
                                    <Save size={14} />
                                    Save
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Section: Grid Filters */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent outline-none text-sm transition-all"
                    />
                    <SearchableDropdown
                        value={clientFilter}
                        onChange={setClientFilter}
                        options={allUniqueClients}
                        allLabel="All Clients"
                        className="w-full"
                    />
                    <SearchableDropdown
                        value={godownFilter}
                        onChange={setGodownFilter}
                        options={allUniqueGodowns}
                        allLabel="All Godowns"
                        className="w-full"
                    />
                    <SearchableDropdown
                        value={orderNoFilter}
                        onChange={setOrderNoFilter}
                        options={allUniqueOrderNos}
                        allLabel="All Order No"
                        className="w-full"
                        focusColor="red-800"
                    />
                    <SearchableDropdown
                        value={itemFilter}
                        onChange={setItemFilter}
                        options={allUniqueItems}
                        allLabel="All Items"
                        className="w-full"
                        focusColor="red-800"
                    />
                    <SearchableDropdown
                        value={dateFilter}
                        onChange={setDateFilter}
                        options={allUniqueDates}
                        allLabel="All Dates"
                        className="w-full"
                        focusColor="red-800"
                    />
                    <SearchableDropdown
                        value={stockLocationFilter}
                        onChange={setStockLocationFilter}
                        options={[...new Set(dummyStockData.flatMap(s => s.split(',').map(p => p.split(':')[0].trim()).filter(Boolean)))].sort()}
                        allLabel="Stock Loc"
                        className="w-full"
                        focusColor="green-600"
                    />
                </div>
            </div>

            {isLoading && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-gray-100">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full border-4 border-gray-100 border-t-red-800 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-8 w-8 rounded-full border-4 border-gray-100 border-b-red-800 animate-spin-slow"></div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-sm font-black text-gray-800 uppercase tracking-[0.2em]">Loading</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Fetching Planning Data</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {activeTab === 'pending' ? (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 max-h-[460px] overflow-y-auto">
                            <table className="w-full text-left border-collapse min-w-[1200px]">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-600 font-bold sticky top-0 z-10 shadow-sm">
                                        <th className="px-4 py-3">Action</th>
                                        
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
                                        <th className="px-4 py-3 border-l border-gray-100">Current Stock</th>
                                        <th className="px-4 py-3 border-l border-gray-100">Intransit Qty</th>
                                        <th className="px-4 py-3 border-l border-gray-100">Planning Qty</th>
                                        <th className="px-4 py-3 border-l border-gray-100">Planning Pending Qty</th>
                                        <th className="px-4 py-3 border-l border-gray-100">Qty Delivered</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-sm">
                                    {[...filteredOrders].reverse().map((order) => {
                                        const realIdx = order.originalIndex;
                                        return (
                                            <tr key={`${order.orderNo}-${realIdx}`} className={`${selectedRows[realIdx] ? 'bg-red-50/50' : 'hover:bg-gray-50'} transition-colors`}>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!selectedRows[realIdx]}
                                                        onChange={() => handleCheckboxToggle(realIdx, order)}
                                                        className="rounded text-red-800 focus:ring-red-800 w-4 h-4 cursor-pointer"
                                                    />
                                                </td>
                                              
                                                <td className="px-4 py-3">{order.orderNo}</td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        disabled={!selectedRows[realIdx]}
                                                        value={editData[realIdx]?.dispatchQty || ''}
                                                        onChange={(e) => handleEditChange(realIdx, 'dispatchQty', e.target.value)}
                                                        className="w-20 px-2 py-1 border rounded disabled:bg-gray-100 text-xs outline-none focus:border-red-800"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="date"
                                                        disabled={!selectedRows[realIdx]}
                                                        value={editData[realIdx]?.dispatchDate || ''}
                                                        onChange={(e) => handleEditChange(realIdx, 'dispatchDate', e.target.value)}
                                                        className="px-2 py-1 border rounded disabled:bg-gray-100 text-xs outline-none focus:border-red-800"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        disabled={!selectedRows[realIdx]}
                                                        value={editData[realIdx]?.gstIncluded || ''}
                                                        onChange={(e) => handleEditChange(realIdx, 'gstIncluded', e.target.value)}
                                                        className="px-2 py-1 border rounded disabled:bg-gray-100 text-xs outline-none focus:border-red-800"
                                                    >
                                                        <option value="Yes">Yes</option>
                                                        <option value="No">No</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">{order.clientName}</td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        disabled={!selectedRows[realIdx]}
                                                        value={editData[realIdx]?.godownName || order.godownName}
                                                        onChange={(e) => handleEditChange(realIdx, 'godownName', e.target.value)}
                                                        className="px-2 py-1 border rounded disabled:bg-gray-100 text-xs outline-none focus:border-red-800 w-full"
                                                    >
                                                        {[...new Set([...godowns, order.godownName])].map(g => (
                                                            <option key={g} value={g}>{g}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">{formatDisplayDate(order.orderDate)}</td>
                                                <td className="px-4 py-3">{order.itemName}</td>
                                                <td className="px-4 py-3">{order.rate}</td>
                                                <td className="px-4 py-3 text-center font-bold text-red-800">{order.qty}</td>
                                                <td className="px-4 py-3 border-l border-gray-50 text-xs font-medium text-gray-700">{order.currentStock || '-'}</td>
                                                <td className="px-4 py-3 border-l border-gray-50 text-center font-medium text-gray-700">{order.intransitQty || '0'}</td>
                                                <td className="px-4 py-3 border-l border-gray-50 text-center font-medium text-gray-700">{order.planningQty || '0'}</td>
                                                <td className="px-4 py-3 border-l border-gray-50 text-center font-medium text-gray-700">{order.remPlanningQty || '0'}</td>
                                                <td className="px-4 py-3 border-l border-gray-50 text-center font-medium text-gray-700">{order.qtyDelivered || '0'}</td>
                                            </tr>
                                        );
                                    })}
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
                                    {[...filteredOrders].reverse().map((order) => {
                                        const realIdx = order.originalIndex;
                                        return (
                                            <div key={`${order.orderNo}-${realIdx}`} className={`p-4 space-y-4 ${selectedRows[realIdx] ? 'bg-red-50/30' : 'bg-white'}`}>
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-start gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!selectedRows[realIdx]}
                                                            onChange={() => handleCheckboxToggle(realIdx, order)}
                                                            className="mt-1 rounded text-red-800 focus:ring-red-800 w-5 h-5"
                                                        />
                                                        <div>
                                                            <h4 className="text-sm font-bold text-gray-900">{order.clientName}</h4>
                                                            <p className="text-[10px] mt-1 text-gray-500">Order: {order.orderNo} | {order.itemName}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {selectedRows[realIdx] && (
                                                    <div className="grid grid-cols-2 gap-3 bg-red-50/50 p-3 rounded-lg border border-red-100">
                                                        <div className="col-span-2">
                                                            <label className="block text-[10px] font-bold text-red-800 mb-1 uppercase">Dispatch Date</label>
                                                            <input
                                                                type="date"
                                                                value={editData[realIdx]?.dispatchDate || ''}
                                                                onChange={(e) => handleEditChange(realIdx, 'dispatchDate', e.target.value)}
                                                                className="w-full px-3 py-1.5 border border-red-200 rounded text-xs outline-none focus:border-red-800 bg-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-red-800 mb-1 uppercase">Disp Qty</label>
                                                            <input
                                                                type="number"
                                                                value={editData[realIdx]?.dispatchQty || ''}
                                                                onChange={(e) => handleEditChange(realIdx, 'dispatchQty', e.target.value)}
                                                                className="w-full px-3 py-1.5 border border-red-200 rounded text-xs outline-none focus:border-red-800 bg-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-red-800 mb-1 uppercase">GST</label>
                                                            <select
                                                                value={editData[realIdx]?.gstIncluded || ''}
                                                                onChange={(e) => handleEditChange(realIdx, 'gstIncluded', e.target.value)}
                                                                className="w-full px-3 py-1.5 border border-red-200 rounded text-xs outline-none focus:border-red-800 bg-white"
                                                            >
                                                                <option value="Yes">Yes</option>
                                                                <option value="No">No</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <label className="block text-[10px] font-bold text-red-800 mb-1 uppercase">Godown Name</label>
                                                            <select
                                                                value={editData[realIdx]?.godownName || order.godownName}
                                                                onChange={(e) => handleEditChange(realIdx, 'godownName', e.target.value)}
                                                                className="w-full px-3 py-1.5 border border-red-200 rounded text-xs outline-none focus:border-red-800 bg-white"
                                                            >
                                                                {[...new Set([...godowns, order.godownName])].map(g => (
                                                                    <option key={g} value={g}>{g}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-4 gap-2 text-[10px] text-gray-500 pt-2 border-t border-gray-50">
                                                    <div>
                                                        <p className="uppercase text-[8px] font-bold text-gray-400">Rate</p>
                                                        <p className="font-bold text-gray-700">{order.rate}</p>
                                                    </div>
                                                    <div>
                                                        <p className="uppercase text-[8px] font-bold text-gray-400">Order Qty</p>
                                                        <p className="font-bold text-red-800">{order.qty}</p>
                                                    </div>
                                                    <div>
                                                        <p className="uppercase text-[8px] font-bold text-gray-400">Godown</p>
                                                        <p className="font-bold text-gray-700 truncate">{order.godownName}</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-1 rounded border border-gray-100">
                                                        <p className="uppercase text-[8px] font-bold text-gray-400">Stock</p>
                                                        <p className="font-bold text-gray-700 leading-tight">{order.currentStock || '-'}</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-1 rounded border border-gray-100">
                                                        <p className="uppercase text-[8px] font-bold text-gray-400">Intransit</p>
                                                        <p className="font-bold text-gray-700">{order.intransitQty || '0'}</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-1 rounded border border-gray-100">
                                                        <p className="uppercase text-[8px] font-bold text-gray-400">Plan Qty</p>
                                                        <p className="font-bold text-gray-700">{order.planningQty || '0'}</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-1 rounded border border-gray-100">
                                                        <p className="uppercase text-[8px] font-bold text-gray-400">Plan Pend</p>
                                                        <p className="font-bold text-gray-700">{order.remPlanningQty || '0'}</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-1 rounded border border-gray-100">
                                                        <p className="uppercase text-[8px] font-bold text-gray-400">Delivered</p>
                                                        <p className="font-bold text-gray-700">{order.qtyDelivered || '0'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
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

// Custom Animations for professional feel
const style = document.createElement('style');
style.textContent = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(-360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
`;
document.head.appendChild(style);
