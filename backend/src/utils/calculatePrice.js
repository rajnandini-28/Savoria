const GST_RATE = 0.05; // 5% Indian Restaurant GST

/**
 * Calculates complete order financials
 * @param {Array} items - Array of { price, quantity }
 * @param {Number} tipPercent - Tip percentage (e.g. 10, 12, 15)
 * @param {Object} coupon - { discountPercent, discountFixed, maxDiscount }
 */
const calculateOrderPrice = (items = [], tipPercent = 10, coupon = null) => {
    const subtotal = items.reduce((sum, item) => {
        const itemPrice = Number(item.price) || 0;
        const qty = Number(item.quantity) || 1;
        return sum + (itemPrice * qty);
    }, 0);

    let discount = 0;
    if (coupon) {
        if (coupon.discountPercent) {
            discount = subtotal * (coupon.discountPercent / 100);
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else if (coupon.discountFixed) {
            discount = Math.min(subtotal, coupon.discountFixed);
        }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const gst = Math.round(discountedSubtotal * GST_RATE);
    const tipAmount = Math.round(discountedSubtotal * (Number(tipPercent) / 100));
    const total = Math.round(discountedSubtotal + gst + tipAmount);

    return {
        subtotal: Math.round(subtotal),
        discount: Math.round(discount),
        discountedSubtotal: Math.round(discountedSubtotal),
        gstRate: GST_RATE,
        gst: gst,
        tipPercent: Number(tipPercent),
        tipAmount: tipAmount,
        total: total
    };
};

module.exports = {
    calculateOrderPrice,
    GST_RATE
};
