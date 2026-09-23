const { getLocalDB, saveLocalDB } = require('../config/db');

// @route   GET /api/categories
// @desc    Get all culinary categories
const getCategories = async (req, res) => {
    try {
        const db = getLocalDB();
        const categories = db.categories || [
            { id: 'starters', name: 'Shahi Starters & Kebabs', slug: 'starters', icon: 'fa-fire-burner', count: 6 },
            { id: 'mains', name: 'Royal Curries & Dum Handis', slug: 'mains', icon: 'fa-utensils', count: 8 },
            { id: 'biryani', name: 'Awadhi & Dum Biryanis', slug: 'biryani', icon: 'fa-bowl-rice', count: 4 },
            { id: 'breads', name: 'Tandoori & Artisanal Breads', slug: 'breads', icon: 'fa-bread-slice', count: 4 },
            { id: 'desserts', name: 'Shahi Mithai & Royal Desserts', slug: 'desserts', icon: 'fa-ice-cream', count: 4 },
            { id: 'beverages', name: 'Royal Elixirs & Cocktails', slug: 'beverages', icon: 'fa-wine-glass', count: 4 }
        ];

        res.json({
            success: true,
            categories
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   POST /api/categories
// @desc    Create category (Admin)
const createCategory = async (req, res) => {
    try {
        const { name, slug, icon, description } = req.body;
        if (!name) return res.status(400).json({ success: false, error: 'Category name is required' });

        const db = getLocalDB();
        if (!db.categories) db.categories = [];

        const newCat = {
            id: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            name,
            slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            icon: icon || 'fa-utensils',
            description: description || '',
            count: 0
        };

        db.categories.push(newCat);
        saveLocalDB(db);

        res.status(201).json({ success: true, category: newCat });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   PATCH /api/categories/:id
// @desc    Update category (Admin)
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getLocalDB();
        if (!db.categories) db.categories = [];

        const idx = db.categories.findIndex(c => c.id === id || c.slug === id);
        if (idx === -1) return res.status(404).json({ success: false, error: 'Category not found' });

        db.categories[idx] = { ...db.categories[idx], ...req.body };
        saveLocalDB(db);

        res.json({ success: true, category: db.categories[idx] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @route   DELETE /api/categories/:id
// @desc    Delete category (Admin)
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getLocalDB();
        if (!db.categories) db.categories = [];

        db.categories = db.categories.filter(c => c.id !== id && c.slug !== id);
        saveLocalDB(db);

        res.json({ success: true, message: 'Category removed' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
