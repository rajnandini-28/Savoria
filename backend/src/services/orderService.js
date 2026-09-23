const { getLocalDB, saveLocalDB } = require('../config/db');
const { generateOrderId } = require('../utils/generateOrderId');
const { calculateOrderPrice } = require('../utils/calculatePrice');
const { sendOrderNotification } = require('./notificationService');

let Order;
try { Order = require('../models/Order'); } catch (e) {}

const createNewOrder = async (orderPayload) => {
    const orderRef = orderPayload.orderRef || generateOrderId();
    const items = orderPayload.items || [];
    const tipPercent = orderPayload.tipPercent || 10;
    const coupon = orderPayload.coupon || null;

    const financials = calculateOrderPrice(items, tipPercent, coupon);

    const fullOrder = {
        orderRef,
        userId: orderPayload.userId || null,
        customerName: orderPayload.customerName || orderPayload.guest?.name || 'Maharaja Guest',
        email: orderPayload.email || orderPayload.guest?.email || 'guest@savoria.in',
        phone: orderPayload.phone || orderPayload.guest?.phone || '+91 98101 23456',
        orderType: orderPayload.orderType || 'pickup',
        orderTypeLabel: orderPayload.orderTypeLabel || (orderPayload.orderType === 'delivery' ? 'Royal White-Glove Chauffeur Delivery' : 'Private Curbside Valet Pickup'),
        deliveryAddress: orderPayload.deliveryAddress || orderPayload.guest?.address || '450 Heritage Marg, New Delhi',
        tableNumber: orderPayload.tableNumber || '',
        prepTime: orderPayload.prepTime || 'As soon as prepared fresh (~35 min)',
        specialInstructions: orderPayload.specialInstructions || '',
        items: items,
        financials: orderPayload.financials || financials,
        payment: orderPayload.payment || {
            method: orderPayload.paymentMethod || 'UPI Instant Pay',
            status: 'Authorized & Secured',
            transactionId: orderPayload.transactionId || ('TXN-' + Date.now())
        },
        status: 'Received',
        assignedStaff: 'Ustad Imran Qureshi (Master Chef)',
        createdAt: new Date().toISOString()
    };

    // Save in MongoDB or Local DB
    try {
        if (Order) {
            await Order.create(fullOrder);
        }
    } catch (e) {
        // Fallback to local DB
        const db = getLocalDB();
        if (!db.orders) db.orders = [];
        db.orders.unshift(fullOrder);
        saveLocalDB(db);
    }

    // Trigger asynchronous notification dispatch
    sendOrderNotification(fullOrder).catch(err => console.warn('Notification notice:', err.message));

    return fullOrder;
};

const updateOrderStatus = async (orderIdOrRef, newStatus) => {
    let updated = null;
    try {
        if (Order) {
            updated = await Order.findOneAndUpdate(
                { $or: [{ _id: orderIdOrRef }, { orderRef: orderIdOrRef }] },
                { status: newStatus },
                { new: true }
            );
        }
    } catch (e) {}

    const db = getLocalDB();
    if (db.orders) {
        const orderIdx = db.orders.findIndex(o => o.orderRef === orderIdOrRef || o._id === orderIdOrRef);
        if (orderIdx > -1) {
            db.orders[orderIdx].status = newStatus;
            saveLocalDB(db);
            updated = db.orders[orderIdx];
        }
    }

    return updated;
};

module.exports = {
    createNewOrder,
    updateOrderStatus
};
