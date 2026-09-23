const { getLocalDB, saveLocalDB } = require('../config/db');

const getAvailableStaff = () => {
    const db = getLocalDB();
    return (db.deliveryStaff || []).filter(s => s.status === 'available');
};

const assignOrderToStaff = (staffId, orderRef) => {
    const db = getLocalDB();
    if (!db.deliveryStaff) return null;

    const staff = db.deliveryStaff.find(s => s.id === staffId);
    if (staff) {
        staff.status = 'on-trip';
        staff.activeOrders = (staff.activeOrders || 0) + 1;
        saveLocalDB(db);
    }
    return staff;
};

module.exports = {
    getAvailableStaff,
    assignOrderToStaff
};
