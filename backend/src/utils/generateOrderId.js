const generateOrderId = (prefix = 'SAV-IND-') => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}${randomNum}`;
};

const generateTransactionId = (method = 'UPI') => {
    const randomNum = Math.floor(1000000000 + Math.random() * 9000000000);
    return `${method}-TXN-${randomNum}`;
};

module.exports = {
    generateOrderId,
    generateTransactionId
};
