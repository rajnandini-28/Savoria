const { getLocalDB, saveLocalDB } = require('../config/db');
let Product;
try { Product = require('../models/Product'); } catch (e) {}

const INITIAL_PRODUCTS = [
    {
        id: 'galouti-kebab',
        title: 'Kakori Galouti Kebab with Warqi Paratha',
        category: 'starters',
        categoryLabel: 'Shahi Starters & Kebabs',
        price: '₹950',
        rawPrice: 950,
        image: '/assets/dishes/galouti_kebab_1789900179801.jpg',
        description: 'Melt-in-mouth smoked pasture lamb pâté infused with 32 secret potli spices, rose water essence, served over flaky saffron warqi paratha.',
        dietary: ['chef-pick', 'non-veg'],
        pairing: 'Amrut Peated Single Malt Indian Whisky / Aged Barolo',
        chefNote: 'Crafted following the historic 18th-century recipe of the Nawabs of Awadh, ground seven times for velvety texture.',
        ingredients: ['Pasture Lamb Mince', 'Potli Garam Masala', 'Mahuva Wood Smoke', 'Rose Petal Extract', 'Kashmiri Zafran', 'Desi Ghee Warqi Paratha']
    },
    {
        id: 'truffle-paneer-tikka',
        title: 'Truffle Malai Paneer Tikka Angara',
        category: 'starters',
        categoryLabel: 'Shahi Starters & Kebabs',
        price: '₹750',
        rawPrice: 750,
        image: '/assets/dishes/paneer_tikka_1789900431782.jpg',
        description: 'Charcoal-grilled artisanal farm paneer marinated in hand-churned clotted malai, crushed green cardamom, black summer truffle paste, and edible 24K gold foil.',
        dietary: ['chef-pick', 'veg'],
        pairing: 'Chablis Premier Cru / Vintage Indian Chenin Blanc',
        chefNote: 'Infused with charcoal smoke table-side to capture the sensory drama of old royal campfires.',
        ingredients: ['Organic Cow Paneer', 'Fresh Malai', 'Black Truffle Oil', 'Green Cardamom', '24K Gold Leaf', 'Bhatinda Green Chillies']
    },
    {
        id: 'awadhi-nalli-nihari',
        title: 'Royal Awadhi Nalli Nihari',
        category: 'mains',
        categoryLabel: 'Royal Curries & Dum Handis',
        price: '₹1450',
        rawPrice: 1450,
        image: '/assets/dishes/awadhi_nalli_nihari_1789900162831.jpg',
        description: 'Slow-cooked prime shank of lamb simmered overnight in a velvety bone marrow gravy spiced with vetiver roots, star anise, and roghan josh oil.',
        dietary: ['chef-pick', 'non-veg'],
        pairing: 'Full-Bodied Syrah / Old Vine Zinfandel',
        chefNote: 'Simmered in sealed copper handis for 14 hours until the bone marrow melts seamlessly into the velvet gravy.',
        ingredients: ['Prime Lamb Shank', 'Bone Marrow Glaze', 'Vetiver Roots', 'Javitri Mace', 'Caramelized Onion Gravy', 'Cold-Pressed Mustard Oil']
    },
    {
        id: 'dal-savoria',
        title: 'Dal SAVORIA — 36-Hour Bukhara Clay Oven Black Lentils',
        category: 'mains',
        categoryLabel: 'Royal Curries & Dum Handis',
        price: '₹680',
        rawPrice: 680,
        image: '/assets/dishes/dal_savoria_1789900229435.jpg',
        description: 'Whole black urad lentils slow-simmered for 36 hours over glowing charcoal, finished with artisanal white butter, San Marzano tomato reduction, and sun-dried fenugreek.',
        dietary: ['veg'],
        pairing: 'Pinot Noir / Full-Bodied Chardonnay',
        chefNote: 'A culinary homage to traditional slow fire hearths, cooked gently across three sunrises and two sunsets.',
        ingredients: ['Black Urad Dal', 'San Marzano Tomato Reduction', 'Makhan Butter', 'Kasuri Methi', 'Kashmiri Degi Mirch', 'Ginger Silvers']
    },
    {
        id: 'dum-biryani',
        title: 'Dum Pukht Gosht Awadhi Biryani',
        category: 'biryani',
        categoryLabel: 'Awadhi & Dum Biryanis',
        price: '₹1250',
        rawPrice: 1250,
        image: '/assets/dishes/dum_biryani_1789900245311.jpg',
        description: 'Aged two-year extra long grain Dehradun basmati rice layered with tender braised baby goat, infused with Ittar-e-Gulab, kewra, and sealed with whole-wheat purdah.',
        dietary: ['chef-pick', 'non-veg'],
        pairing: 'Châteauneuf-du-Pape / Saffron Spiced Mint Raita',
        chefNote: 'The dough seal is sliced tableside, releasing clouds of saffron and rose water aromatic steam.',
        ingredients: ['Aged Dehradun Basmati Rice', 'Pasture Baby Goat Cuts', 'Pampore Kashmiri Zafran', 'Ittar-e-Gulab', 'Brown Onion Barista', 'Desi Ghee']
    },
    {
        id: 'zafran-sheermal',
        title: 'Shahi Zafrani Sheermal',
        category: 'breads',
        categoryLabel: 'Tandoori & Artisanal Breads',
        price: '₹320',
        rawPrice: 320,
        image: '/assets/dishes/zafran_sheermal.jpg',
        description: 'Traditional saffron-enriched sweet leavened milk bread baked in a mild charcoal tandoor, brushed with rose-infused cow ghee.',
        dietary: ['veg'],
        pairing: 'Accompanies Nalli Nihari and Korma gravies',
        chefNote: 'Originated in the Persian courts, perfected in the imperial royal bakeries of Awadh.',
        ingredients: ['Fine Wheat Flour', 'Whole Milk', 'Kashmiri Zafran', 'Rose Water', 'A2 Desi Ghee', 'Cardamom Powder']
    },
    {
        id: 'kesar-shahi-tukda',
        title: 'Kesar Shahi Tukda with 24K Gold Leaf',
        category: 'desserts',
        categoryLabel: 'Shahi Mithai & Royal Desserts',
        price: '₹650',
        rawPrice: 650,
        image: '/assets/dishes/shahi_tukda_1789900450183.jpg',
        description: 'Ghee-crisped brioche bathed in rich saffron rabdi infused with wild forest honey, pistachio slivers, edible silver & 24K gold leaves.',
        dietary: ['chef-pick', 'veg'],
        pairing: 'Sauternes / Late Harvest Muscat Dessert Wine',
        chefNote: 'The crowning jewel of royal feasts, adorned with real edible gold leaf and silver varq.',
        ingredients: ['Artisanal Brioche', 'Saffron Rabdi', 'Pistachio Crumble', 'Forest Honey Glaze', 'Edible 24K Gold Leaf', 'Cardamom Essence']
    },
    {
        id: 'darjeeling-champagne-cocktail',
        title: 'Darjeeling First Flush Royal Fizz',
        category: 'beverages',
        categoryLabel: 'Royal Elixirs & Cocktails',
        price: '₹750',
        rawPrice: 750,
        image: '/assets/dishes/darjeeling_royal_fizz.jpg',
        description: 'Single estate Castleton Darjeeling First Flush tea reduction, elderflower liqueur, topped with Champagne and 24k gold shimmer.',
        dietary: ['chef-pick', 'veg'],
        pairing: 'Starter courses and royal celebrations',
        chefNote: 'The Champagne of teas meets French Champagne in sheer regal harmony.',
        ingredients: ['Darjeeling 1st Flush Tea', 'St-Germain Liqueur', 'Champagne Brut', 'Lemon Peel Essence', 'Gold Dust']
    }
];

// @route   GET /api/products
// @desc    Get all dishes with category, search, and dietary filters
const getProducts = async (req, res) => {
    try {
        const { category, search, diet } = req.query;

        let products = [];
        try {
            if (Product) {
                products = await Product.find({});
            }
        } catch (e) {}

        if (!products || products.length === 0) {
            const db = getLocalDB();
            products = (db.products && db.products.length > 0) ? db.products : INITIAL_PRODUCTS;
        }

        // Apply In-Memory Filters
        let filtered = products;

        if (category && category !== 'all') {
            filtered = filtered.filter(p => p.category === category || p.categoryLabel.toLowerCase().includes(category.toLowerCase()));
        }

        if (diet && diet !== 'all') {
            filtered = filtered.filter(p => p.dietary && p.dietary.includes(diet));
        }

        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                (p.ingredients && p.ingredients.some(i => i.toLowerCase().includes(q)))
            );
        }

        res.json({
            success: true,
            count: filtered.length,
            products: filtered
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   GET /api/products/:id
// @desc    Get single dish details by ID or slug
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        let product = null;
        try {
            if (Product) {
                product = await Product.findOne({ $or: [{ id: id }, { _id: id }] });
            }
        } catch (e) {}

        if (!product) {
            const db = getLocalDB();
            const list = (db.products && db.products.length > 0) ? db.products : INITIAL_PRODUCTS;
            product = list.find(p => p.id === id || p._id === id || p.title.toLowerCase().replace(/[^a-z0-9]/g, '-').includes(id.toLowerCase()));
        }

        if (!product) {
            return res.status(404).json({ success: false, error: `Dish not found with id: ${id}` });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   POST /api/products
// @desc    Create new dish (Admin only)
const createProduct = async (req, res) => {
    try {
        const productData = req.body;
        if (!productData.title || !productData.category || !productData.price) {
            return res.status(400).json({ success: false, error: 'Title, category, and price are required' });
        }

        const rawPrice = Number(String(productData.price).replace(/[^0-9]/g, '')) || 500;
        const newProduct = {
            id: productData.id || productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            title: productData.title,
            category: productData.category,
            categoryLabel: productData.categoryLabel || productData.category,
            price: `₹${rawPrice.toLocaleString('en-IN')}`,
            rawPrice: rawPrice,
            image: productData.image || '/assets/dishes/galouti_kebab_1789900179801.jpg',
            description: productData.description || 'Master chef special preparation.',
            dietary: productData.dietary || ['veg'],
            pairing: productData.pairing || 'Royal Elixir Pairing',
            chefNote: productData.chefNote || 'Historic royal recipe.',
            ingredients: Array.isArray(productData.ingredients) ? productData.ingredients : (productData.ingredients ? productData.ingredients.split(',').map(s => s.trim()) : ['Pure Desi Ghee', 'Saffron']),
            isAvailable: true,
            createdAt: new Date().toISOString()
        };

        try {
            if (Product) {
                await Product.create(newProduct);
            }
        } catch (e) {}

        const db = getLocalDB();
        if (!db.products) db.products = [...INITIAL_PRODUCTS];
        db.products.unshift(newProduct);
        saveLocalDB(db);

        res.status(201).json({
            success: true,
            message: 'New royal creation added to menu catalogue',
            product: newProduct
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   PATCH /api/products/:id
// @desc    Update dish (Admin only)
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const db = getLocalDB();
        if (!db.products) db.products = [...INITIAL_PRODUCTS];

        const idx = db.products.findIndex(p => p.id === id || p._id === id);
        if (idx === -1) {
            return res.status(404).json({ success: false, error: 'Dish not found' });
        }

        db.products[idx] = { ...db.products[idx], ...updateData };
        saveLocalDB(db);

        res.json({
            success: true,
            message: 'Dish updated successfully',
            product: db.products[idx]
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   DELETE /api/products/:id
// @desc    Delete dish (Admin only)
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getLocalDB();
        if (!db.products) db.products = [...INITIAL_PRODUCTS];

        db.products = db.products.filter(p => p.id !== id && p._id !== id);
        saveLocalDB(db);

        res.json({
            success: true,
            message: 'Dish removed from menu'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
