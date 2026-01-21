export const seedDummyData = () => {
    const clients = ['Alpha Corp', 'Beta Industries', 'Gamma Logistics', 'Delta Traders', 'Omega Solutions', 'Prime Exports', 'Summit Trading', 'Global Hub'];
    const godowns = ['Godown North', 'Godown South', 'Central Hub', 'Port Warehouse', 'East Depot', 'West Storage'];
    const itemNames = ['Raw Iron', 'Steel Sheets', 'Copper Tubing', 'Aluminum Foil', 'Brass Fittings', 'Wire Mesh', 'Pipes', 'Valves'];

    let orders = [];
    let dispatchHistory = [];

    const generateDate = (daysAgo) => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString().split('T')[0];
    };

    let gSN = 1;
    let gON = 1;
    let gDN = 1;

    const padSN = (n) => `SN-${String(n).padStart(3, '0')}`;
    const padON = (n) => `ON-${String(n).padStart(3, '0')}`;
    const padDN = (n) => `DN-${String(n).padStart(3, '0')}`;

    // STAGE 1: Pending Planning (50 Rows) - Shows in Order page and Disp Plan Pending
    for (let i = 0; i < 50; i++) {
        orders.push({
            serialNo: padSN(gSN++),
            orderNo: padON(gON++),
            clientName: clients[i % clients.length],
            godownName: godowns[i % godowns.length],
            orderDate: generateDate(Math.floor(Math.random() * 5)),
            itemName: itemNames[i % itemNames.length],
            rate: (Math.random() * 500 + 100).toFixed(2),
            qty: Math.floor(Math.random() * 800) + 100,
            planned: false
        });
    }

    // STAGE 2: Pending Notification (50 Rows) - Shows in Notify Party Pending
    for (let i = 0; i < 50; i++) {
        const qty = Math.floor(Math.random() * 800) + 100;
        const entry = {
            serialNo: padSN(gSN++),
            orderNo: padON(gON++),
            dispatchNo: padDN(gDN++),
            clientName: clients[i % clients.length],
            godownName: godowns[i % godowns.length],
            orderDate: generateDate(15 + i),
            itemName: itemNames[i % itemNames.length],
            rate: (Math.random() * 500 + 100).toFixed(2),
            qty: qty,
            dispatchQty: qty,
            dispatchDate: generateDate(10 + i),
            gstIncluded: 'Yes',
            planned: true,
            notified: false,
            completeStageComplete: false,
            postNotified: false
        };
        orders.push({ ...entry });
        dispatchHistory.push(entry);
    }

    // STAGE 3: Pending Completion (50 Rows) - Shows in Disp Done Pending
    for (let i = 0; i < 50; i++) {
        const qty = Math.floor(Math.random() * 800) + 100;
        const entry = {
            serialNo: padSN(gSN++),
            orderNo: padON(gON++),
            dispatchNo: padDN(gDN++),
            clientName: clients[i % clients.length],
            godownName: godowns[i % godowns.length],
            orderDate: generateDate(30 + i),
            itemName: itemNames[i % itemNames.length],
            rate: (Math.random() * 500 + 100).toFixed(2),
            qty: qty,
            dispatchQty: qty,
            dispatchDate: generateDate(20 + i),
            gstIncluded: 'Yes',
            planned: true,
            notified: true,
            completeStageComplete: false,
            status: 'Pending',
            postNotified: false
        };
        orders.push({ ...entry });
        dispatchHistory.push(entry);
    }

    // STAGE 4: Pending Post-Notification (50 Rows) - Shows in Post-Disp Notify Pending
    for (let i = 0; i < 50; i++) {
        const qty = Math.floor(Math.random() * 800) + 100;
        const entry = {
            serialNo: padSN(gSN++),
            orderNo: padON(gON++),
            dispatchNo: padDN(gDN++),
            clientName: clients[i % clients.length],
            godownName: godowns[i % godowns.length],
            orderDate: generateDate(45 + i),
            itemName: itemNames[i % itemNames.length],
            rate: (Math.random() * 500 + 100).toFixed(2),
            qty: qty,
            dispatchQty: qty,
            dispatchDate: generateDate(35 + i),
            gstIncluded: 'Yes',
            planned: true,
            notified: true,
            completeStageComplete: true,
            status: 'Complete',
            completeDate: generateDate(25 + i),
            postNotified: false
        };
        orders.push({ ...entry });
        dispatchHistory.push(entry);
    }

    // STAGE 5: History (50 Rows) - Shows in History sections
    for (let i = 0; i < 50; i++) {
        const qty = Math.floor(Math.random() * 800) + 100;
        const entry = {
            serialNo: padSN(gSN++),
            orderNo: padON(gON++),
            dispatchNo: padDN(gDN++),
            clientName: clients[i % clients.length],
            godownName: godowns[i % godowns.length],
            orderDate: generateDate(60 + i),
            itemName: itemNames[i % itemNames.length],
            rate: (Math.random() * 500 + 100).toFixed(2),
            qty: qty,
            dispatchQty: qty,
            dispatchDate: generateDate(50 + i),
            gstIncluded: 'Yes',
            planned: true,
            notified: true,
            completeStageComplete: true,
            status: 'Complete',
            completeDate: generateDate(40 + i),
            postNotified: true
        };
        orders.push({ ...entry });
        dispatchHistory.push(entry);
    }

    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('dispatchHistory', JSON.stringify(dispatchHistory));

    return { totalOrders: orders.length, historyCount: dispatchHistory.length };
};
