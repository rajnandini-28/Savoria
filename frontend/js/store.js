/**
 * SAVORIA — Centralized Reactive State Store (Redux / Context Architecture)
 * Manages: User, Cart, Wishlist, Address, Order, Payment
 */

// Initial State with LocalStorage Hydration
const initialState = {
    user: {
        currentUser: JSON.parse(localStorage.getItem('savoria_current_user') || 'null'),
        token: localStorage.getItem('savoria_jwt_token') || null,
        isAuthenticated: !!localStorage.getItem('savoria_jwt_token'),
        loading: false,
        error: null
    },
    cart: {
        items: JSON.parse(localStorage.getItem('savoria_cart') || '[]'),
        coupon: JSON.parse(localStorage.getItem('savoria_applied_coupon') || 'null'),
        tipPercent: Number(localStorage.getItem('savoria_tip_percent') || '10'),
        subtotal: 0,
        discount: 0,
        tax: 0,
        tipAmount: 0,
        total: 0
    },
    wishlist: {
        items: JSON.parse(localStorage.getItem('savoria_wishlist') || '["galouti-kebab", "awadhi-nalli-nihari", "kesar-shahi-tukda"]')
    },
    address: {
        addresses: JSON.parse(localStorage.getItem('savoria_addresses') || '[]'),
        selectedAddressId: localStorage.getItem('savoria_selected_address_id') || null
    },
    order: {
        activeOrder: JSON.parse(localStorage.getItem('savoria_latest_order') || 'null'),
        pendingOrder: JSON.parse(localStorage.getItem('savoria_pending_order') || 'null'),
        orderHistory: JSON.parse(localStorage.getItem('savoria_all_orders') || '[]')
    },
    payment: {
        selectedMethod: 'upi',
        transactionStatus: 'idle',
        lastTransaction: null
    }
};

// Global Store State
let state = { ...initialState };
const listeners = new Set();

// Re-calculate Cart Financials helper
function recalculateCartFinancials(cartState) {
    const subtotal = cartState.items.reduce((sum, item) => sum + (Number(item.price) * (Number(item.quantity) || 1)), 0);
    let discount = 0;

    if (cartState.coupon) {
        if (cartState.coupon.discountPercent) {
            discount = subtotal * (cartState.coupon.discountPercent / 100);
            if (cartState.coupon.maxDiscount && discount > cartState.coupon.maxDiscount) {
                discount = cartState.coupon.maxDiscount;
            }
        } else if (cartState.coupon.discountFixed) {
            discount = Math.min(subtotal, cartState.coupon.discountFixed);
        }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const tax = Math.round(discountedSubtotal * 0.05); // 5% GST
    const tipAmount = Math.round(discountedSubtotal * (cartState.tipPercent / 100));
    const total = Math.round(discountedSubtotal + tax + tipAmount);

    return {
        ...cartState,
        subtotal: Math.round(subtotal),
        discount: Math.round(discount),
        tax,
        tipAmount,
        total
    };
}

state.cart = recalculateCartFinancials(state.cart);

// Reducer Function
function rootReducer(currentState, action) {
    switch (action.type) {
        // --- USER ACTIONS ---
        case 'USER_LOGIN_SUCCESS':
            localStorage.setItem('savoria_current_user', JSON.stringify(action.payload.user));
            if (action.payload.token) localStorage.setItem('savoria_jwt_token', action.payload.token);
            return {
                ...currentState,
                user: {
                    ...currentState.user,
                    currentUser: action.payload.user,
                    token: action.payload.token || currentState.user.token,
                    isAuthenticated: true,
                    loading: false,
                    error: null
                }
            };

        case 'USER_LOGOUT':
            localStorage.removeItem('savoria_current_user');
            localStorage.removeItem('savoria_jwt_token');
            return {
                ...currentState,
                user: {
                    currentUser: null,
                    token: null,
                    isAuthenticated: false,
                    loading: false,
                    error: null
                }
            };

        case 'USER_UPDATE_PROFILE':
            const updatedUser = { ...currentState.user.currentUser, ...action.payload };
            localStorage.setItem('savoria_current_user', JSON.stringify(updatedUser));
            return {
                ...currentState,
                user: { ...currentState.user, currentUser: updatedUser }
            };

        // --- CART ACTIONS ---
        case 'CART_ADD_ITEM': {
            const item = action.payload;
            const items = [...currentState.cart.items];
            const existing = items.find(i => i.id === item.id);
            if (existing) {
                existing.quantity += Number(item.quantity || 1);
            } else {
                items.push({
                    id: item.id,
                    title: item.title,
                    price: Number(item.price || item.rawPrice || 0),
                    image: item.image || '',
                    quantity: Number(item.quantity || 1)
                });
            }
            localStorage.setItem('savoria_cart', JSON.stringify(items));
            const newCart = recalculateCartFinancials({ ...currentState.cart, items });
            return { ...currentState, cart: newCart };
        }

        case 'CART_UPDATE_QTY': {
            const { id, delta, quantity } = action.payload;
            let items = [...currentState.cart.items];
            const item = items.find(i => i.id === id);
            if (item) {
                if (quantity !== undefined) item.quantity = Number(quantity);
                if (delta !== undefined) item.quantity += Number(delta);
                if (item.quantity <= 0) items = items.filter(i => i.id !== id);
            }
            localStorage.setItem('savoria_cart', JSON.stringify(items));
            const newCart = recalculateCartFinancials({ ...currentState.cart, items });
            return { ...currentState, cart: newCart };
        }

        case 'CART_REMOVE_ITEM': {
            const items = currentState.cart.items.filter(i => i.id !== action.payload.id);
            localStorage.setItem('savoria_cart', JSON.stringify(items));
            const newCart = recalculateCartFinancials({ ...currentState.cart, items });
            return { ...currentState, cart: newCart };
        }

        case 'CART_CLEAR': {
            localStorage.removeItem('savoria_cart');
            localStorage.removeItem('savoria_applied_coupon');
            const newCart = recalculateCartFinancials({ ...currentState.cart, items: [], coupon: null });
            return { ...currentState, cart: newCart };
        }

        case 'CART_APPLY_COUPON': {
            localStorage.setItem('savoria_applied_coupon', JSON.stringify(action.payload));
            const newCart = recalculateCartFinancials({ ...currentState.cart, coupon: action.payload });
            return { ...currentState, cart: newCart };
        }

        case 'CART_REMOVE_COUPON': {
            localStorage.removeItem('savoria_applied_coupon');
            const newCart = recalculateCartFinancials({ ...currentState.cart, coupon: null });
            return { ...currentState, cart: newCart };
        }

        case 'CART_SET_TIP': {
            localStorage.setItem('savoria_tip_percent', String(action.payload));
            const newCart = recalculateCartFinancials({ ...currentState.cart, tipPercent: Number(action.payload) });
            return { ...currentState, cart: newCart };
        }

        // --- WISHLIST ACTIONS ---
        case 'WISHLIST_TOGGLE': {
            const dishId = action.payload;
            let items = [...currentState.wishlist.items];
            if (items.includes(dishId)) {
                items = items.filter(id => id !== dishId);
            } else {
                items.push(dishId);
            }
            localStorage.setItem('savoria_wishlist', JSON.stringify(items));
            return { ...currentState, wishlist: { items } };
        }

        // --- ADDRESS ACTIONS ---
        case 'ADDRESS_ADD': {
            const addresses = [...currentState.address.addresses, action.payload];
            localStorage.setItem('savoria_addresses', JSON.stringify(addresses));
            return { ...currentState, address: { ...currentState.address, addresses } };
        }

        case 'ADDRESS_SELECT': {
            localStorage.setItem('savoria_selected_address_id', action.payload);
            return { ...currentState, address: { ...currentState.address, selectedAddressId: action.payload } };
        }

        // --- ORDER ACTIONS ---
        case 'ORDER_SET_PENDING': {
            localStorage.setItem('savoria_pending_order', JSON.stringify(action.payload));
            return { ...currentState, order: { ...currentState.order, pendingOrder: action.payload } };
        }

        case 'ORDER_FINALIZE': {
            const order = action.payload;
            localStorage.setItem('savoria_latest_order', JSON.stringify(order));
            localStorage.removeItem('savoria_pending_order');
            const orderHistory = [order, ...currentState.order.orderHistory];
            localStorage.setItem('savoria_all_orders', JSON.stringify(orderHistory));
            return {
                ...currentState,
                order: { ...currentState.order, activeOrder: order, pendingOrder: null, orderHistory }
            };
        }

        // --- PAYMENT ACTIONS ---
        case 'PAYMENT_SET_METHOD': {
            return { ...currentState, payment: { ...currentState.payment, selectedMethod: action.payload } };
        }

        default:
            return currentState;
    }
}

// Store API
const store = {
    getState: () => state,
    dispatch: (action) => {
        state = rootReducer(state, action);
        listeners.forEach(fn => fn(state, action));
    },
    subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }
};

window.SavoriaStore = store;
