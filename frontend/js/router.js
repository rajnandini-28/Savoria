/**
 * SAVORIA — Enterprise Client-Side SPA Router & View Engine
 * Supports:
 * - Customer Routes (/menu, /search, /category/:slug, /food/:id, /cart, /checkout, /orders, /profile...)
 * - Admin Routes (/admin, /admin/orders, /admin/menu, /admin/coupons, /admin/customers, /admin/settings...)
 */

(function () {
    const routes = [
        // Customer Routes
        { path: '/', handler: renderHomeView },
        { path: '/menu', handler: renderMenuView },
        { path: '/search', handler: renderSearchView },
        { path: '/category/:slug', handler: renderCategoryView },
        { path: '/food/:id', handler: renderFoodView },
        { path: '/dish/:id', handler: renderFoodView },
        { path: '/cart', handler: renderCartView },
        { path: '/tray', handler: renderCartView },
        { path: '/login', handler: () => renderAuthView('login') },
        { path: '/register', handler: () => renderAuthView('register') },
        { path: '/forgot-password', handler: () => renderAuthView('forgot') },
        { path: '/checkout', handler: renderCheckoutView },
        { path: '/payment', handler: renderPaymentView },
        { path: '/order-success/:id', handler: renderOrderSuccessView },
        { path: '/orders', handler: renderOrdersListView },
        { path: '/orders/:id', handler: renderOrderDetailsView },
        { path: '/profile', handler: () => renderProfileView('info') },
        { path: '/profile/addresses', handler: () => renderProfileView('addresses') },
        { path: '/profile/wishlist', handler: () => renderProfileView('wishlist') },
        { path: '/profile/reviews', handler: () => renderProfileView('reviews') },
        { path: '/about', handler: renderAboutView },

        // Admin Suite Routes
        { path: '/admin/login', handler: () => renderAdminView('login') },
        { path: '/admin', handler: () => renderAdminView('dashboard') },
        { path: '/admin/orders', handler: () => renderAdminView('orders') },
        { path: '/admin/orders/:id', handler: (params) => renderAdminView('order-details', params) },
        { path: '/admin/menu', handler: () => renderAdminView('menu') },
        { path: '/admin/menu/add', handler: () => renderAdminView('menu-add') },
        { path: '/admin/menu/:id/edit', handler: (params) => renderAdminView('menu-edit', params) },
        { path: '/admin/categories', handler: () => renderAdminView('categories') },
        { path: '/admin/customers', handler: () => renderAdminView('customers') },
        { path: '/admin/delivery', handler: () => renderAdminView('delivery') },
        { path: '/admin/coupons', handler: () => renderAdminView('coupons') },
        { path: '/admin/reviews', handler: () => renderAdminView('reviews') },
        { path: '/admin/payments', handler: () => renderAdminView('payments') },
        { path: '/admin/reports', handler: () => renderAdminView('reports') },
        { path: '/admin/settings', handler: () => renderAdminView('settings') }
    ];

    function matchRoute(currentPath) {
        // Strip trailing slash and query params
        const cleanPath = currentPath.split('?')[0].replace(/\/$/, '') || '/';

        for (const route of routes) {
            const routeParts = route.path.split('/');
            const pathParts = cleanPath.split('/');

            if (routeParts.length !== pathParts.length) continue;

            let matches = true;
            const params = {};

            for (let i = 0; i < routeParts.length; i++) {
                if (routeParts[i].startsWith(':')) {
                    const paramName = routeParts[i].slice(1);
                    params[paramName] = pathParts[i];
                } else if (routeParts[i] !== pathParts[i]) {
                    matches = false;
                    break;
                }
            }

            if (matches) {
                return { handler: route.handler, params, path: route.path };
            }
        }

        // Fallback to Home
        return { handler: renderHomeView, params: {}, path: '/' };
    }

    function navigateTo(url, e) {
        if (e) {
            e.preventDefault();
        }
        window.history.pushState(null, '', url);
        handleLocationChange();
    }

    function handleLocationChange() {
        const path = window.location.pathname;

        // Check if on a dedicated HTML page or root
        if (path.endsWith('.html') && !path.endsWith('index.html')) {
            // Keep native multi-page if directly loading specific .html
            return;
        }

        const match = matchRoute(path);
        if (match && typeof match.handler === 'function') {
            match.handler(match.params);
            window.scrollTo(0, 0);
        }
    }

    // Intercept internal links with data-link
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-link]');
        if (link) {
            e.preventDefault();
            navigateTo(link.getAttribute('href'));
        }
    });

    window.addEventListener('popstate', handleLocationChange);
    window.SavoriaRouter = {
        navigateTo,
        handleLocationChange
    };
})();

/* ==========================================================================
   VIEW RENDERERS
   ========================================================================== */

function renderHomeView() {
    // Show normal landing home sections
    const mainApp = document.getElementById('mainContentArea');
    const heroSection = document.getElementById('hero');
    if (heroSection) heroSection.style.display = 'block';
    const dynContainer = document.getElementById('dynamicRouteContainer');
    if (dynContainer) dynContainer.style.display = 'none';
}

function renderMenuView() {
    renderHomeView();
    const menuEl = document.getElementById('menu');
    if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
}

function renderSearchView() {
    renderHomeView();
    const searchInput = document.getElementById('menuSearchInput');
    const menuEl = document.getElementById('menu');
    if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
    if (searchInput) {
        searchInput.focus();
        showToast('Type any dish, ingredient, or spice to filter live', 'info');
    }
}

function renderCategoryView(params) {
    const slug = params.slug;
    renderHomeView();
    const catBtn = document.querySelector(`.category-btn[data-category="${slug}"]`);
    if (catBtn) catBtn.click();
    const menuEl = document.getElementById('menu');
    if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
}

function renderFoodView(params) {
    window.location.href = `dish.html?id=${encodeURIComponent(params.id)}`;
}

function renderCartView() {
    window.location.href = 'tray.html';
}

function renderAuthView(tab = 'login') {
    window.location.href = `auth.html?tab=${tab}`;
}

function renderCheckoutView() {
    window.location.href = 'tray.html#checkout';
}

function renderPaymentView() {
    window.location.href = 'payment.html';
}

function renderOrderSuccessView(params) {
    window.location.href = `order-confirm.html?orderRef=${encodeURIComponent(params.id)}`;
}

function renderOrdersListView() {
    window.location.href = 'admin.html#orders';
}

function renderOrderDetailsView(params) {
    window.location.href = `order-confirm.html?orderRef=${encodeURIComponent(params.id)}`;
}

function renderProfileView(section = 'info') {
    window.location.href = `auth.html#${section}`;
}

function renderAboutView() {
    renderHomeView();
    const aboutEl = document.getElementById('about');
    if (aboutEl) aboutEl.scrollIntoView({ behavior: 'smooth' });
}

function renderAdminView(section = 'dashboard', params = {}) {
    window.location.href = `admin.html#${section}${params.id ? '?id=' + params.id : ''}`;
}
