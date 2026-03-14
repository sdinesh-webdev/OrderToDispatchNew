import React, { useState, useEffect } from 'react';
import { Plus, X, Save } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import SearchableDropdown from '../../components/SearchableDropdown';

const Order = () => {
    const { showToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        orderDate: new Date().toISOString().split('T')[0],
        clientName: '',
        godownName: '',
        items: [{ itemName: '', rate: '', qty: '' }]
    });

    const [itemNames, setItemNames] = useState([]);
    const [clients, setClients] = useState([]);
    const [godowns, setGodowns] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [clientFilter, setClientFilter] = useState('');
    const [godownFilter, setGodownFilter] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

    // 🔍 Debug: log orders whenever they change
    useEffect(() => {
        console.log('[Order] Current orders state:', orders);
    }, [orders]);

    // Professional Date Formatter (e.g., 25-Feb-2026)
    const formatDisplayDate = (dateStr) => {
        if (!dateStr || dateStr === '-') return '-';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            const day = date.getDate().toString().padStart(2, '0');
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = months[date.getMonth()];
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        } catch (e) {
            return dateStr;
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchClients();
        fetchGodowns();
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setIsLoadingOrders(true);
            const ORDER_URL = import.meta.env.VITE_SHEET_orderToDispatch_URL;
            const SHEET_ID = import.meta.env.VITE_orderToDispatch_SHEET_ID;

            if (!ORDER_URL) {
                showToast('Error', 'ORDER_URL is not configured');
                return;
            }

            const url = new URL(ORDER_URL);
            url.searchParams.set('sheet', 'ORDER');
            url.searchParams.set('mode', 'table');
            if (SHEET_ID) url.searchParams.set('sheetId', SHEET_ID);

            console.log('[Order] Fetching from:', url.toString());

            const response = await fetch(url.toString(), { redirect: 'follow' });
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            }

            const text = await response.text();
            console.log('[Order] Raw API response:', text);

            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error('[Order] Failed to parse JSON:', text);
                showToast('Error', 'Invalid response from server');
                return;
            }

            let dataArray = null;
            if (Array.isArray(result)) {
                dataArray = result;
            } else if (result.success && Array.isArray(result.data)) {
                dataArray = result.data;
            } else if (result.data && Array.isArray(result.data)) {
                dataArray = result.data;
            } else if (result.rows && Array.isArray(result.rows)) {
                dataArray = result.rows;
            }

            if (!dataArray || dataArray.length === 0) {
                console.warn('[Order] No data found or unexpected format');
                setOrders([]);
                return;
            }

            // Helper to get value from object regardless of key casing/spaces
            const getVal = (obj, ...possibleKeys) => {
                const keys = Object.keys(obj);
                for (const pKey of possibleKeys) {
                    if (obj[pKey] !== undefined) return obj[pKey];
                    const normalizedPKey = pKey.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const foundKey = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedPKey);
                    if (foundKey) return obj[foundKey];
                }
                return undefined;
            };

            const mappedOrders = dataArray
                .filter((item, idx) => {
                    // Skip header row if it looks like headers
                    if (idx === 0 && Array.isArray(item)) {
                        const firstCell = String(item[0]).toLowerCase();
                        if (firstCell.includes('date') || firstCell.includes('timestamp') || firstCell.includes('order')) return false;
                    }
                    return true;
                })
                .map(item => {
                    if (Array.isArray(item)) {
                        return {
                            orderNumber: item[2] || '-',
                            orderDate: item[1] || '-',
                            clientName: item[3] || '-',
                            godownName: item[4] || '-',
                            itemName: item[5] || '-',
                            qty: item[6] || '0',
                            rate: item[7] || '0',
                            currentStock: item[8] || '-',
                            intransitQty: item[9] || '-'
                        };
                    } else {
                        return {
                            orderNumber: getVal(item, 'orderNumber', 'orderNo', 'Order No', 'Order Number') || '-',
                            orderDate: getVal(item, 'orderDate', 'Date', 'Order Date') || '-',
                            clientName: getVal(item, 'clientName', 'customer', 'Customer Name', 'Client Name') || '-',
                            godownName: getVal(item, 'godownName', 'godown', 'Godown Name') || '-',
                            itemName: getVal(item, 'itemName', 'product', 'Product Name', 'Item Name') || '-',
                            qty: getVal(item, 'qty', 'orderQty', 'Order Qty', 'Quantity') || '0',
                            rate: getVal(item, 'rate', 'Rate') || '0',
                            currentStock: getVal(item, 'currentStock', 'Stock', 'Current Stock') || '-',
                            intransitQty: getVal(item, 'intransitQty', 'In Transit', 'Intransit Qty') || '-'
                        };
                    }
                });

            console.log('[Order] Final mapped orders:', mappedOrders);
            setOrders(mappedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            showToast('Error', `Failed to load orders: ${error.message}`);
        } finally {
            setIsLoadingOrders(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const MASTER_URL = import.meta.env.VITE_MASTER_URL;
            if (!MASTER_URL) return;

            const response = await fetch(`${MASTER_URL}?sheet=Products`);
            const result = await response.json();

            if (result.success && result.data) {
                setItemNames(result.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchClients = async () => {
        try {
            const MASTER_URL = import.meta.env.VITE_MASTER_URL;
            if (!MASTER_URL) return;

            const response = await fetch(`${MASTER_URL}?sheet=Sales Vendor`);
            const result = await response.json();

            if (result.success && result.data) {
                setClients(result.data);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const fetchGodowns = async () => {
        try {
            const MASTER_URL = import.meta.env.VITE_MASTER_URL;
            if (!MASTER_URL) return;

            const response = await fetch(`${MASTER_URL}?sheet=Products&col=4`);
            const result = await response.json();

            if (result.success && result.data) {
                setGodowns(result.data);
            }
        } catch (error) {
            console.error('Error fetching godowns:', error);
        }
    };

    // Use master lists from sheets for filters
    const filterClients = [...clients].sort((a, b) => String(a).localeCompare(String(b), undefined, { sensitivity: 'base' }));
    const filterGodowns = [...godowns].sort((a, b) => String(a).localeCompare(String(b), undefined, { sensitivity: 'base' }));

    // 🔍 Filter logic – log to verify
    const filteredOrders = orders.filter(order => {
        const matchesSearch = Object.values(order).some(val =>
            val !== null && val !== undefined &&
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesClient = clientFilter === '' || order.clientName === clientFilter;
        const matchesGodown = godownFilter === '' || order.godownName === godownFilter;
        return matchesSearch && matchesClient && matchesGodown;
    });

    // 🔍 Log filtered orders
    useEffect(() => {
        console.log('[Order] Filtered orders:', filteredOrders);
        console.log('[Order] Filters:', { searchTerm, clientFilter, godownFilter });
    }, [filteredOrders, searchTerm, clientFilter, godownFilter]);

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { itemName: '', rate: '', qty: '' }]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            const ORDER_URL = import.meta.env.VITE_SHEET_orderToDispatch_URL;
            const SHEET_ID = import.meta.env.VITE_orderToDispatch_SHEET_ID;

            if (!ORDER_URL || !SHEET_ID) {
                showToast("Error", "Missing Sheet URL or ID in environment variables");
                setIsSubmitting(false);
                return;
            }

            const now = new Date().toISOString();

            const payload = {
                sheet: "ORDER",
                sheetId: SHEET_ID,
                rows: formData.items.map(item => ({
                    timestamp: now,
                    orderDate: formData.orderDate,
                    clientName: formData.clientName,
                    godownName: formData.godownName,
                    itemName: item.itemName,
                    rate: item.rate,
                    qty: item.qty
                }))
            };

            await fetch(ORDER_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });

            setShowSuccessOverlay(true);

            setFormData({
                orderDate: new Date().toISOString().split('T')[0],
                clientName: '',
                godownName: '',
                items: [{ itemName: '', rate: '', qty: '' }]
            });
            setIsModalOpen(false);

            setTimeout(() => {
                fetchOrders();
                setShowSuccessOverlay(false);
            }, 2500);

        } catch (error) {
            console.error('Submission error:', error);
            showToast("Error", "Failed to submit. Check console or network.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-3 sm:p-6 lg:p-8">
            {/* Header Row with Title, Filters, and Actions */}
            <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-xl font-bold text-gray-800 mr-auto">Orders</h1>

                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-40 lg:w-48 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent outline-none text-sm"
                />
                <SearchableDropdown
                    value={clientFilter}
                    onChange={setClientFilter}
                    options={filterClients}
                    allLabel="All Clients"
                    className="w-36 lg:w-44"
                />
                <SearchableDropdown
                    value={godownFilter}
                    onChange={setGodownFilter}
                    options={filterGodowns}
                    allLabel="All Godowns"
                    className="w-36 lg:w-44"
                />

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors font-bold text-sm shadow-md"
                >
                    <Plus size={18} />
                    Add Order
                </button>
            </div>

            {isLoadingOrders && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-gray-100">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full border-4 border-gray-100 border-t-red-800 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-8 w-8 rounded-full border-4 border-gray-100 border-b-red-800 animate-spin-slow"></div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-sm font-black text-gray-800 uppercase tracking-[0.2em]">Processing</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Retrieving Order Data</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Professional Success Overlay */}
            {showSuccessOverlay && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px] transition-all duration-300">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-gray-100 animate-fade-in-up">
                        <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center shadow-inner relative overflow-hidden">
                            <div className="absolute inset-0 border-4 border-green-100 rounded-full animate-ping opacity-20"></div>
                            <svg className="w-10 h-10 text-green-600 animate-[bounce_1.5s_ease-in-out_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-base font-black text-green-600 uppercase tracking-[0.2em] mb-1">Success</p>
                            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Order Saved Successfully</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Responsive Data List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Table View (Desktop) */}
                <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 max-h-[460px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-600 font-bold sticky top-0 z-10 shadow-sm">
                                <th className="px-4 py-3">Order Number</th>
                                <th className="px-4 py-3">Order Date</th>
                                <th className="px-4 py-3">Client Name</th>
                                <th className="px-4 py-3">Godown</th>
                                <th className="px-4 py-3">Item Name</th>
                                <th className="px-4 py-3">Rate</th>
                                <th className="px-4 py-3 text-right">Order Qty</th>
                                <th className="px-4 py-3">Current Stock</th>
                                <th className="px-4 py-3">Intransit Qty</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-sm">
                            {[...filteredOrders].reverse().map((order, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-red-800">{order.orderNumber}</td>
                                    <td className="px-4 py-3 text-gray-600 text-xs font-medium">{formatDisplayDate(order.orderDate)}</td>
                                    <td className="px-4 py-3 text-gray-800 font-semibold">{order.clientName}</td>
                                    <td className="px-4 py-3 text-gray-600">{order.godownName}</td>
                                    <td className="px-4 py-3 text-gray-600">{order.itemName}</td>
                                    <td className="px-4 py-3 text-gray-600 font-medium">₹{order.rate}</td>
                                    <td className="px-4 py-3 text-right text-red-800 font-black">{order.qty}</td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">{order.currentStock}</td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">{order.intransitQty}</td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && !isLoadingOrders && (
                                <tr>
                                    <td colSpan="9" className="px-4 py-8 text-center text-gray-500 italic">No orders found matching your filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Card View (Mobile) */}
                <div className="md:hidden divide-y divide-gray-200">
                    {[...filteredOrders].reverse().map((order, idx) => (
                        <div key={idx} className="p-4 space-y-3 bg-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 mt-0.5">{order.clientName}</h4>
                                </div>
                                <span className="px-2 py-0.5 bg-red-50 text-red-800 rounded text-[10px] font-bold uppercase ring-1 ring-red-100">
                                    {order.orderNumber}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-[11px]">
                                <div>
                                    <p className="text-gray-400 mb-0.5 uppercase text-[9px] font-bold tracking-wider">Godown</p>
                                    <p className="font-medium text-gray-700">{order.godownName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 mb-0.5 uppercase text-[9px] font-bold tracking-wider">Order Date</p>
                                    <p className="font-medium text-gray-700">{formatDisplayDate(order.orderDate)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 mb-0.5 uppercase text-[9px] font-bold tracking-wider">Item Details</p>
                                    <p className="font-bold text-gray-900">{order.itemName}</p>
                                </div>
                                <div className="flex gap-4">
                                    <div>
                                        <p className="text-gray-400 mb-0.5 uppercase text-[9px] font-bold tracking-wider">Rate</p>
                                        <p className="font-bold text-gray-900">₹{order.rate}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 mb-0.5 uppercase text-[9px] font-bold tracking-wider">Qty</p>
                                        <p className="font-bold text-red-800">{order.qty}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-gray-50 text-[10px]">
                                    <div>
                                        <p className="text-gray-400 mb-0.5 uppercase text-[8px] font-bold">Current Stock</p>
                                        <p className="font-medium text-gray-700">{order.currentStock}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 mb-0.5 uppercase text-[8px] font-bold">Intransit Qty</p>
                                        <p className="font-medium text-gray-700">{order.intransitQty}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredOrders.length === 0 && !isLoadingOrders && (
                        <div className="p-8 text-center text-gray-500 italic text-sm">No orders found matching your filters.</div>
                    )}
                </div>
            </div>

            {/* Modal (unchanged) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white sm:rounded-2xl shadow-2xl w-full h-full sm:h-[90vh] sm:max-w-4xl flex flex-col overflow-hidden">
                        {/* Fixed Header */}
                        <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0 z-30">
                            <h2 className="text-xl font-bold text-gray-900">Add New Order</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 transition-colors hover:bg-gray-100 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                            {/* Scrollable Content Area */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scrollbar-thin scrollbar-thumb-gray-200 bg-gray-50/30">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em]">Order Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.orderDate}
                                            onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-800 outline-none text-sm font-medium shadow-sm transition-all focus:border-red-800"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em]">Client Name</label>
                                        <SearchableDropdown
                                            value={formData.clientName}
                                            onChange={(val) => setFormData({ ...formData, clientName: val })}
                                            options={clients}
                                            placeholder="Select Client"
                                            showAll={false}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em]">Godown Name</label>
                                        <SearchableDropdown
                                            value={formData.godownName}
                                            onChange={(val) => setFormData({ ...formData, godownName: val })}
                                            options={godowns}
                                            placeholder="Select Godown"
                                            showAll={false}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-center pb-2 border-b-2 border-red-800/10">
                                        <h3 className="text-xs font-black text-red-800 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-800 animate-pulse" />
                                            Items Detail
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={handleAddItem}
                                            className="flex items-center gap-1.5 text-[10px] font-black text-red-800 hover:text-white hover:bg-red-800 transition-all px-4 py-1.5 rounded-full border-2 border-red-800 uppercase tracking-widest"
                                        >
                                            <Plus size={14} /> Add Item
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {formData.items.map((item, index) => (
                                            <div key={index} className="group relative flex flex-col gap-5 p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-red-900/5 transition-all duration-300 focus-within:z-40">
                                                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-end">
                                                    <div className="sm:col-span-6">
                                                        <label className="text-[9px] font-black text-gray-400 mb-1.5 uppercase tracking-widest block">Item Name</label>
                                                        <SearchableDropdown
                                                            value={item.itemName}
                                                            onChange={(val) => handleItemChange(index, 'itemName', val)}
                                                            options={itemNames}
                                                            placeholder="Select Item"
                                                            showAll={false}
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-3">
                                                        <label className="text-[9px] font-black text-gray-400 mb-1.5 uppercase tracking-widest block">Rate</label>
                                                        <input
                                                            type="number"
                                                            required
                                                            placeholder="0.00"
                                                            value={item.rate}
                                                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-800 focus:bg-white outline-none text-sm font-medium transition-all"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-3 flex gap-3 items-center">
                                                        <div className="flex-1">
                                                            <label className="text-[9px] font-black text-gray-400 mb-1.5 uppercase tracking-widest block">Qty</label>
                                                            <input
                                                                type="number"
                                                                required
                                                                placeholder="0"
                                                                value={item.qty}
                                                                onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-800 focus:bg-white outline-none text-sm font-bold text-red-800 transition-all"
                                                            />
                                                        </div>
                                                        {formData.items.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveItem(index)}
                                                                className="mt-5 p-2.5 text-red-500 hover:text-white transition-all bg-red-50 hover:bg-red-500 rounded-2xl shadow-inner group-hover:rotate-90 transition-transform duration-300"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Fixed Footer */}
                            <div className="p-4 sm:p-6 border-t border-gray-100 bg-white flex flex-col-reverse sm:flex-row justify-end gap-4 shrink-0 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-10 py-3 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl hover:bg-gray-50 hover:text-gray-600 hover:border-gray-200 transition-all font-black text-[11px] uppercase tracking-[0.2em]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`flex items-center justify-center gap-3 px-10 py-3 bg-red-800 text-white rounded-2xl hover:bg-red-900 transition-all font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-red-800/30 active:scale-95 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    {isSubmitting ? 'Saving...' : 'Save Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Order;

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
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(15px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .animate-fade-in-up {
    animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`;
document.head.appendChild(style);