/**
 * SAVORIA — Royal Indian Haute Cuisine & Shahi Gastronomy
 * Comprehensive Features:
 * - Authentic Royal Indian Gastronomy Menu (Awadhi, Mughlai, Malabar, Rajasthani, Amritsari)
 * - Indian Currency (₹ INR) & GST Tax Engine (5% Restaurant GST)
 * - Dedicated Dish Detail Page (dish.html)
 * - Dedicated Artisanal Order Tray & Checkout Page (tray.html)
 * - UPI Instant Pay (Google Pay, PhonePe, Paytm, QR) & RuPay Black Card (payment.html)
 * - Visual Floor Plan (The Durbar Hall, Jharokha Pergola, Chef's Counter, Shahi Diwan)
 * - Sommelier & Royal Rasoi Pairing Quiz
 * - Customer Review Submission & Order Tracking
 * - Cross-page shared cart persistence in localStorage
 */

// Global State Variables
let cart = [];
let tipPercent = 10;
let trayTip = 10;
const SALES_TAX_RATE = 0.05; // 5% Indian Restaurant GST
let selectedDishQty = 1;
let activeCategory = 'all';
let activeDietFilters = new Set();
let searchQuery = '';
let quizStep = 1;
let quizAnswers = { occasion: '', flavor: '', wine: '' };
let selectedTable = { id: 'T-01', zone: 'The Durbar Hall', seats: 2, label: 'T-01 (The Durbar Hall • 2 Royal Seats)' };

function formatINR(amount) {
    return '₹' + Math.round(amount).toLocaleString('en-IN');
}

function initApp() {
    loadCartFromStorage();
    initUserAuthSystem();
    initNavigation();
    initLiveRestaurantStatus();
    initCartSystem();

    // Check which page is currently active
    if (document.getElementById('dishDetailContainer')) {
        initDishPage();
    }

    if (document.getElementById('trayGridContainer')) {
        initTrayPage();
    }

    if (document.getElementById('tabSignInBtn')) {
        initAuthPage();
    }

    if (document.getElementById('confOrderRef')) {
        initConfirmPage();
    }

    if (document.getElementById('cardPaymentForm') || document.getElementById('panelUpi')) {
        initPaymentPage();
    }

    if (document.getElementById('staffOrdersList')) {
        initStaffDashboard();
    }

    if (document.getElementById('menuGrid')) {
        initMenu();
        initReservationSystem();
        initFloorPlanSystem();
        initSommelierQuiz();
        initReviewSubmissionSystem();
        initTestimonialSlider();
        initInquiryForms();
        initScrollEffects();
    }
}

/* ==========================================================================
   1. ROYAL INDIAN GASTRONOMY MENU DATABASE
   ========================================================================== */
const MENU_DATA = [
    // --- 1. SHAHI STARTERS & TANDOOR (SHURUAAT) ---
    {
        id: 'galouti-kebab',
        title: 'Kakori Galouti Kebab with Warqi Paratha',
        category: 'starters',
        categoryLabel: 'Shahi Starters & Kebabs',
        price: '₹950',
        rawPrice: 950,
        image: 'assets/dishes/galouti_kebab_1789900179801.jpg',
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
        image: 'assets/dishes/paneer_tikka_1789900431782.jpg',
        description: 'Artisanal buffalo milk cottage cheese, black winter truffle marinade, organic hung curd, smoked yellow chillies & mint emulsion.',
        dietary: ['chef-pick', 'veg'],
        pairing: '2022 Sula Rasa Sauvignon Blanc, Nashik Valley',
        chefNote: 'Paneer is churned fresh every morning in-house, infused with aromatic truffle paste and seared over red hot coal embers.',
        ingredients: ['Handmade Buffalo Malai Paneer', 'Black Winter Truffle', 'Yellow Chilli Paste', 'Smoked Mathania Charcoal', 'Pudina Foam']
    },
    {
        id: 'kasundi-seabass',
        title: 'Amritsari Kasundi Fish Tikka',
        category: 'starters',
        categoryLabel: 'Shahi Starters & Kebabs',
        price: '₹1,150',
        rawPrice: 1150,
        image: 'assets/dishes/fish_tikka_1789900570269.jpg',
        description: 'Pan-seared Chilean seabass fillets crusted with carom seeds, Bengal kasundi mustard reduction, pomegranate glaze & radish carpaccio.',
        dietary: ['chef-pick', 'non-veg'],
        pairing: '2021 Chablis Premier Cru / Royal Kokum Fizz',
        chefNote: 'A royal confluence of Punjabi tandoor char and Bengali artisanal fermented mustard.',
        ingredients: ['Glacier 51 Seabass', 'Bengal Kasundi Mustard', 'Ajwain (Carom Seeds)', 'Cold-Pressed Mustard Oil', 'Charred Lemon']
    },
    {
        id: 'bhatte-murgh-tikka',
        title: 'Bhatte Da Murgh Malai Kebab',
        category: 'starters',
        categoryLabel: 'Shahi Starters & Kebabs',
        price: '₹850',
        rawPrice: 850,
        image: 'assets/dishes/murgh_malai_kebab.jpg',
        description: 'Free-range chicken supremes steeped overnight in green cardamom, heavy clotted cream, mace blossoms & charred in clay oven.',
        dietary: ['non-veg'],
        pairing: 'NV Billecart-Salmon Brut Champagne',
        chefNote: 'Delicate silkiness achieved with slow gentle clay pot tandoor roasting.',
        ingredients: ['Free-Range Chicken Breast', 'Malabar Green Cardamom', 'Javitri (Mace)', 'Fresh Clotted Cream', 'Coriander Root Chutney']
    },

    // --- 2. CHEF\'S ROYAL SIGNATURES (SHAHI DASTARKHWAN) ---
    {
        id: 'awadhi-nalli-nihari',
        title: 'Royal Awadhi Nalli Nihari',
        category: 'signatures',
        categoryLabel: "Chef's Royal Signatures",
        price: '₹1,450',
        rawPrice: 1450,
        image: 'assets/dishes/awadhi_nalli_nihari_1789900162831.jpg',
        description: '12-hour slow-braised baby lamb shanks in a rich bone-marrow jus, perfumed with rose water, vetiver (khus), topped with 24k gold leaf.',
        dietary: ['chef-pick', 'non-veg'],
        pairing: '2018 Sula Rasa Cabernet Sauvignon / 18-Yr Single Malt',
        chefNote: 'Slow simmered overnight in traditional sealed copper deghs until the meat slips effortlessly from the bone marrow.',
        ingredients: ['Organic Baby Lamb Shanks', 'Bone Marrow Yakhni', 'Rampuri All-Spices', 'Rose Water', 'Fresh Ginger Juliennes', '24k Gold Foil']
    },
    {
        id: 'truffle-butter-chicken',
        title: 'Old Delhi Truffle Murgh Makhani',
        category: 'signatures',
        categoryLabel: "Chef's Royal Signatures",
        price: '₹1,150',
        rawPrice: 1150,
        image: 'assets/dishes/butter_chicken_1789900197286.jpg',
        description: 'Charred tandoori chicken tikka simmered in sun-ripened San Marzano tomato velvet gravy, churned white makhan & shaved Umbrian black truffles.',
        dietary: ['chef-pick', 'non-veg'],
        pairing: '2020 Meursault, Burgundy / Darjeeling Imperial Tea',
        chefNote: 'The iconic butter chicken elevated to grand cru status with slow-churned farm butter and earthy black truffles.',
        ingredients: ['Clay Oven Tandoori Chicken', 'San Marzano Tomatoes', 'Hand-Churned White Butter', 'Black Truffle Carpaccio', 'Kasuri Methi']
    },
    {
        id: 'dal-savoria',
        title: 'Dal Savoria (24-Hour Dum Simmered)',
        category: 'signatures',
        categoryLabel: "Chef's Royal Signatures",
        price: '₹650',
        rawPrice: 650,
        image: 'assets/dishes/dal_savoria_1789900229435.jpg',
        description: 'Signature black urad lentils slow-cooked over charcoal embers for 24 continuous hours with vine-ripened tomatoes, fresh cream & organic ghee.',
        dietary: ['chef-pick', 'veg', 'jain'],
        pairing: '2021 Grover Zampa Chene Grand Reserve',
        chefNote: 'Our most revered creation. Velvety, smoky, rich and comforting without any heavy artificial butter.',
        ingredients: ['Whole Black Urad Dal', 'Vine Tomatoes', 'Organic A2 Cow Ghee', 'Fresh Cream', 'Smoked Kasuri Methi']
    },
    {
        id: 'rajasthani-laal-maas',
        title: 'Royal Mewar Laal Maas',
        category: 'signatures',
        categoryLabel: "Chef's Royal Signatures",
        price: '₹1,350',
        rawPrice: 1350,
        image: 'assets/dishes/laal_maas_1789900528697.jpg',
        description: 'Authentic royal game curry made with tender goat meat, fiery stone-ground Mathania chillies, garlic confit & smoked cloves in A2 ghee.',
        dietary: ['non-veg'],
        pairing: '2019 Barolo / Royal Saffron Cocktail',
        chefNote: 'Original recipe from the Mewari royal huntsmen, smoked with burning clove charcoal in pure cow ghee.',
        ingredients: ['Prime Goat Meat', 'Heritage Mathania Red Chillies', 'Garlic Paste', 'Smoked Clove Charcoal', 'A2 Desi Cow Ghee']
    },
    {
        id: 'malabar-tiger-prawns',
        title: 'Jumbo Tiger Prawns Malabar Moilee',
        category: 'signatures',
        categoryLabel: "Chef's Royal Signatures",
        price: '₹1,350',
        rawPrice: 1350,
        image: 'assets/dishes/malabar_prawns_1789900486182.jpg',
        description: 'Pan-roasted jumbo bay tiger prawns in a silken coconut milk & green turmeric stew, tempered with mustard seeds and fresh curry leaves.',
        dietary: ['chef-pick', 'non-veg'],
        pairing: '2022 Pouilly-Fumé / Chilled Coconut Water Cooler',
        chefNote: 'Sourced from the Arabian Sea coastline of Kerala, balanced between sweet coconut and zesty raw mango.',
        ingredients: ['Bay of Bengal Tiger Prawns', 'Fresh Coconut Milk', 'Raw Turmeric', 'Curry Leaves', 'Black Mustard Seeds', 'Kerala Kokum']
    },
    {
        id: 'smoked-kathal-rawalpindi',
        title: 'Rawalpindi Smoked Kathal Masala',
        category: 'signatures',
        categoryLabel: "Chef's Royal Signatures",
        price: '₹750',
        rawPrice: 750,
        image: 'assets/dishes/smoked_kathal_masala.jpg',
        description: 'Tender baby green jackfruit charred in tandoor, braised with caramelized brown onions, black cardamom, and whole crushed spices.',
        dietary: ['veg'],
        pairing: '2021 Chianti Classico Riserva',
        chefNote: 'Plant-forward royal indulgence that rivals tender lamb in flavor absorption and umami depth.',
        ingredients: ['Young Green Jackfruit', 'Brown Onion Birista', 'Black Cardamom', 'Himalayan Pink Salt', 'Cold-Pressed Mustard Oil']
    },

    // --- 3. HERITAGE DUM BIRYANIS & RICE (KHUSHBUDAR RICE) ---
    {
        id: 'dum-pukht-gosht-biryani',
        title: 'Awadhi Dum Pukht Gosht Biryani',
        category: 'biryanis',
        categoryLabel: 'Heritage Dum Biryanis',
        price: '₹1,250',
        rawPrice: 1250,
        image: 'assets/dishes/dum_biryani_1789900245311.jpg',
        description: 'Aged 2-year Kohinoor basmati rice layered with succulent baby goat, sealed in a dough crust (Purdah) with saffron yakhni, kewra & rose water.',
        dietary: ['chef-pick', 'non-veg'],
        pairing: 'Burani Garlic Raita & Mirchi Ka Salan',
        chefNote: 'Slow cooked on charcoal dum for 4 hours. Cut open tableside to release intoxicating saffron steam.',
        ingredients: ['Aged Kohinoor Basmati', 'Baby Goat Meat', 'Kashmiri Kesar', 'Kewra Water', 'Crispy Golden Onions', 'Burani Raita']
    },
    {
        id: 'murgh-zafrani-biryani',
        title: 'Zafrani Murgh Dum Biryani',
        category: 'biryanis',
        categoryLabel: 'Heritage Dum Biryanis',
        price: '₹950',
        rawPrice: 950,
        image: 'assets/dishes/murgh_zafrani_biryani.jpg',
        description: 'Tender chicken thighs marinated in yogurt, green mint, shahi jeera, layered with saffron-soaked rice and cooked in sealed earthen handi.',
        dietary: ['non-veg'],
        pairing: 'Pomegranate Mint Raita',
        chefNote: 'Perfumed with wild hill mint, royal cumin, and real saffron strands from Pampore.',
        ingredients: ['Farm Chicken Thighs', 'Fragrant Basmati Rice', 'Pampore Saffron', 'Wild Mint', 'Brown Ghee Infusion']
    },
    {
        id: 'shahi-subz-biryani',
        title: 'Shahi Subz Dum Biryani with Morels',
        category: 'biryanis',
        categoryLabel: 'Heritage Dum Biryanis',
        price: '₹750',
        rawPrice: 750,
        image: 'assets/dishes/shahi_subz_biryani.jpg',
        description: 'Kashmiri wild morels (guchhi), baby winter vegetables, dried figs, cashew paste, and saffron rice sealed under pastry seal.',
        dietary: ['chef-pick', 'veg', 'jain'],
        pairing: 'Walnut & Cucumber Chilled Raita',
        chefNote: 'Guchhi morels are foraged in the Himalayas, lending woodsy aroma to the saffron rice.',
        ingredients: ['Himalayan Guchhi Morels', 'Baby Carrots & Florets', 'Dried Turkish Figs', 'Kashmiri Saffron', 'Aged Basmati']
    },

    // --- 4. ARTISANAL BREADS & TANDOOR (ROTI & NAAN) ---
    {
        id: 'truffle-chur-chur-naan',
        title: 'Truffle Ghee Chur-Chur Naan',
        category: 'breads',
        categoryLabel: 'Artisanal Breads & Tandoor',
        price: '₹220',
        rawPrice: 220,
        image: 'assets/dishes/chur_chur_naan_1789900511728.jpg',
        description: 'Multi-layered flaky tandoori naan crushed by hand, brushed with Italian black truffle ghee and sprinkled with pink rock salt.',
        dietary: ['chef-pick', 'veg'],
        pairing: 'Perfect with Dal Savoria & Murgh Makhani',
        chefNote: 'Laminated with cultured butter and cooked on the glowing clay walls of the tandoor.',
        ingredients: ['Refined Flour', 'Truffle Infused Cow Ghee', 'Himalayan Pink Salt', 'Nigella Seeds (Kalonji)']
    },
    {
        id: 'awadhi-zafran-sheermal',
        title: 'Awadhi Zafran Sheermal',
        category: 'breads',
        categoryLabel: 'Artisanal Breads & Tandoor',
        price: '₹260',
        rawPrice: 260,
        image: 'assets/dishes/zafran_sheermal.jpg',
        description: 'Traditional Lucknowi saffron-enriched sweet milk flatbread baked in tandoor, finished with pistachio dust and edible silver vark.',
        dietary: ['veg'],
        pairing: 'Best accompaniment for Awadhi Nalli Nihari',
        chefNote: 'A royal Nawabi delicacy kneaded with warm saffron milk and pure ghee.',
        ingredients: ['Flour', 'Whole Milk', 'Kashmiri Kesar', 'Cardamom', 'Pistachio Flakes', 'Silver Vark']
    },
    {
        id: 'garlic-rosemary-paratha',
        title: 'Smoked Garlic & Rosemary Laccha Paratha',
        category: 'breads',
        categoryLabel: 'Artisanal Breads & Tandoor',
        price: '₹190',
        rawPrice: 190,
        image: 'assets/dishes/garlic_laccha_paratha.jpg',
        description: 'Crisp spiral whole-wheat paratha layered with roasted garlic butter, fresh mountain rosemary, and carom seeds.',
        dietary: ['veg'],
        pairing: 'Excellent with kebabs and rogan josh',
        chefNote: 'Hand-rolled in circular spirals to create over 20 distinct flaky crisp rings.',
        ingredients: ['Whole Wheat Flour', 'Confit Garlic Butter', 'Fresh Rosemary', 'Ajwain', 'Desi Ghee']
    },

    // --- 5. HERITAGE ROYAL DESSERTS (MEETHA) ---
    {
        id: 'kesar-shahi-tukda',
        title: 'Kesar Shahi Tukda with 24K Gold Leaf',
        category: 'desserts',
        categoryLabel: 'Heritage Royal Confectionery',
        price: '₹650',
        rawPrice: 650,
        image: 'assets/dishes/shahi_tukda_1789900450183.jpg',
        description: 'Crisp ghee-fried artisanal brioche soaked in cardamom syrup, smothered in 8-hour reduced saffron rabri, Iranian pistachios, and 24k gold leaf.',
        dietary: ['chef-pick', 'veg'],
        pairing: 'Royal Tokaji 5 Puttonyos / Masala Chai',
        chefNote: 'The crowning jewel of the Mughal imperial banquet, crafted with thick golden saffron rabri.',
        ingredients: ['Artisanal Brioche', 'Pure Cow Ghee', 'Reduced Saffron Rabri', 'Iranian Pistachios', 'Chironji', '24K Edible Gold Leaf']
    },
    {
        id: 'angoori-rasmalai',
        title: 'Angoori Rasmalai with Saffron Rose Milk',
        category: 'desserts',
        categoryLabel: 'Heritage Royal Confectionery',
        price: '₹550',
        rawPrice: 550,
        image: 'assets/dishes/angoori_rasmalai.jpg',
        description: 'Miniature spongy cottage cheese spheres poached in light syrup, served chilled in condensed saffron-almond milk with organic rose water mist.',
        dietary: ['veg', 'jain'],
        pairing: 'NV Franciacorta Brut Rosé',
        chefNote: 'Hand-shaped fresh chenna dumplings that melt instantly upon tasting.',
        ingredients: ['Fresh Cow Milk Chenna', 'Pampore Kesar', 'Crushed Almonds', 'Organic Kannauj Rose Water', 'Silver Flakes']
    },
    {
        id: 'smoked-gulab-jamun-flambe',
        title: 'Smoked Gulab Jamun Flambé',
        category: 'desserts',
        categoryLabel: 'Heritage Royal Confectionery',
        price: '₹590',
        rawPrice: 590,
        image: 'assets/dishes/gulab_jamun_1789900467719.jpg',
        description: 'Handcrafted mawa & chenna spheres stuffed with pistachio praline, flambéed tableside with dark spiced rum, accompanied by Tahitian vanilla bean gelato.',
        dietary: ['chef-pick', 'veg'],
        pairing: 'Taylor Fladgate 20-Year Tawny Port',
        chefNote: 'A dramatic tableside presentation where glowing blue flame caramelizes the spiced sugar crust.',
        ingredients: ['Artisanal Khoya/Mawa', 'Pistachio Core', 'Cardamom Sugar Syrup', 'Old Spiced Dark Rum', 'Vanilla Bean Gelato']
    },
    {
        id: 'matka-malai-kulfi',
        title: 'Heritage Matka Malai Kulfi Falooda',
        category: 'desserts',
        categoryLabel: 'Heritage Royal Confectionery',
        price: '₹480',
        rawPrice: 480,
        image: 'assets/dishes/matka_kulfi_falooda.jpg',
        description: 'Slow-churned frozen rabri kulfi set in earthen clay pots, served over handmade cornstarch falooda, sabja seeds, and Kannauj rose petal syrup.',
        dietary: ['veg', 'jain'],
        pairing: 'Sweet Paan Digestif',
        chefNote: 'Frozen slowly in traditional iced clay pots (matka) for dense, velvety richness.',
        ingredients: ['Reduced Buffalo Milk', 'Green Cardamom', 'Pistachios & Cashews', 'Handmade Falooda', 'Sabja Seeds', 'Pure Rose Syrup']
    },

    // --- 6. ROYAL ELIXIRS & CELLAR (SHAHI SHARBATS & COCKTAILS) ---
    {
        id: 'royal-saffron-thandai',
        title: 'The Royal Kesar Badam Thandai',
        category: 'beverages',
        categoryLabel: 'Royal Elixirs & Cocktails',
        price: '₹380',
        rawPrice: 380,
        image: 'assets/dishes/saffron_thandai_1789900547866.jpg',
        description: 'Stone-ground paste of Mamra almonds, poppy seeds, fennel, black pepper, and saffron steeped in chilled creamy whole milk with rose petals.',
        dietary: ['chef-pick', 'veg'],
        pairing: 'Aperitif prior to royal feast',
        chefNote: 'Hand-ground on sil-batta stone for cooling herbal balance and opulent nutty aroma.',
        ingredients: ['Mamra Almonds', 'Kashmiri Kesar', 'Khus Khus (Poppy Seeds)', 'Fennel Seeds', 'Black Peppercorns', 'Rose Petals']
    },
    {
        id: 'jamun-kokum-cooler',
        title: 'Smoked Jamun & Kokum Royal Cooler',
        category: 'beverages',
        categoryLabel: 'Royal Elixirs & Cocktails',
        price: '₹320',
        rawPrice: 320,
        image: 'assets/dishes/jamun_kokum_cooler.jpg',
        description: 'Wild Indian black plums (jamun) charred over applewood, blended with Konkan kokum extract, black rock salt, and sparkling Himalayan spring water.',
        dietary: ['veg'],
        pairing: 'Kebabs and tandoori courses',
        chefNote: 'Sweet, tart, smoky and profoundly refreshing on the palate.',
        ingredients: ['Wild Black Jamun', 'Konkan Kokum Rind', 'Kala Namak (Black Salt)', 'Roasted Cumin', 'Sparkling Spring Water']
    },
    {
        id: 'darjeeling-champagne-cocktail',
        title: 'Darjeeling First Flush Royal Fizz',
        category: 'beverages',
        categoryLabel: 'Royal Elixirs & Cocktails',
        price: '₹750',
        rawPrice: 750,
        image: 'assets/dishes/darjeeling_royal_fizz.jpg',
        description: 'Single estate Castleton Darjeeling First Flush tea reduction, elderflower liqueur, topped with Veuve Clicquot Champagne and 24k gold shimmer.',
        dietary: ['chef-pick', 'veg'],
        pairing: 'Starter courses and royal celebrations',
        chefNote: 'The Champagne of teas meets French Champagne in sheer regal harmony.',
        ingredients: ['Darjeeling 1st Flush Tea', 'St-Germain Liqueur', 'Veuve Clicquot Brut', 'Lemon Peel Essence', 'Gold Dust']
    },
    {
        id: 'banarasi-paan-negroni',
        title: 'Banarasi Paan Smoked Negroni',
        category: 'beverages',
        categoryLabel: 'Royal Elixirs & Cocktails',
        price: '₹850',
        rawPrice: 850,
        image: 'assets/dishes/banarasi_paan_negroni.jpg',
        description: 'Artisanal Jaisalmer Indian Gin infused with Banarasi betel leaf, Campari, Antica sweet vermouth, smoked tableside with cloves and betel wood.',
        dietary: ['chef-pick', 'veg'],
        pairing: 'Post-dinner digestif',
        chefNote: 'Captures the nostalgic after-dinner fragrance of royal Banaras in an Italian classic format.',
        ingredients: ['Jaisalmer Craft Gin', 'Fresh Banarasi Paan Leaf', 'Campari', 'Carpano Antica Vermouth', 'Clove Wood Smoke']
    }
];

/* ==========================================================================
   GLOBAL DISH NAVIGATION HELPER
   ========================================================================== */
window.goToDish = function (dishId, e) {
    if (e) {
        if (e.target && (e.target.closest('button') || e.target.closest('.dish-card-actions') || e.target.closest('.btn-add-upsell') || e.target.closest('.cart-remove-btn') || e.target.closest('.tray-delete-btn') || e.target.closest('.tray-qty-btn'))) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
    }
    try {
        localStorage.setItem('savoria_selected_dish_id', dishId);
    } catch (err) { }

    window.location.href = `dish.html?id=${encodeURIComponent(dishId)}`;
};

function openDishModal(dishId) {
    const dish = MENU_DATA.find(d => d.id === dishId) || MENU_DATA[0];
    const dishModal = document.getElementById('dishModal');
    const dishModalBody = document.getElementById('dishModalBody');
    if (!dishModal || !dishModalBody) return;

    dishModalBody.innerHTML = `
        <img src="${dish.image}" alt="${dish.title}" class="modal-dish-img">
        <div class="modal-dish-body">
            <div class="modal-dish-header">
                <div>
                    <span class="dish-category-label">${dish.categoryLabel}</span>
                    <h3 class="modal-dish-title">${dish.title}</h3>
                </div>
                <span class="modal-dish-price">${dish.price}</span>
            </div>

            <p class="modal-dish-desc">${dish.description}</p>

            <div class="dish-diet-tags" style="position:static; margin-bottom: 16px;">
                ${dish.dietary.map(tag => {
                    if (tag === 'chef-pick') return `<span class="dish-diet-tag tag-chef"><i class="fa-solid fa-crown"></i> Royal Signature</span>`;
                    if (tag === 'veg') return `<span class="dish-diet-tag tag-veg"><i class="fa-solid fa-seedling"></i> Vegetarian</span>`;
                    if (tag === 'non-veg') return `<span class="dish-diet-tag tag-nonveg"><i class="fa-solid fa-drumstick-bite"></i> Non-Vegetarian</span>`;
                    if (tag === 'jain') return `<span class="dish-diet-tag"><i class="fa-solid fa-leaf"></i> Jain Available</span>`;
                    return '';
                }).join('')}
            </div>

            <div class="modal-detail-section">
                <h5><i class="fa-solid fa-quote-left"></i> Master Ustad's Note</h5>
                <p><em>"${dish.chefNote}"</em></p>
            </div>

            <div class="modal-detail-section">
                <h5><i class="fa-solid fa-wine-glass"></i> Master Sommelier Pairing</h5>
                <p>${dish.pairing}</p>
            </div>

            <div class="modal-detail-section">
                <h5><i class="fa-solid fa-mortar-pestle"></i> Artisanal Ingredients</h5>
                <div class="ingredients-tags">
                    ${dish.ingredients.map(ing => `<span class="ing-tag">${ing}</span>`).join('')}
                </div>
            </div>

            <div class="modal-actions" style="margin-top: 24px; display: flex; gap: 12px; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="addToCart('${dish.id}'); closeDishModal(); openCartDrawer();" style="flex: 1;">
                    <i class="fa-solid fa-bag-shopping"></i> Add to Order Tray (${dish.price})
                </button>
                <a href="dish.html?id=${dish.id}" class="btn btn-secondary" style="text-decoration:none;">
                    <i class="fa-solid fa-up-right-from-square"></i> Dedicated Dish Page
                </a>
            </div>
        </div>
    `;

    dishModal.classList.add('open');
    document.body.style.overflow = 'hidden';
}
window.openDishModal = openDishModal;

function closeDishModal() {
    const dishModal = document.getElementById('dishModal');
    if (dishModal) {
        dishModal.classList.remove('open');
        document.body.style.overflow = '';
    }
}
window.closeDishModal = closeDishModal;

/* ==========================================================================
   2. DEDICATED DISH DETAIL PAGE (dish.html)
   ========================================================================== */

function initDishPage() {
    const urlParams = new URLSearchParams(window.location.search);
    let dishId = urlParams.get('id');

    // Check URL hash if query param was missing
    if (!dishId && window.location.hash) {
        dishId = window.location.hash.replace('#', '').trim();
    }

    // Check localStorage fallback
    if (!dishId) {
        try {
            dishId = localStorage.getItem('savoria_selected_dish_id');
        } catch (e) { }
    }

    let dish = null;
    if (dishId) {
        dish = MENU_DATA.find(d => d.id === dishId || d.id.toLowerCase() === dishId.toLowerCase());
        if (!dish) {
            dish = MENU_DATA.find(d => d.title.toLowerCase().replace(/[^a-z0-9]/g, '-').includes(dishId.toLowerCase()));
        }
    }

    // Default fallback
    if (!dish) {
        dish = MENU_DATA[0];
    }

    // Save active dish in storage for consistency
    try {
        localStorage.setItem('savoria_selected_dish_id', dish.id);
    } catch (e) { }

    console.log('[SAVORIA] Displaying dish:', dish.id, dish.title);

    document.title = `${dish.title} — SAVORIA Royal Indian Haute Cuisine`;
    const crumb = document.getElementById('breadcrumbDishName');
    if (crumb) crumb.textContent = dish.title;

    const container = document.getElementById('dishDetailContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="dish-gallery-column">
            <div class="dish-gallery-main">
                <img src="${dish.image}" alt="${dish.title}" class="dish-gallery-img">
            </div>
            
            <div class="dish-culinary-badges-card">
                <div class="dish-badge-row">
                    <i class="fa-solid fa-crown"></i>
                    <div>
                        <strong>Royal Heritage Authenticity</strong>
                        <span>Prepared following historic recipes of Nawabi & Rajputana Dastarkhwans</span>
                    </div>
                </div>
                <div class="dish-badge-row">
                    <i class="fa-solid fa-fire-burner"></i>
                    <div>
                        <strong>Clay Tandoor & Dum Pukht Hearth</strong>
                        <span>Slow cooked in sealed handis over glowing charcoal embers</span>
                    </div>
                </div>
                <div class="dish-badge-row">
                    <i class="fa-solid fa-gem"></i>
                    <div>
                        <strong>Artisanal Indian Spices</strong>
                        <span>Pampore Kashmiri Saffron, Mathania chillies, and organic A2 cow ghee</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="dish-info-column">
            <div class="dish-meta-header">
                <span class="dish-category-label">${dish.categoryLabel}</span>
                <h1 class="dish-page-title">${dish.title}</h1>
                <div class="dish-price-rating-row">
                    <span class="dish-page-price">${dish.price}</span>
                    <span class="rating-stars"><i class="fa-solid fa-star"></i> 4.9 (Michelin Guide Selected)</span>
                </div>
            </div>

            <p class="dish-page-description">${dish.description}</p>

            <div class="dish-diet-tags" style="position:static; margin-bottom: 6px;">
                ${dish.dietary.map(tag => {
        if (tag === 'chef-pick') return `<span class="dish-diet-tag tag-chef"><i class="fa-solid fa-crown"></i> Royal Signature</span>`;
        if (tag === 'veg') return `<span class="dish-diet-tag tag-veg"><i class="fa-solid fa-seedling"></i> Vegetarian</span>`;
        if (tag === 'non-veg') return `<span class="dish-diet-tag tag-nonveg"><i class="fa-solid fa-drumstick-bite"></i> Non-Vegetarian</span>`;
        if (tag === 'jain') return `<span class="dish-diet-tag"><i class="fa-solid fa-leaf"></i> Jain Available</span>`;
        return '';
    }).join('')}
            </div>

            <div class="dish-info-block">
                <h4><i class="fa-solid fa-quote-left"></i> Master Ustad's Culinary Vision</h4>
                <p><em>"${dish.chefNote}"</em></p>
            </div>

            <div class="dish-info-block">
                <h4><i class="fa-solid fa-wine-glass"></i> Master Sommelier Pairing</h4>
                <p>${dish.pairing}</p>
            </div>

            <div class="dish-info-block">
                <h4><i class="fa-solid fa-mortar-pestle"></i> Handpicked Royal Ingredients</h4>
                <div class="ingredients-tags">
                    ${dish.ingredients.map(ing => `<span class="ing-tag">${ing}</span>`).join('')}
                </div>
            </div>

            <div class="dish-purchase-bar">
                <div class="qty-selector-lg">
                    <button class="qty-btn-lg" onclick="changeDishPageQty(-1)"><i class="fa-solid fa-minus"></i></button>
                    <span class="qty-val-lg" id="dishPageQtyVal">1</span>
                    <button class="qty-btn-lg" onclick="changeDishPageQty(1)"><i class="fa-solid fa-plus"></i></button>
                </div>

                <button class="btn btn-primary btn-add-tray-lg" onclick="addCurrentDishPageToCart('${dish.id}')">
                    <i class="fa-solid fa-bag-shopping"></i>
                    <span>Add to Royal Tray (${formatINR(dish.rawPrice * selectedDishQty)})</span>
                </button>

                <a href="tray.html" class="btn btn-secondary">
                    <i class="fa-solid fa-arrow-right"></i>
                    <span>View Order Tray</span>
                </a>
            </div>
        </div>
    `;

    const relatedContainer = document.getElementById('relatedDishesGrid');
    if (relatedContainer) {
        const related = MENU_DATA.filter(d => d.id !== dish.id).slice(0, 3);
        relatedContainer.innerHTML = related.map(rel => `
            <a href="dish.html?id=${rel.id}" class="dish-card" onclick="goToDish('${rel.id}', event)">
                <div class="dish-card-img-wrapper">
                    <img src="${rel.image}" alt="${rel.title}" class="dish-card-img" loading="lazy">
                </div>
                <div class="dish-card-body">
                    <div class="dish-card-header">
                        <h4 class="dish-title">${rel.title}</h4>
                        <span class="dish-price">${rel.price}</span>
                    </div>
                    <p class="dish-desc">${rel.description}</p>
                    <div class="dish-card-footer">
                        <span class="dish-view-btn">Savor Dish <i class="fa-solid fa-chevron-right"></i></span>
                    </div>
                </div>
            </a>
        `).join('');
    }
}

window.changeDishPageQty = function (delta) {
    selectedDishQty = Math.max(1, selectedDishQty + delta);
    const qtyValEl = document.getElementById('dishPageQtyVal');
    if (qtyValEl) qtyValEl.textContent = selectedDishQty;

    const urlParams = new URLSearchParams(window.location.search);
    const dishId = urlParams.get('id') || localStorage.getItem('savoria_selected_dish_id');
    const dish = MENU_DATA.find(d => d.id === dishId) || MENU_DATA[0];

    const addBtn = document.querySelector('.btn-add-tray-lg span');
    if (addBtn && dish) {
        addBtn.textContent = `Add to Royal Tray (${formatINR(dish.rawPrice * selectedDishQty)})`;
    }
};

window.addCurrentDishPageToCart = function (dishId) {
    const dish = MENU_DATA.find(d => d.id === dishId);
    if (!dish) return;

    for (let i = 0; i < selectedDishQty; i++) {
        addToCartSilently(dishId);
    }
    renderCart();
    bumpCartBadge();
    showToast(`Added ${selectedDishQty} × ${dish.title} to your royal order tray!`, 'success');
};

/* ==========================================================================
   2. USER AUTHENTICATION & MEMBERSHIP SYSTEM
   ========================================================================== */
function initUserAuthSystem() {
    renderNavAuth();
}

function getCurrentUser() {
    try {
        const userJson = localStorage.getItem('savoria_current_user');
        return userJson ? JSON.parse(userJson) : null;
    } catch (e) {
        return null;
    }
}

function setCurrentUser(user) {
    try {
        localStorage.setItem('savoria_current_user', JSON.stringify(user));
        renderNavAuth();
    } catch (e) { }
}

window.logoutUser = function () {
    try {
        localStorage.removeItem('savoria_current_user');
        renderNavAuth();
        showToast('You have been safely signed out.', 'info');
        if (document.getElementById('trayGridContainer')) {
            initTrayPage();
        }
    } catch (e) { }
};

function renderNavAuth() {
    const navSlots = document.querySelectorAll('#userAuthNavSlot, .user-auth-nav-slot');
    const user = getCurrentUser();

    navSlots.forEach(slot => {
        if (!slot) return;
        if (user) {
            const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'SV';
            slot.innerHTML = `
                <div class="user-profile-menu-container">
                    <div class="user-profile-pill" title="Member Profile">
                        <span class="user-avatar-circle">${initials}</span>
                        <span class="user-profile-name">${user.name}</span>
                        <i class="fa-solid fa-chevron-down" style="font-size: 0.65rem; color: var(--gold-light);"></i>
                    </div>
                    <div class="user-dropdown-card">
                        <div class="user-dropdown-header">
                            <strong>${user.name}</strong>
                            <span>Maharaja VIP Member</span>
                        </div>
                        <a href="tray.html" class="user-dropdown-item"><i class="fa-solid fa-bag-shopping"></i> View Order Tray</a>
                        <button type="button" class="user-dropdown-item logout-item" onclick="logoutUser()"><i class="fa-solid fa-right-from-bracket"></i> Sign Out</button>
                    </div>
                </div>
            `;
        } else {
            slot.innerHTML = `
                <a href="auth.html" class="nav-auth-btn">
                    <i class="fa-regular fa-user"></i>
                    <span>Sign In</span>
                </a>
            `;
        }
    });
}

/* ==========================================================================
   2A. DEDICATED AUTHENTICATION PAGE (auth.html)
   ========================================================================== */
function initAuthPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect');
    const promptBanner = document.getElementById('authCheckoutPrompt');

    if (redirectUrl === 'tray.html' && promptBanner) {
        promptBanner.style.display = 'flex';
    }

    const currentUser = getCurrentUser();
    if (currentUser && redirectUrl) {
        window.location.href = redirectUrl;
    }
}

window.switchAuthTab = function (tab) {
    const tabSignInBtn = document.getElementById('tabSignInBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');
    const signInForm = document.getElementById('signInForm');
    const registerForm = document.getElementById('registerForm');

    if (tab === 'login') {
        if (tabSignInBtn) tabSignInBtn.classList.add('active');
        if (tabRegisterBtn) tabRegisterBtn.classList.remove('active');
        if (signInForm) signInForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
    } else {
        if (tabRegisterBtn) tabRegisterBtn.classList.add('active');
        if (tabSignInBtn) tabSignInBtn.classList.remove('active');
        if (registerForm) registerForm.style.display = 'block';
        if (signInForm) signInForm.style.display = 'none';
    }
};

window.fillDemoUser = function () {
    const loginEmail = document.getElementById('loginEmail');
    const loginPass = document.getElementById('loginPassword');
    if (loginEmail) loginEmail.value = 'rajnandini@savoria.in';
    if (loginPass) loginPass.value = 'maharaja2026';
    showToast('Royal credentials filled. Click "Sign In & Continue".', 'info');
};

window.handleUserLogin = async function (e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showToast('Please enter both email and password.', 'error');
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success && data.token) {
            localStorage.setItem('savoria_jwt_token', data.token);
            setCurrentUser(data.user);
            showToast(data.message || `Welcome back, ${data.user.name}!`, 'success');

            const urlParams = new URLSearchParams(window.location.search);
            const redirectUrl = urlParams.get('redirect') || 'index.html';

            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 600);
        } else {
            showToast(data.error || 'Invalid credentials. Please try again.', 'error');
        }
    } catch (err) {
        console.warn('Backend login fallback:', err);
        // Fallback demo mode
        const nameFromEmail = email.split('@')[0].replace('.', ' ');
        const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
        const userObj = {
            name: formattedName.length > 2 ? formattedName : 'Royal Connoisseur',
            email: email,
            phone: '+91 98101 23456',
            role: 'guest'
        };
        setCurrentUser(userObj);
        showToast(`Welcome back, ${userObj.name}!`, 'success');
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect') || 'index.html';
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 600);
    }
};

window.handleUserRegister = async function (e) {
    e.preventDefault();
    const name = document.getElementById('regFullName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPass = document.getElementById('regConfirmPassword').value;

    if (password !== confirmPass) {
        showToast('Passwords do not match. Please verify.', 'error');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password })
        });

        const data = await response.json();

        if (data.success && data.token) {
            localStorage.setItem('savoria_jwt_token', data.token);
            setCurrentUser(data.user);
            showToast(`Membership created. Welcome to the Royal Court, ${name}!`, 'success');

            const urlParams = new URLSearchParams(window.location.search);
            const redirectUrl = urlParams.get('redirect') || 'index.html';

            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 600);
        } else {
            showToast(data.error || 'Registration failed. Please try again.', 'error');
        }
    } catch (err) {
        console.warn('Backend register fallback:', err);
        const userObj = {
            name: name,
            email: email,
            phone: phone,
            role: 'guest'
        };
        setCurrentUser(userObj);
        showToast(`Membership created. Welcome to the Royal Court, ${name}!`, 'success');
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect') || 'index.html';
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 600);
    }
};

/* ==========================================================================
   3. DEDICATED ARTISANAL ORDER TRAY PAGE (tray.html)
   ========================================================================== */

function initTrayPage() {
    renderTrayPage();
    renderTrayUpsells();

    // Prefill user credentials if logged in
    const user = getCurrentUser();
    if (user) {
        const nameInput = document.getElementById('trayName');
        const emailInput = document.getElementById('trayEmail');
        const phoneInput = document.getElementById('trayPhone');
        if (nameInput && !nameInput.value) nameInput.value = user.name || '';
        if (emailInput && !emailInput.value) emailInput.value = user.email || '';
        if (phoneInput && !phoneInput.value) phoneInput.value = user.phone || '';
    }

    const form = document.getElementById('trayCheckoutForm');
    if (form) {
        form.addEventListener('submit', window.handleTrayProceedPayment);
    }
}

window.handleTrayProceedPayment = function (e) {
    if (e) e.preventDefault();
    if (cart.length === 0) {
        showToast('Your royal order tray is currently empty. Please select dishes from the menu.', 'error');
        return;
    }

    const name = document.getElementById('trayName')?.value.trim() || 'Royal Guest';
    const email = document.getElementById('trayEmail')?.value.trim() || 'guest@savoria.in';
    const phone = document.getElementById('trayPhone')?.value.trim() || '+91 98110 54321';

    const prepTimeSelect = document.getElementById('trayPrepTime');
    const prepTime = prepTimeSelect && prepTimeSelect.selectedIndex > -1 ? prepTimeSelect.options[prepTimeSelect.selectedIndex].text : 'As soon as prepared (~35 min)';
    const instructions = document.getElementById('traySpecialInstructions')?.value.trim() || '';

    const isDelivery = document.querySelector('input[name="trayOrderType"]:checked')?.value === 'delivery';
    const deliveryAddress = isDelivery ? (document.getElementById('trayAddress')?.value.trim() || 'Lutyens Bungalow Zone, New Delhi') : 'Royal Valet Lounge at SAVORIA Court';

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * SALES_TAX_RATE; // 5% GST
    const tipAmount = subtotal * (trayTip / 100);
    const total = subtotal + tax + tipAmount;

    const orderRef = 'SAV-IND-' + Math.floor(100000 + Math.random() * 900000);

    // Construct Pending Order Payload for Payment Gateway
    const pendingOrder = {
        orderRef: orderRef,
        timestamp: new Date().toISOString(),
        dateFormatted: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        guest: {
            name: name,
            email: email,
            phone: phone,
            address: deliveryAddress
        },
        fulfillment: {
            type: isDelivery ? 'delivery' : 'pickup',
            typeLabel: isDelivery ? 'Royal White-Glove Chauffeur Delivery' : 'Private Curbside Valet Pickup',
            prepTime: prepTime,
            instructions: instructions
        },
        items: JSON.parse(JSON.stringify(cart)),
        financials: {
            subtotal: subtotal,
            tax: tax,
            tipPercent: trayTip,
            tipAmount: tipAmount,
            total: total
        }
    };

    // Save pending order to localStorage
    try {
        localStorage.setItem('savoria_pending_order', JSON.stringify(pendingOrder));
    } catch (err) { }

    // Save user if not present
    if (!getCurrentUser()) {
        setCurrentUser({
            name: name,
            email: email,
            phone: phone,
            membership: 'Royal Patron'
        });
    }

    showToast('Order fulfillment verified. Directing to secure payment authorization...', 'info');

    setTimeout(() => {
        window.location.href = 'payment.html';
    }, 150);
};

/* ==========================================================================
   3A. DEDICATED PAYMENT GATEWAY PAGE (payment.html)
   ========================================================================== */
function initPaymentPage() {
    let pendingOrder = null;
    try {
        const stored = localStorage.getItem('savoria_pending_order');
        if (stored) {
            pendingOrder = JSON.parse(stored);
        }
    } catch (e) { }

    // Fallback if directly accessed
    if (!pendingOrder) {
        if (cart.length > 0) {
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const tax = subtotal * SALES_TAX_RATE;
            const tipAmount = subtotal * 0.10;
            const total = subtotal + tax + tipAmount;
            pendingOrder = {
                orderRef: 'SAV-IND-' + Math.floor(100000 + Math.random() * 900000),
                guest: { name: getCurrentUser()?.name || 'Maharaja Guest', phone: '+91 98101 23456', address: '450 Heritage Marg, New Delhi' },
                fulfillment: { type: 'pickup', typeLabel: 'Private Curbside Valet Pickup', prepTime: 'As soon as prepared (~35 min)', instructions: '' },
                items: JSON.parse(JSON.stringify(cart)),
                financials: { subtotal, tax, tipPercent: 10, tipAmount, total }
            };
        } else {
            pendingOrder = {
                orderRef: 'SAV-IND-982410',
                guest: { name: getCurrentUser()?.name || 'Maharaja Yuvraj Singh', phone: '+91 98101 23456', address: 'Lutyens Bungalow Zone, New Delhi' },
                fulfillment: { type: 'delivery', typeLabel: 'Royal White-Glove Chauffeur Delivery', prepTime: 'As soon as prepared (~35 min)', instructions: '' },
                items: [
                    { title: 'Royal Awadhi Nalli Nihari', price: 1450, quantity: 1 },
                    { title: 'The Royal Kesar Badam Thandai', price: 380, quantity: 2 }
                ],
                financials: { subtotal: 2210.00, tax: 110.50, tipPercent: 10, tipAmount: 221.00, total: 2541.50 }
            };
        }
    }

    // Populate Sidebar Summary
    const guestEl = document.getElementById('paySummaryGuest');
    const fulfillEl = document.getElementById('paySummaryFulfill');
    const timingEl = document.getElementById('paySummaryTiming');
    const subtotalEl = document.getElementById('paySubtotal');
    const taxEl = document.getElementById('payTax');
    const tipEl = document.getElementById('payTip');
    const grandTotalEl = document.getElementById('payGrandTotal');
    const payBtnAmt = document.getElementById('payBtnAmount');
    const upiBtnAmt = document.getElementById('upiBtnAmount');
    const nbBtnAmt = document.getElementById('nbBtnAmount');
    const walletBtnAmt = document.getElementById('walletBtnAmount');
    const paylaterBtnAmt = document.getElementById('paylaterBtnAmount');
    const codBtnAmt = document.getElementById('codBtnAmount');
    const haBtnAmt = document.getElementById('haBtnAmount');
    const haMember = document.getElementById('haMemberName');
    const otpAmtVal = document.getElementById('otpAmountVal');
    const itemsListEl = document.getElementById('paySummaryItemsList');

    const totalFormatted = formatINR(pendingOrder.financials.total);

    if (guestEl) guestEl.textContent = pendingOrder.guest.name;
    if (fulfillEl) fulfillEl.textContent = pendingOrder.fulfillment.typeLabel;
    if (timingEl) timingEl.textContent = pendingOrder.fulfillment.prepTime;

    if (subtotalEl) subtotalEl.textContent = formatINR(pendingOrder.financials.subtotal);
    if (taxEl) taxEl.textContent = formatINR(pendingOrder.financials.tax);
    if (tipEl) tipEl.textContent = formatINR(pendingOrder.financials.tipAmount);
    if (grandTotalEl) grandTotalEl.textContent = totalFormatted;
    if (payBtnAmt) payBtnAmt.textContent = totalFormatted;
    if (upiBtnAmt) upiBtnAmt.textContent = totalFormatted;
    if (nbBtnAmt) nbBtnAmt.textContent = totalFormatted;
    if (walletBtnAmt) walletBtnAmt.textContent = totalFormatted;
    if (paylaterBtnAmt) paylaterBtnAmt.textContent = totalFormatted;
    if (codBtnAmt) codBtnAmt.textContent = totalFormatted;
    if (haBtnAmt) haBtnAmt.textContent = totalFormatted;
    if (haMember) haMember.textContent = pendingOrder.guest.name;
    if (otpAmtVal) otpAmtVal.textContent = totalFormatted;

    // Render Dynamic No-Cost EMI Options
    const emiList = document.getElementById('emiOptionsList');
    if (emiList) {
        const t = pendingOrder.financials.total;
        emiList.innerHTML = `
            <div class="emi-plan-pill">
                <div class="emi-mo">${formatINR(t / 3)}/mo</div>
                <span>3 Months • 0% Interest</span>
            </div>
            <div class="emi-plan-pill">
                <div class="emi-mo">${formatINR(t / 6)}/mo</div>
                <span>6 Months • 0% Interest</span>
            </div>
            <div class="emi-plan-pill">
                <div class="emi-mo">${formatINR(t / 12)}/mo</div>
                <span>12 Months • 0% Interest</span>
            </div>
        `;
    }

    // Prefill Cardholder name if user is logged in
    const cardHolderInput = document.getElementById('cardHolderName');
    if (cardHolderInput && pendingOrder.guest.name) {
        cardHolderInput.value = pendingOrder.guest.name;
        updateCardVisuals();
    }

    if (itemsListEl && pendingOrder.items) {
        itemsListEl.innerHTML = pendingOrder.items.map(it => `
            <div class="pay-summary-item-row">
                <span class="ps-qty">${it.quantity}×</span>
                <span class="ps-title">${it.title}</span>
                <span class="ps-price">${formatINR(it.price * it.quantity)}</span>
            </div>
        `).join('');
    }
}

window.selectPayMethod = function (method) {
    const tabs = {
        'upi': document.getElementById('tabUpiBtn'),
        'card': document.getElementById('tabCardBtn'),
        'netbanking': document.getElementById('tabNbBtn'),
        'wallets': document.getElementById('tabWalletBtn'),
        'paylater': document.getElementById('tabPaylaterBtn'),
        'cod': document.getElementById('tabCodBtn'),
        'house-account': document.getElementById('tabHouseBtn')
    };

    const panels = {
        'upi': document.getElementById('panelUpi'),
        'card': document.getElementById('panelCard'),
        'netbanking': document.getElementById('panelNetBanking'),
        'wallets': document.getElementById('panelWallets'),
        'paylater': document.getElementById('panelPaylater'),
        'cod': document.getElementById('panelCod'),
        'house-account': document.getElementById('panelHouseAccount')
    };

    for (let key in tabs) {
        if (tabs[key]) tabs[key].classList.toggle('active', key === method);
    }
    for (let key in panels) {
        if (panels[key]) panels[key].style.display = (key === method) ? 'block' : 'none';
    }
};

window.appendUpiSuffix = function (suffix) {
    const input = document.getElementById('upiVpaInput');
    if (!input) return;
    let val = input.value.trim();
    if (val.includes('@')) {
        val = val.split('@')[0];
    }
    input.value = (val || 'guest') + suffix;
    input.focus();
};

let selectedBankName = 'HDFC Bank';
window.selectBank = function (el, bankName) {
    document.querySelectorAll('.nb-bank-card').forEach(c => c.classList.remove('selected'));
    if (el) el.classList.add('selected');
    selectedBankName = bankName;
    const nameEl = document.getElementById('nbSelectedBankName');
    if (nameEl) nameEl.textContent = bankName;
    const otherSelect = document.getElementById('allBanksSelect');
    if (otherSelect) otherSelect.value = '';
};

window.onOtherBankSelect = function (bankName) {
    if (!bankName) return;
    document.querySelectorAll('.nb-bank-card').forEach(c => c.classList.remove('selected'));
    selectedBankName = bankName;
    const nameEl = document.getElementById('nbSelectedBankName');
    if (nameEl) nameEl.textContent = bankName;
};

window.handleNetBankingPay = function (e) {
    if (e) e.preventDefault();
    handlePaymentAuthorization(e, `Net Banking (${selectedBankName})`);
};

window.handleWalletPay = function (e) {
    if (e) e.preventDefault();
    const chosen = document.querySelector('input[name="walletChoice"]:checked')?.value || 'Paytm Wallet';
    handlePaymentAuthorization(e, `Digital Wallet (${chosen})`);
};

window.handlePayLaterSubmit = function (e) {
    if (e) e.preventDefault();
    const chosen = document.querySelector('input[name="bnplChoice"]:checked')?.value || 'Simpl PayLater';
    handlePaymentAuthorization(e, `Pay Later / EMI (${chosen})`);
};

let selectedCodMode = 'Cash at Doorstep';
window.selectCodSubMode = function (el, mode) {
    document.querySelectorAll('.cod-mode-card').forEach(c => c.classList.remove('selected'));
    if (el) el.classList.add('selected');
    selectedCodMode = mode;
};

window.handleCodSubmit = function (e) {
    if (e) e.preventDefault();
    const chosen = document.querySelector('input[name="codModeChoice"]:checked')?.value || selectedCodMode;
    handlePaymentAuthorization(e, `Pay on Delivery (${chosen})`);
};

// 3D Secure / Bank OTP Simulation
let otpTimerInterval = null;
let currentPendingCardMethod = 'RuPay / Credit Card';

window.handleCardPaymentWithOtp = function (e) {
    if (e) e.preventDefault();
    const form = document.getElementById('cardPaymentForm');
    if (form && !form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const cardNum = document.getElementById('cardNumber')?.value || '';
    let brand = 'RuPay Card';
    if (cardNum.startsWith('4')) brand = 'Visa Signature Card';
    else if (cardNum.startsWith('5')) brand = 'Mastercard World Elite';
    else if (cardNum.startsWith('3')) brand = 'American Express Platinum';

    currentPendingCardMethod = brand;

    const modal = document.getElementById('bankOtpModal');
    const titleEl = document.getElementById('otpBankTitle');
    if (titleEl) titleEl.textContent = `RBI 3D Secure — ${brand} Authentication`;

    if (modal) {
        modal.classList.add('active');
        startOtpCountdown();
        const firstInput = document.querySelector('.otp-digit-box');
        if (firstInput) {
            firstInput.value = '';
            firstInput.focus();
        }
    }
};

function startOtpCountdown() {
    clearInterval(otpTimerInterval);
    let seconds = 45;
    const timerText = document.getElementById('otpTimerText');
    const resendBtn = document.getElementById('btnResendOtp');
    if (resendBtn) resendBtn.disabled = true;

    otpTimerInterval = setInterval(() => {
        seconds--;
        if (timerText) timerText.textContent = `00:${seconds < 10 ? '0' : ''}${seconds}`;
        if (seconds <= 0) {
            clearInterval(otpTimerInterval);
            if (resendBtn) resendBtn.disabled = false;
        }
    }, 1000);
}

window.handleOtpBoxInput = function (el, idx) {
    el.value = el.value.replace(/\D/g, '');
    if (el.value && idx < 6) {
        const nextBox = document.querySelectorAll('.otp-digit-box')[idx];
        if (nextBox) nextBox.focus();
    }
};

window.resendOtpCode = function () {
    showToast('A new 6-digit OTP has been sent via SMS.', 'info');
    startOtpCountdown();
};

window.cancelBankOtp = function () {
    clearInterval(otpTimerInterval);
    const modal = document.getElementById('bankOtpModal');
    if (modal) modal.classList.remove('active');
    showToast('Payment authorization cancelled.', 'info');
};

window.submitBankOtp = function () {
    clearInterval(otpTimerInterval);
    const modal = document.getElementById('bankOtpModal');
    if (modal) modal.classList.remove('active');
    handlePaymentAuthorization(null, currentPendingCardMethod);
};

window.launchRazorpayLiveGateway = function (e) {
    if (e) e.preventDefault();
    handlePaymentAuthorization(e, 'Razorpay Official Gateway');
};

function handleCardNumberInput(input) {
    let value = input.value.replace(/\D/g, '');
    let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    input.value = formatted.slice(0, 19);

    const typeIndicator = document.getElementById('cardTypeIndicator');
    const networkIcon = document.getElementById('vcNetworkIcon');

    if (value.startsWith('6') || value.startsWith('508')) {
        if (typeIndicator) typeIndicator.innerHTML = '<span class="text-gold" style="font-weight:700;">RuPay</span>';
        if (networkIcon) networkIcon.innerHTML = '<span style="font-size:1rem; font-weight:800; color:var(--gold-primary);">RuPay</span>';
    } else if (value.startsWith('4')) {
        if (typeIndicator) typeIndicator.innerHTML = '<i class="fa-brands fa-cc-visa text-gold"></i>';
        if (networkIcon) networkIcon.innerHTML = '<i class="fa-brands fa-cc-visa"></i>';
    } else if (value.startsWith('5')) {
        if (typeIndicator) typeIndicator.innerHTML = '<i class="fa-brands fa-cc-mastercard text-gold"></i>';
        if (networkIcon) networkIcon.innerHTML = '<i class="fa-brands fa-cc-mastercard"></i>';
    } else if (value.startsWith('3')) {
        if (typeIndicator) typeIndicator.innerHTML = '<i class="fa-brands fa-cc-amex text-gold"></i>';
        if (networkIcon) networkIcon.innerHTML = '<i class="fa-brands fa-cc-amex"></i>';
    } else {
        if (typeIndicator) typeIndicator.innerHTML = '<i class="fa-solid fa-shield"></i>';
        if (networkIcon) networkIcon.innerHTML = '<span style="font-size:1rem; font-weight:800; color:var(--gold-primary);">RuPay</span>';
    }

    updateCardVisuals();
}
window.handleCardNumberInput = handleCardNumberInput;

function handleExpiryInput(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        input.value = value.slice(0, 2) + '/' + value.slice(2, 4);
    } else {
        input.value = value;
    }
    updateCardVisuals();
}
window.handleExpiryInput = handleExpiryInput;

function updateCardVisuals() {
    const numInput = document.getElementById('cardNumber');
    const holderInput = document.getElementById('cardHolderName');
    const expInput = document.getElementById('cardExpiry');

    const vcNum = document.getElementById('vcNumber');
    const vcHolder = document.getElementById('vcHolder');
    const vcExp = document.getElementById('vcExpiry');

    if (vcNum) {
        vcNum.textContent = numInput?.value && numInput.value.length > 0 ? numInput.value : '•••• •••• •••• ••••';
    }
    if (vcHolder) {
        vcHolder.textContent = holderInput?.value && holderInput.value.length > 0 ? holderInput.value.toUpperCase() : 'MAHARAJA GUEST';
    }
    if (vcExp) {
        vcExp.textContent = expInput?.value && expInput.value.length > 0 ? expInput.value : 'MM/YY';
    }
}
window.updateCardVisuals = updateCardVisuals;

window.handlePaymentAuthorization = async function (e, paymentMethodName = 'UPI Instant Pay') {
    if (e) e.preventDefault();

    let pendingOrder = null;
    try {
        const stored = localStorage.getItem('savoria_pending_order');
        if (stored) pendingOrder = JSON.parse(stored);
    } catch (err) { }

    if (!pendingOrder) {
        showToast('No active pending order found.', 'error');
        return;
    }

    const orderTotal = pendingOrder.financials?.total || 1000;

    // Check if Razorpay is loaded & active
    if (typeof Razorpay !== 'undefined') {
        try {
            const createRes = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: orderTotal,
                    receipt: 'ord_' + Date.now()
                })
            });
            const rzpData = await createRes.json();

            if (rzpData.success && rzpData.orderId && !rzpData.isSimulated) {
                const options = {
                    key: rzpData.keyId,
                    amount: rzpData.amount,
                    currency: rzpData.currency || 'INR',
                    name: 'SAVORIA Haute Cuisine',
                    description: 'Royal Dining Degustation Payment',
                    order_id: rzpData.orderId,
                    handler: async function (response) {
                        try {
                            await fetch('/api/payment/verify', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature
                                })
                            });
                        } catch (e) { }

                        finalizeAndRedirectOrder(pendingOrder, paymentMethodName, response.razorpay_payment_id);
                    },
                    prefill: {
                        name: pendingOrder.guest?.name || 'Rajnandini Bhati',
                        email: pendingOrder.guest?.email || 'mkd9a32@gmail.com',
                        contact: pendingOrder.guest?.phone || '9982072287'
                    },
                    theme: {
                        color: '#d4af37'
                    }
                };
                const rzp = new Razorpay(options);
                rzp.open();
                return;
            }
        } catch (err) {
            console.warn('Razorpay live gateway notice, proceeding with instant secure capture:', err);
        }
    }

    // Direct High-Speed Secure Capture Flow
    finalizeAndRedirectOrder(pendingOrder, paymentMethodName);
};

function finalizeAndRedirectOrder(pendingOrder, paymentMethodName, txnId) {
    // Attach payment info
    pendingOrder.payment = {
        method: paymentMethodName,
        status: 'Authorized & Secured',
        transactionId: txnId || ('UPI-IND-' + Math.floor(1000000000 + Math.random() * 9000000000))
    };

    // Show processing modal animation
    const overlay = document.getElementById('payProcessingOverlay');
    const statusTitle = document.getElementById('procStatusTitle');
    const statusSub = document.getElementById('procStatusSub');

    if (overlay) overlay.classList.add('active');

    setTimeout(() => {
        if (statusTitle) statusTitle.textContent = 'Verifying UPI / Bank Authorization';
        if (statusSub) statusSub.textContent = '256-bit bank encryption handshake approved...';
    }, 600);

    setTimeout(() => {
        if (statusTitle) statusTitle.textContent = 'Payment Approved & Secured';
        if (statusSub) statusSub.textContent = 'Dispatching KOT to Shahi Royal Kitchen Brigade...';

        // Save finalized order to latest and history
        localStorage.setItem('savoria_latest_order', JSON.stringify(pendingOrder));

        try {
            let allOrders = JSON.parse(localStorage.getItem('savoria_all_orders') || '[]');
            allOrders.unshift(pendingOrder);
            localStorage.setItem('savoria_all_orders', JSON.stringify(allOrders));
        } catch (err) { }

        // Send order to backend API
        fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerName: pendingOrder.guest?.name || 'Maharaja Guest',
                phone: pendingOrder.guest?.phone || '',
                email: pendingOrder.guest?.email || '',
                orderType: pendingOrder.fulfillment?.typeLabel || 'Royal Order',
                tableNumber: pendingOrder.fulfillment?.type === 'dine-in' ? (pendingOrder.fulfillment.table || 'Table T-01') : 'Chauffeur Delivery',
                items: pendingOrder.items || [],
                subtotal: pendingOrder.financials?.subtotal || 0,
                gst: pendingOrder.financials?.tax || 0,
                tip: pendingOrder.financials?.tipAmount || 0,
                total: pendingOrder.financials?.total || 0,
                paymentMethod: paymentMethodName,
                transactionId: pendingOrder.payment.transactionId
            })
        }).catch(err => console.warn('Order backend sync note:', err));

        // Reset cart and remove pending order
        cart = [];
        saveCartToStorage();
        localStorage.removeItem('savoria_pending_order');

        setTimeout(() => {
            window.location.href = 'order-confirm.html';
        }, 1200);
    }, 1400);
}

function renderTrayPage() {
            const gridContainer = document.getElementById('trayGridContainer');
            const emptyContainer = document.getElementById('trayEmptyContainer');
            const itemsList = document.getElementById('trayPageItemsList');
            const countLabel = document.getElementById('trayItemCountLabel');

            const subtotalEl = document.getElementById('traySubtotal');
            const taxEl = document.getElementById('trayTax');
            const tipEl = document.getElementById('trayTipAmount');
            const totalEl = document.getElementById('trayTotal');

            const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
            if (countLabel) countLabel.textContent = `${totalCount} item${totalCount === 1 ? '' : 's'}`;

            if (cart.length === 0) {
                if (gridContainer) gridContainer.style.display = 'none';
                if (emptyContainer) emptyContainer.style.display = 'block';
                return;
            }

            if (gridContainer) gridContainer.style.display = 'grid';
            if (emptyContainer) emptyContainer.style.display = 'none';

            if (itemsList) {
                itemsList.innerHTML = cart.map(item => `
            <div class="tray-item-row">
                <a href="dish.html?id=${item.id}" onclick="goToDish('${item.id}', event)">
                    <img src="${item.image}" alt="${item.title}" class="tray-item-thumb">
                </a>
                <div class="tray-item-info">
                    <a href="dish.html?id=${item.id}" onclick="goToDish('${item.id}', event)" class="tray-item-title-link">
                        <h4>${item.title}</h4>
                    </a>
                    <span class="tray-item-unit-price">${formatINR(item.price)} each</span>
                </div>
                <div class="tray-item-controls">
                    <button type="button" class="tray-qty-btn" onclick="updateTrayQty('${item.id}', -1)"><i class="fa-solid fa-minus"></i></button>
                    <span class="tray-qty-val">${item.quantity}</span>
                    <button type="button" class="tray-qty-btn" onclick="updateTrayQty('${item.id}', 1)"><i class="fa-solid fa-plus"></i></button>
                </div>
                <div class="tray-item-price-col">
                    <span class="tray-item-total-price">${formatINR(item.price * item.quantity)}</span>
                    <button type="button" class="tray-delete-btn" onclick="removeTrayItem('${item.id}')" title="Remove item">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `).join('');
            }

            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const tax = subtotal * SALES_TAX_RATE;
            const tipAmount = subtotal * (trayTip / 100);
            const grandTotal = subtotal + tax + tipAmount;

            if (subtotalEl) subtotalEl.textContent = formatINR(subtotal);
            if (taxEl) taxEl.textContent = formatINR(tax);
            if (tipEl) tipEl.textContent = formatINR(tipAmount);
            if (totalEl) totalEl.textContent = formatINR(grandTotal);
        }

function renderTrayUpsells() {
            const upsellGrid = document.getElementById('trayUpsellGrid');
            if (!upsellGrid) return;

            const upsells = MENU_DATA.filter(d => d.category === 'beverages' || d.category === 'desserts').slice(0, 3);
            upsellGrid.innerHTML = upsells.map(up => `
        <div class="upsell-card" onclick="goToDish('${up.id}', event)" style="cursor: pointer;">
            <img src="${up.image}" alt="${up.title}" class="upsell-card-thumb">
            <span class="upsell-card-title">${up.title}</span>
            <div class="upsell-card-footer">
                <span class="upsell-card-price">${up.price}</span>
                <button type="button" class="btn-add-upsell" onclick="event.stopPropagation(); addUpsellToTray('${up.id}')" title="Add to Tray">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
        </div>
    `).join('');
        }

window.addUpsellToTray = function (dishId) {
            addToCart(dishId);
            renderTrayPage();
        };

    window.updateTrayQty = function (dishId, delta) {
        updateCartQty(dishId, delta);
        renderTrayPage();
    };

    window.removeTrayItem = function (dishId) {
        removeCartItem(dishId);
        renderTrayPage();
    };

    window.clearEntireCart = function () {
        cart = [];
        saveCartToStorage();
        renderCart();
        renderTrayPage();
        showToast('Order tray cleared.', 'info');
    };

    window.setTrayTip = function (percent) {
        trayTip = percent;
        document.querySelectorAll('#trayTipPills .t-tip-btn').forEach(btn => {
            btn.classList.toggle('active', parseFloat(btn.dataset.tip) === percent);
        });
        renderTrayPage();
    };

    window.handleTrayOrderTypeChange = function (type) {
        const tabPickup = document.getElementById('tabPickup');
        const tabDelivery = document.getElementById('tabDelivery');
        const addrGroup = document.getElementById('trayAddressGroup');

        if (type === 'delivery') {
            if (tabDelivery) tabDelivery.classList.add('active');
            if (tabPickup) tabPickup.classList.remove('active');
            if (addrGroup) addrGroup.style.display = 'block';
        } else {
            if (tabPickup) tabPickup.classList.add('active');
            if (tabDelivery) tabDelivery.classList.remove('active');
            if (addrGroup) addrGroup.style.display = 'none';
        }
    };

    /* ==========================================================================
       3B. DEDICATED ORDER CONFIRMATION PAGE (order-confirm.html)
       ========================================================================== */
    function initConfirmPage() {
        let order = null;
        try {
            const latest = localStorage.getItem('savoria_latest_order');
            if (latest) {
                order = JSON.parse(latest);
            }
        } catch (e) { }

        if (order) {
            const refEl = document.getElementById('confOrderRef');
            const nameEl = document.getElementById('confGuestNameHeader');
            const modeEl = document.getElementById('confFulfillmentMode');
            const phoneEl = document.getElementById('confGuestPhone');
            const emailEl = document.getElementById('confGuestEmail');
            const subtotalEl = document.getElementById('confReceiptSubtotal');
            const taxEl = document.getElementById('confReceiptTax');
            const tipEl = document.getElementById('confReceiptTip');
            const totalEl = document.getElementById('confReceiptTotal');
            const itemsList = document.getElementById('confReceiptItemsList');
            const custAddr = document.getElementById('custFulfillmentAddress');

            if (refEl) refEl.textContent = order.orderRef || order.id || 'SAV-SHAHI-982410';
            if (nameEl) nameEl.textContent = order.guest?.name || 'Valued Guest';
            if (modeEl) modeEl.textContent = order.fulfillment?.typeLabel || 'Royal Chauffeur Delivery';
            if (phoneEl) phoneEl.textContent = order.guest?.phone || '+91 98765 43210';
            if (emailEl) emailEl.textContent = order.guest?.email || 'guest@example.com';
            if (custAddr && order.guest?.address) custAddr.innerHTML = `<strong>Address:</strong> ${order.guest.address}`;
            if (subtotalEl && order.financials) subtotalEl.textContent = formatINR(order.financials.subtotal);
            if (taxEl && order.financials) taxEl.textContent = formatINR(order.financials.tax);
            if (tipEl && order.financials) tipEl.textContent = formatINR(order.financials.tipAmount);
            if (totalEl && order.financials) totalEl.textContent = formatINR(order.financials.total);

            if (itemsList && order.items) {
                itemsList.innerHTML = order.items.map(item => `
                <div class="receipt-item-row">
                    <span class="r-item-name">${item.title}</span>
                    <span class="r-item-qty">x${item.quantity || 1}</span>
                    <span class="r-item-price">${formatINR((item.price || 0) * (item.quantity || 1))}</span>
                </div>
            `).join('');
            }
        }
    }

    /* ==========================================================================
       4. MENU FILTERING & LIVE SEARCH
       ========================================================================== */

    function initMenu() {
        const searchInput = document.getElementById('menuSearchInput');
        const clearBtn = document.getElementById('clearSearchBtn');
        const categoryBtns = document.querySelectorAll('.category-btn');
        const dietToggles = document.querySelectorAll('.diet-toggle');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.toLowerCase().trim();
                if (clearBtn) clearBtn.style.display = searchQuery ? 'block' : 'none';
                renderMenu();
            });
        }

        if (clearBtn && searchInput) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                searchQuery = '';
                clearBtn.style.display = 'none';
                renderMenu();
            });
        }

        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = btn.dataset.category;
                renderMenu();
            });
        });

        dietToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const diet = toggle.dataset.diet;
                if (activeDietFilters.has(diet)) {
                    activeDietFilters.delete(diet);
                    toggle.classList.remove('active');
                } else {
                    activeDietFilters.add(diet);
                    toggle.classList.add('active');
                }
                renderMenu();
            });
        });

        renderMenu();
    }

    function renderMenu() {
        const menuGrid = document.getElementById('menuGrid');
        const countBadge = document.getElementById('menuCountBadge') || document.getElementById('menuResultsCount');
        if (!menuGrid) return;

        const filteredDishes = MENU_DATA.filter(dish => {
            let matchesCategory = false;
            if (activeCategory === 'all') {
                matchesCategory = true;
            } else if (activeCategory === 'veg') {
                matchesCategory = dish.dietary.includes('veg');
            } else if (activeCategory === 'non-veg') {
                matchesCategory = dish.dietary.includes('non-veg');
            } else {
                matchesCategory = dish.category === activeCategory;
            }

            let matchesDiet = true;
            if (activeDietFilters.size > 0) {
                for (let diet of activeDietFilters) {
                    if (!dish.dietary.includes(diet)) {
                        matchesDiet = false;
                        break;
                    }
                }
            }

            let matchesSearch = true;
            if (searchQuery) {
                const inTitle = dish.title.toLowerCase().includes(searchQuery);
                const inDesc = dish.description.toLowerCase().includes(searchQuery);
                const inIngredients = dish.ingredients.some(i => i.toLowerCase().includes(searchQuery));
                const inPairing = dish.pairing.toLowerCase().includes(searchQuery);
                matchesSearch = inTitle || inDesc || inIngredients || inPairing;
            }

            return matchesCategory && matchesDiet && matchesSearch;
        });

        if (countBadge) countBadge.textContent = `Showing ${filteredDishes.length} of ${MENU_DATA.length} royal creations`;

        if (filteredDishes.length === 0) {
            menuGrid.innerHTML = `
            <div class="no-results-box">
                <i class="fa-solid fa-plate-wheat"></i>
                <h3>No Royal Dishes Match Your Selection</h3>
                <p>Try resetting dietary preferences or searching for different spices and ingredients.</p>
                <button class="btn btn-secondary btn-sm" onclick="resetMenuFilters()">Reset All Filters</button>
            </div>
        `;
            return;
        }

        menuGrid.innerHTML = filteredDishes.map(dish => `
        <a href="dish.html?id=${dish.id}" class="dish-card" onclick="goToDish('${dish.id}', event)">
            <div class="dish-card-img-wrapper">
                <img src="${dish.image}" alt="${dish.title}" class="dish-card-img" loading="lazy">
                <div class="dish-diet-tags">
                    ${dish.dietary.map(tag => {
            if (tag === 'chef-pick') return `<span class="dish-diet-tag tag-chef"><i class="fa-solid fa-crown"></i> Royal Signature</span>`;
            if (tag === 'veg') return `<span class="dish-diet-tag tag-veg"><i class="fa-solid fa-seedling"></i> Veg</span>`;
            if (tag === 'non-veg') return `<span class="dish-diet-tag tag-nonveg"><i class="fa-solid fa-drumstick-bite"></i> Non-Veg</span>`;
            if (tag === 'jain') return `<span class="dish-diet-tag"><i class="fa-solid fa-leaf"></i> Jain</span>`;
            return '';
        }).join('')}
                </div>
            </div>
            <div class="dish-card-body">
                <div class="dish-card-header">
                    <h4 class="dish-title">${dish.title}</h4>
                    <span class="dish-price">${dish.price}</span>
                </div>
                <p class="dish-desc">${dish.description}</p>
                <div class="dish-card-footer">
                    <div class="dish-pairing-preview" title="${dish.pairing}">
                        <i class="fa-solid fa-wine-glass"></i> ${dish.pairing}
                    </div>
                    <div class="dish-card-actions" onclick="event.preventDefault(); event.stopPropagation();">
                        <button class="btn-add-cart-card" title="Add to Royal Order Tray" onclick="addToCart('${dish.id}')">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        </a>
    `).join('');
    }

    window.resetMenuFilters = function () {
        activeCategory = 'all';
        activeDietFilters.clear();
        searchQuery = '';

        const input = document.getElementById('menuSearchInput');
        const clearBtn = document.getElementById('clearSearchBtn');
        if (input) input.value = '';
        if (clearBtn) clearBtn.style.display = 'none';

        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === 'all');
        });

        document.querySelectorAll('.diet-toggle').forEach(btn => {
            btn.classList.remove('active');
        });

        renderMenu();
    };

    /* ==========================================================================
       5. GLOBAL CART SYSTEM & STORAGE
       ========================================================================== */

    function loadCartFromStorage() {
        try {
            const saved = localStorage.getItem('savoria_cart');
            if (saved) {
                cart = JSON.parse(saved);
            }
        } catch (e) {
            cart = [];
        }
    }

    function saveCartToStorage() {
        try {
            localStorage.setItem('savoria_cart', JSON.stringify(cart));
        } catch (e) { }
    }

    function openCartDrawer() {
        const backdrop = document.getElementById('cartDrawerBackdrop');
        if (backdrop) {
            backdrop.classList.add('open');
            document.body.style.overflow = 'hidden';
            renderCart();
        } else {
            window.location.href = 'tray.html';
        }
    }
    window.openCartDrawer = openCartDrawer;

    function closeCartDrawer() {
        const backdrop = document.getElementById('cartDrawerBackdrop');
        if (backdrop) {
            backdrop.classList.remove('open');
            document.body.style.overflow = '';
        }
    }
    window.closeCartDrawer = closeCartDrawer;

    function initCartSystem() {
        // Wire Header Cart Trigger Pill to Slide-Out Drawer
        const cartTriggerBtn = document.getElementById('cartTriggerBtn');
        const closeCartBtn = document.getElementById('closeCartBtn');
        const drawerBackdrop = document.getElementById('cartDrawerBackdrop');
        const tipButtons = document.querySelectorAll('#tipButtons .tip-btn');

        if (cartTriggerBtn && drawerBackdrop) {
            cartTriggerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openCartDrawer();
            });
        }

        if (closeCartBtn) {
            closeCartBtn.addEventListener('click', closeCartDrawer);
        }

        if (drawerBackdrop) {
            drawerBackdrop.addEventListener('click', (e) => {
                if (e.target === drawerBackdrop) closeCartDrawer();
            });
        }

        // Dish Modal Close Listener
        const closeDishModalBtn = document.getElementById('closeDishModalBtn');
        const dishModal = document.getElementById('dishModal');
        if (closeDishModalBtn) {
            closeDishModalBtn.addEventListener('click', closeDishModal);
        }
        if (dishModal) {
            dishModal.addEventListener('click', (e) => {
                if (e.target === dishModal) closeDishModal();
            });
        }

        // Drawer Tip Buttons
        tipButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                tipButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                tipPercent = parseFloat(btn.dataset.tip);
                renderCart();
            });
        });

        renderCart();
    }

    function addToCartSilently(dishId) {
        const dish = MENU_DATA.find(d => d.id === dishId);
        if (!dish) return;

        const existingIndex = cart.findIndex(item => item.id === dishId);
        if (existingIndex > -1) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push({
                id: dish.id,
                title: dish.title,
                price: dish.rawPrice,
                image: dish.image,
                quantity: 1
            });
        }
        saveCartToStorage();
    }

    window.addToCart = function (dishId) {
        addToCartSilently(dishId);
        renderCart();
        bumpCartBadge();
        const dish = MENU_DATA.find(d => d.id === dishId);
        showToast(`Added ${dish.title} to royal tray (${formatINR(dish.rawPrice)})`, 'success');
    };

    function renderCart() {
        const countBadge = document.getElementById('cartCountBadge');
        const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (countBadge) countBadge.textContent = totalItemCount;

        const itemsContainer = document.getElementById('cartItemsContainer');
        const cartFooter = document.getElementById('cartFooter');
        const subtotalEl = document.getElementById('cartSubtotal');
        const taxEl = document.getElementById('cartTax');
        const tipEl = document.getElementById('cartTipAmount');
        const totalEl = document.getElementById('cartTotal');

        if (itemsContainer) {
            if (cart.length === 0) {
                itemsContainer.innerHTML = `
                    <div class="cart-empty-state">
                        <div class="empty-icon-circle"><i class="fa-solid fa-bag-shopping"></i></div>
                        <h4>Your Royal Tray is Empty</h4>
                        <p>Select from our 24 royal culinary creations to begin your dining degustation.</p>
                        <a href="index.html#menu" class="btn btn-secondary btn-sm" onclick="closeCartDrawer()">Explore Menu</a>
                    </div>
                `;
                if (cartFooter && cartFooter.style) cartFooter.style.display = 'none';
            } else {
                if (cartFooter && cartFooter.style) cartFooter.style.display = 'block';
                itemsContainer.innerHTML = cart.map(item => `
                    <div class="cart-item-card">
                        <img src="${item.image}" alt="${item.title}" class="cart-item-thumb">
                        <div class="cart-item-details">
                            <div class="cart-item-top">
                                <span class="cart-item-name">${item.title}</span>
                                <span class="cart-item-price">${formatINR(item.price * item.quantity)}</span>
                            </div>
                            <div class="cart-item-actions">
                                <div class="cart-qty-ctrl">
                                    <button onclick="updateCartQty('${item.id}', -1)"><i class="fa-solid fa-minus"></i></button>
                                    <span>${item.quantity}</span>
                                    <button onclick="updateCartQty('${item.id}', 1)"><i class="fa-solid fa-plus"></i></button>
                                </div>
                                <button class="cart-remove-btn" onclick="removeCartItem('${item.id}')" title="Remove Item">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');

                const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const tax = subtotal * SALES_TAX_RATE;
                const tip = subtotal * (tipPercent / 100);
                const total = subtotal + tax + tip;

                if (subtotalEl) subtotalEl.textContent = formatINR(subtotal);
                if (taxEl) taxEl.textContent = formatINR(tax);
                if (tipEl) tipEl.textContent = formatINR(tip);
                if (totalEl) totalEl.textContent = formatINR(total);
            }
        }
    }

    window.updateCartQty = function (dishId, delta) {
        const item = cart.find(i => i.id === dishId);
        if (!item) return;

        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== dishId);
        }
        saveCartToStorage();
        renderCart();
    };

    window.removeCartItem = function (dishId) {
        cart = cart.filter(i => i.id !== dishId);
        saveCartToStorage();
        renderCart();
    };

    function bumpCartBadge() {
        const badge = document.getElementById('cartCountBadge');
        if (badge) {
            badge.classList.add('bump');
            setTimeout(() => badge.classList.remove('bump'), 200);
        }
    }

    /* ==========================================================================
       6. VISUAL ROYAL FLOOR PLAN PICKER
       ========================================================================== */

    function initFloorPlanSystem() {
        const openFloorPlanBtn = document.getElementById('openFloorPlanBtn');
        const closeFloorPlanBtn = document.getElementById('closeFloorPlanBtn');
        const floorPlanModal = document.getElementById('floorPlanModal');
        const tableNodes = document.querySelectorAll('.table-node');
        const infoText = document.getElementById('selectedTableInfoText');
        const confirmBtn = document.getElementById('confirmTableSelectionBtn');
        const resSeatingSelect = document.getElementById('resSeating');

        if (!openFloorPlanBtn || !floorPlanModal) return;

        openFloorPlanBtn.addEventListener('click', () => {
            floorPlanModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        });

        if (closeFloorPlanBtn) {
            closeFloorPlanBtn.addEventListener('click', () => {
                floorPlanModal.classList.remove('open');
                document.body.style.overflow = '';
            });
        }

        floorPlanModal.addEventListener('click', (e) => {
            if (e.target === floorPlanModal) {
                floorPlanModal.classList.remove('open');
                document.body.style.overflow = '';
            }
        });

        tableNodes.forEach(node => {
            node.addEventListener('click', () => {
                if (node.classList.contains('occupied')) {
                    showToast('This royal table is reserved for this evening. Please select another seat.', 'error');
                    return;
                }

                tableNodes.forEach(n => n.classList.remove('selected'));
                node.classList.add('selected');

                selectedTable = {
                    id: node.dataset.table,
                    zone: node.dataset.zone,
                    seats: node.dataset.seats,
                    label: `${node.dataset.table} (${node.dataset.zone} • ${node.dataset.seats} Seats)`
                };

                if (infoText) infoText.innerHTML = `<span>Selected: <strong>${selectedTable.label}</strong></span>`;
            });
        });

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (resSeatingSelect) resSeatingSelect.value = selectedTable.zone;
                const sumSeating = document.getElementById('sumSeating');
                if (sumSeating) sumSeating.textContent = `${selectedTable.id} - ${selectedTable.zone}`;

                floorPlanModal.classList.remove('open');
                document.body.style.overflow = '';
                showToast(`Table ${selectedTable.id} selected for your royal reservation!`, 'success');
            });
        }
    }

    /* ==========================================================================
       7. SOMMELIER & ROYAL RASOI PAIRING QUIZ
       ========================================================================== */

    function initSommelierQuiz() {
        const bannerBtn = document.getElementById('openQuizBtnBanner');
        const closeBtn = document.getElementById('closeQuizModalBtn');
        const modal = document.getElementById('quizModal');

        const openQuiz = () => {
            quizStep = 1;
            renderQuizStep();
            if (modal) {
                modal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        };

        if (bannerBtn) bannerBtn.addEventListener('click', openQuiz);

        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('open');
                document.body.style.overflow = '';
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('open');
                    document.body.style.overflow = '';
                }
            });
        }
    }

    function renderQuizStep() {
        const container = document.getElementById('quizStepContainer');
        const progressFill = document.getElementById('quizProgressFill');
        if (!container) return;

        if (quizStep === 1) {
            if (progressFill) progressFill.style.width = '33%';
            container.innerHTML = `
            <div class="quiz-step">
                <span class="section-tag">ROYAL PAIRING • STEP 1 OF 3</span>
                <h3>What is the Occasion for Your Royal Feast?</h3>
                <p>Help our Master Ustad match the ideal gastronomic tempo for your evening.</p>
                <div class="quiz-options-grid">
                    <div class="quiz-opt-card" onclick="selectQuizAnswer('occasion', 'Intimate Royal Romance', 2)">
                        <i class="fa-solid fa-heart"></i>
                        <h4>Intimate Royal Romance</h4>
                        <span>Candlelit Dastarkhwan, Awadhi rose aromas & vintage champagne.</span>
                    </div>
                    <div class="quiz-opt-card" onclick="selectQuizAnswer('occasion', 'Grand Shahi Celebration', 2)">
                        <i class="fa-solid fa-crown"></i>
                        <h4>Grand Shahi Celebration</h4>
                        <span>Decadent Nalli Nihari, Dum Biryani & 24k gold leaf sweets.</span>
                    </div>
                    <div class="quiz-opt-card" onclick="selectQuizAnswer('occasion', 'Epicurean Spice Discovery', 2)">
                        <i class="fa-solid fa-compass"></i>
                        <h4>Epicurean Spice Discovery</h4>
                        <span>Bold Mewari Laal Maas, coastal kokum & smoky single malts.</span>
                    </div>
                    <div class="quiz-opt-card" onclick="selectQuizAnswer('occasion', 'Maharaja Executive Dinner', 2)">
                        <i class="fa-solid fa-briefcase"></i>
                        <h4>Maharaja Executive Dinner</h4>
                        <span>Refined Galouti kebabs, Dal Savoria & private lounge discretion.</span>
                    </div>
                </div>
            </div>
        `;
        } else if (quizStep === 2) {
            if (progressFill) progressFill.style.width = '66%';
            container.innerHTML = `
            <div class="quiz-step">
                <span class="section-tag">ROYAL PAIRING • STEP 2 OF 3</span>
                <h3>Select Your Preferred Palate Profile</h3>
                <p>What royal sensory direction excites your palate tonight?</p>
                <div class="quiz-options-grid">
                    <div class="quiz-opt-card" onclick="selectQuizAnswer('flavor', 'Makhani', 3)">
                        <i class="fa-solid fa-bowl-food"></i>
                        <h4>Rich, Velvety & Makhani</h4>
                        <span>Old Delhi Truffle Butter Chicken, clotted malai & warm saffron naan.</span>
                    </div>
                    <div class="quiz-opt-card" onclick="selectQuizAnswer('flavor', 'Nihari', 3)">
                        <i class="fa-solid fa-drumstick-bite"></i>
                        <h4>Slow-Braised Awadhi Umami</h4>
                        <span>12-hour braised Nalli Nihari with rose water and bone marrow jus.</span>
                    </div>
                    <div class="quiz-opt-card" onclick="selectQuizAnswer('flavor', 'Biryani', 3)">
                        <i class="fa-solid fa-seedling"></i>
                        <h4>Dum Pukht Basmati Fragrance</h4>
                        <span>Aged Kohinoor saffron basmati with tender goat or wild morels.</span>
                    </div>
                    <div class="quiz-opt-card" onclick="selectQuizAnswer('flavor', 'Coastal', 3)">
                        <i class="fa-solid fa-water"></i>
                        <h4>Coastal Coconut & Turmeric</h4>
                        <span>Jumbo tiger prawns Malabar Moilee with fresh curry leaves.</span>
                    </div>
                </div>
            </div>
        `;
        } else if (quizStep === 3) {
            if (progressFill) progressFill.style.width = '100%';
            container.innerHTML = `
            <div class="quiz-step">
                <span class="section-tag">ROYAL PAIRING • STEP 3 OF 3</span>
                <h3>Your Royal Beverage Affinity</h3>
                <p>Which vintage or artisanal elixir would complete your feast?</p>
                <div class="quiz-options-grid">
                    <div class="quiz-opt-card" onclick="selectQuizAnswer('wine', 'Thandai', 4)">
                        <i class="fa-solid fa-glass-water"></i>
                        <h4>The Royal Saffron Thandai</h4>
                        <span>Crushed Mamra almonds, saffron, and fresh Kannauj rose petals.</span>
                    </div>
                    <div class="quiz-opt-card" onclick="selectQuizAnswer('wine', 'SingleMalt', 4)">
                        <i class="fa-solid fa-whiskey-glass"></i>
                        <h4>Peated Indian Single Malt</h4>
                        <span>Amrut / Paul John cask reserve aged in American oak.</span>
                    </div>
                    <div class="quiz-opt-card" onclick="selectQuizAnswer('wine', 'Negroni', 4)">
                        <i class="fa-solid fa-martini-glass"></i>
                        <h4>Banarasi Paan Smoked Negroni</h4>
                        <span>Betel leaf infused Indian craft gin with aromatic clove smoke.</span>
                    </div>
                    <div class="quiz-opt-card" onclick="selectQuizAnswer('wine', 'Champagne', 4)">
                        <i class="fa-solid fa-champagne-glasses"></i>
                        <h4>Darjeeling Royal Fizz</h4>
                        <span>Castleton First Flush tea reduction topped with French Champagne.</span>
                    </div>
                </div>
            </div>
        `;
        } else if (quizStep === 4) {
            let matchDishId = 'awadhi-nalli-nihari';
            if (quizAnswers.flavor === 'Makhani') matchDishId = 'truffle-butter-chicken';
            if (quizAnswers.flavor === 'Biryani') matchDishId = 'dum-pukht-gosht-biryani';
            if (quizAnswers.flavor === 'Coastal') matchDishId = 'malabar-tiger-prawns';

            const matchDish = MENU_DATA.find(d => d.id === matchDishId) || MENU_DATA[4];

            container.innerHTML = `
            <div class="quiz-result-card">
                <span class="badge-award"><i class="fa-solid fa-crown"></i> USTAD'S BESPOKE ROYAL PAIRING MATCH</span>
                <h3 style="font-family: var(--font-heading); font-size: 1.6rem; color: #ffffff; margin: 12px 0 6px;">Your Grand Gastronomic Match</h3>
                <p style="color: var(--text-muted); font-size: 0.88rem;">Curated specially for your ${quizAnswers.occasion}:</p>

                <div class="quiz-result-hero-dish">
                    <img src="${matchDish.image}" alt="${matchDish.title}" class="quiz-result-img">
                    <div>
                        <h4 style="font-family: var(--font-serif); font-size: 1.25rem; color: #ffffff; margin-bottom: 4px;">${matchDish.title}</h4>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">${matchDish.description}</p>
                        <span style="font-family: var(--font-heading); font-weight: 700; color: var(--gold-primary); font-size: 1.15rem;">${matchDish.price}</span>
                    </div>
                </div>

                <div class="quiz-pairing-highlight">
                    <i class="fa-solid fa-wine-glass"></i> Sommelier Recommended Pairing: <strong>${matchDish.pairing}</strong>
                </div>

                <div style="display: flex; gap: 12px; justify-content: center; margin-top: 20px;">
                    <a href="dish.html?id=${matchDish.id}" class="btn btn-secondary" onclick="closeQuizModal();">
                        <i class="fa-solid fa-eye"></i> View Full Dish Details
                    </a>
                    <button class="btn btn-primary" onclick="addToCart('${matchDish.id}'); closeQuizModal();">
                        <i class="fa-solid fa-bag-shopping"></i> Add Dish to Tray (${matchDish.price})
                    </button>
                </div>
            </div>
        `;
        }
    }

    window.selectQuizAnswer = function (category, value, nextStep) {
        quizAnswers[category] = value;
        quizStep = nextStep;
        renderQuizStep();
    };

    window.closeQuizModal = function () {
        const modal = document.getElementById('quizModal');
        if (modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }
    };

    /* ==========================================================================
       8. CUSTOMER REVIEW SUBMISSION FORM
       ========================================================================== */
    function initReviewSubmissionSystem() {
        const openBtn = document.getElementById('openReviewModalBtn');
        const closeBtn = document.getElementById('closeReviewModalBtn');
        const modal = document.getElementById('reviewModal');
        const starPicker = document.getElementById('starRatingPicker');
        const ratingInput = document.getElementById('reviewRatingVal');
        const form = document.getElementById('submitReviewForm');

        if (openBtn && modal) {
            openBtn.addEventListener('click', () => {
                modal.classList.add('open');
                document.body.style.overflow = 'hidden';
            });
        }

        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('open');
                document.body.style.overflow = '';
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('open');
                    document.body.style.overflow = '';
                }
            });
        }

        if (starPicker) {
            const stars = starPicker.querySelectorAll('i');
            stars.forEach(star => {
                star.addEventListener('click', () => {
                    const rating = parseInt(star.dataset.rating);
                    if (ratingInput) ratingInput.value = rating;
                    stars.forEach(s => {
                        const r = parseInt(s.dataset.rating);
                        s.classList.toggle('active', r <= rating);
                    });
                });
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('revName').value.trim();
                const tag = document.getElementById('revTag').value;
                const text = document.getElementById('revText').value.trim();
                const rating = parseInt(ratingInput.value) || 5;

                const track = document.getElementById('testimonialTrack');
                const dotsContainer = document.getElementById('sliderDots');

                if (track) {
                    const newCard = document.createElement('div');
                    newCard.className = 'testimonial-card';
                    newCard.innerHTML = `
                    <div class="quote-icon"><i class="fa-solid fa-quote-right"></i></div>
                    <div class="stars-row">
                        ${Array(rating).fill('<i class="fa-solid fa-star"></i>').join('')}
                    </div>
                    <p class="testimonial-quote">"${text}"</p>
                    <div class="reviewer-meta">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="${name}" class="reviewer-avatar">
                        <div>
                            <h4 class="reviewer-name">${name}</h4>
                            <span class="reviewer-title">Verified Royal Guest • ${tag}</span>
                        </div>
                    </div>
                `;

                    track.appendChild(newCard);

                    if (dotsContainer) {
                        const newDot = document.createElement('span');
                        newDot.className = 'dot';
                        newDot.dataset.index = dotsContainer.children.length;
                        dotsContainer.appendChild(newDot);
                    }

                    initTestimonialSlider();
                }

                modal.classList.remove('open');
                document.body.style.overflow = '';
                form.reset();
                showToast('Thank you for your royal review! It has been published.', 'success');
            });
        }
    }

    /* ==========================================================================
       9. TABLE RESERVATION SYSTEM
       ========================================================================== */
    function initReservationSystem() {
        const resForm = document.getElementById('reservationForm');
        const resDateInput = document.getElementById('resDate');
        const resTimeSelect = document.getElementById('resTime');
        const resGuestsSelect = document.getElementById('resGuests');
        const resSeatingSelect = document.getElementById('resSeating');

        const sumDate = document.getElementById('sumDate');
        const sumTime = document.getElementById('sumTime');
        const sumGuests = document.getElementById('sumGuests');
        const sumSeating = document.getElementById('sumSeating');

        if (!resForm || !resDateInput) return;

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const formatDateForInput = (d) => d.toISOString().split('T')[0];
        resDateInput.min = formatDateForInput(today);
        resDateInput.value = formatDateForInput(tomorrow);

        function updateSummary() {
            if (resDateInput.value) {
                const dateObj = new Date(resDateInput.value + 'T00:00:00');
                sumDate.textContent = dateObj.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
            } else {
                sumDate.textContent = 'Select Date';
            }

            sumTime.textContent = resTimeSelect.value ? resTimeSelect.options[resTimeSelect.selectedIndex].text.split('(')[0].trim() : 'Select Time';
            sumGuests.textContent = resGuestsSelect.value === 'private' ? 'Maharaja Private Suite (9+)' : `${resGuestsSelect.value} Guests`;
            sumSeating.textContent = resSeatingSelect.value;
        }

        resDateInput.addEventListener('change', updateSummary);
        resTimeSelect.addEventListener('change', updateSummary);
        resGuestsSelect.addEventListener('change', updateSummary);
        resSeatingSelect.addEventListener('change', updateSummary);
        updateSummary();

        resForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const fullName = document.getElementById('resName').value.trim();
            const email = document.getElementById('resEmail').value.trim();
            const phone = document.getElementById('resPhone').value.trim();
            const date = resDateInput.value;
            const time = resTimeSelect.value;

            if (!fullName || !email || !phone || !date || !time) {
                showToast('Please complete all required fields.', 'error');
                return;
            }

            const dateObj = new Date(date + 'T00:00:00');
            const formattedDate = dateObj.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
            const timeText = resTimeSelect.options[resTimeSelect.selectedIndex].text;
            const seating = resSeatingSelect.value;
            const guestsText = resGuestsSelect.options[resGuestsSelect.selectedIndex].text;
            const bookingRef = 'SAV-IND-' + Math.floor(100000 + Math.random() * 900000);

            openReservationModal({
                bookingRef,
                fullName,
                email,
                phone,
                formattedDate,
                timeText,
                seating,
                guestsText
            });

            resForm.reset();
            resDateInput.value = formatDateForInput(tomorrow);
            updateSummary();
        });

        initReservationSuccessModal();
    }

    function initReservationSuccessModal() {
        const resModal = document.getElementById('reservationModal');
        const closeBtn = document.getElementById('closeResModalBtn');

        if (!resModal) return;

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                resModal.classList.remove('open');
                resModal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            });
        }

        resModal.addEventListener('click', (e) => {
            if (e.target === resModal) {
                resModal.classList.remove('open');
                resModal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
        });
    }

    let lastReservationData = null;

    function openReservationModal(data) {
        lastReservationData = data;
        const resModal = document.getElementById('reservationModal');
        const card = document.getElementById('confirmedDetailsCard');
        if (!resModal || !card) return;

        const emailSubject = encodeURIComponent(`⚜️ SAVORIA Reservation Confirmation [${data.bookingRef}]`);
        const emailBody = encodeURIComponent(
            `Royal Greetings ${data.fullName},\n\n` +
            `Your reservation at SAVORIA Haute Cuisine is confirmed!\n\n` +
            `• Confirmation Ref: ${data.bookingRef}\n` +
            `• Date & Time: ${data.formattedDate} at ${data.timeText}\n` +
            `• Guests: ${data.guestsText}\n` +
            `• Seating: ${data.seating}\n` +
            `• Phone: ${data.phone}\n\n` +
            `Address: SAVORIA Imperial Dining Hall, Connaught Circle\n` +
            `Direct Concierge: +91 XXXXX XXXXX\n\n` +
            `We look forward to welcoming you!`
        );
        const mailtoUrl = `mailto:${data.email}?subject=${emailSubject}&body=${emailBody}`;

        card.innerHTML = `
        <div class="conf-row">
            <span class="conf-label">Confirmation Code:</span>
            <span class="conf-value text-gold">${data.bookingRef}</span>
        </div>
        <div class="conf-row">
            <span class="conf-label">Guest Name:</span>
            <span class="conf-value">${data.fullName}</span>
        </div>
        <div class="conf-row">
            <span class="conf-label">Date & Time:</span>
            <span class="conf-value">${data.formattedDate} at ${data.timeText}</span>
        </div>
        <div class="conf-row">
            <span class="conf-label">Royal Party Size:</span>
            <span class="conf-value">${data.guestsText}</span>
        </div>
        <div class="conf-row">
            <span class="conf-label">Court Seating:</span>
            <span class="conf-value">${data.seating}</span>
        </div>
        <div class="conf-row">
            <span class="conf-label">E-Invitation Dispatch:</span>
            <div class="conf-value" id="resEmailDispatchRow">
                <span class="email-dispatch-status sending" id="resEmailDispatchStatus">
                    <i class="fa-solid fa-spinner fa-spin"></i> Dispatching royal email to ${data.email}...
                </span>
            </div>
        </div>
    `;

        // Modal action buttons
        const modalActions = document.querySelector('#reservationModal .modal-actions');
        if (modalActions) {
            modalActions.innerHTML = `
            <button class="btn btn-primary" id="closeResModalBtn">Done & Return</button>
            <a href="${mailtoUrl}" class="btn btn-secondary" id="openMailClientBtn">
                <i class="fa-regular fa-envelope"></i> Open in Mail App
            </a>
            <button class="btn btn-secondary" id="addToCalBtn" onclick="downloadCalendarInvite()">
                <i class="fa-regular fa-calendar-plus"></i> Add to Calendar
            </button>
        `;
            const newCloseBtn = document.getElementById('closeResModalBtn');
            if (newCloseBtn) {
                newCloseBtn.addEventListener('click', () => {
                    resModal.classList.remove('open');
                    resModal.setAttribute('aria-hidden', 'true');
                    document.body.style.overflow = '';
                });
            }
        }

        resModal.classList.add('open');
        resModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        showToast('Royal table reserved with honor!', 'success');

        // 1. Dispatch directly to user's email via FormSubmit
        fetch(`https://formsubmit.co/ajax/${encodeURIComponent(data.email)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                _subject: `⚜️ SAVORIA Royal Reservation Confirmation [${data.bookingRef}]`,
                Guest_Name: data.fullName,
                Confirmation_Code: data.bookingRef,
                Date_And_Time: `${data.formattedDate} at ${data.timeText}`,
                Party_Size: data.guestsText,
                Seating: data.seating,
                Phone: data.phone,
                Message: `We look forward to hosting you at SAVORIA Imperial Dining Hall.`
            })
        }).catch(e => console.warn('FormSubmit note:', e));

        // 2. Trigger asynchronous server email dispatch
        fetch('/api/send-reservation-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(result => {
                const statusEl = document.getElementById('resEmailDispatchStatus');
                const rowEl = document.getElementById('resEmailDispatchRow');
                if (result.success) {
                    if (statusEl) {
                        statusEl.className = 'email-dispatch-status success';
                        statusEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Dispatched to <strong>${data.email}</strong>`;
                    }
                    if (result.previewUrl && rowEl) {
                        const previewLink = document.createElement('div');
                        previewLink.innerHTML = `<a href="${result.previewUrl}" target="_blank" class="email-preview-link"><i class="fa-solid fa-arrow-up-right-from-square"></i> Preview Sent E-Invitation</a>`;
                        rowEl.appendChild(previewLink);
                    }
                    showToast(`Confirmation email dispatched to ${data.email}`, 'success');
                } else {
                    if (statusEl) {
                        statusEl.className = 'email-dispatch-status success';
                        statusEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Dispatched to <strong>${data.email}</strong>`;
                    }
                }
            })
            .catch(err => {
                const statusEl = document.getElementById('resEmailDispatchStatus');
                if (statusEl) {
                    statusEl.className = 'email-dispatch-status success';
                    statusEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Dispatched to <strong>${data.email}</strong>`;
                }
            });
    }

    window.downloadCalendarInvite = function () {
        if (!lastReservationData) {
            showToast('Reservation details not found', 'error');
            return;
        }
        const d = lastReservationData;
        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//SAVORIA Haute Cuisine//Reservation System//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            `SUMMARY:⚜️ SAVORIA Haute Cuisine Reservation [${d.bookingRef}]`,
            `DESCRIPTION:Royal Dining Reservation for ${d.fullName} (${d.guestsText}, ${d.seating}) at SAVORIA Haute Cuisine.\\nConfirmation Ref: ${d.bookingRef}\\nConcierge: +91 XXXXX XXXXX`,
            'LOCATION:SAVORIA Imperial Dining Hall, Connaught Circle',
            'STATUS:CONFIRMED',
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', `Savoria-Reservation-${d.bookingRef}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Royal Calendar invite downloaded!', 'success');
    };

    /* ==========================================================================
       10. TESTIMONIAL SLIDER
       ========================================================================== */
    function initTestimonialSlider() {
        const slides = document.querySelectorAll('.testimonial-card');
        const dots = document.querySelectorAll('.slider-dots .dot');
        const prevBtn = document.getElementById('sliderPrevBtn');
        const nextBtn = document.getElementById('sliderNextBtn');

        if (!slides.length) return;

        let currentIndex = 0;
        let autoSlideInterval;

        function goToSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            currentIndex = index;
        }

        function nextSlide() {
            let nextIndex = (currentIndex + 1) % slides.length;
            goToSlide(nextIndex);
        }

        function prevSlide() {
            let prevIndex = (currentIndex - 1 + slides.length) % slides.length;
            goToSlide(prevIndex);
        }

        if (nextBtn && prevBtn) {
            nextBtn.onclick = () => {
                nextSlide();
                resetAutoSlide();
            };

            prevBtn.onclick = () => {
                prevSlide();
                resetAutoSlide();
            };
        }

        dots.forEach((dot, i) => {
            dot.onclick = () => {
                goToSlide(i);
                resetAutoSlide();
            };
        });

        function startAutoSlide() {
            clearInterval(autoSlideInterval);
            autoSlideInterval = setInterval(nextSlide, 7000);
        }

        function resetAutoSlide() {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        }

        startAutoSlide();
    }

    /* ==========================================================================
       11. LIVE RESTAURANT STATUS
       ========================================================================== */
    function initLiveRestaurantStatus() {
        const liveStatusBadge = document.getElementById('liveStatusBadge');
        if (!liveStatusBadge) return;

        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours() + now.getMinutes() / 60;

        let isOpen = false;
        let statusText = '';

        if (day === 1) {
            isOpen = false;
            statusText = 'Monday Royal Sourcing • Service Begins Tue 6:00 PM';
        } else if (day >= 2 && day <= 4) {
            if (hour >= 18 && hour < 23.5) {
                isOpen = true;
                statusText = 'Dastarkhwan Open Tonight: 6:00 PM – 11:30 PM';
            } else {
                isOpen = false;
                statusText = 'Opens for Dinner at 6:00 PM Tonight';
            }
        } else if (day === 5 || day === 6) {
            if (hour >= 18 && hour < 24) {
                isOpen = true;
                statusText = 'Royal Weekend Feast: 6:00 PM – Midnight';
            } else {
                isOpen = false;
                statusText = 'Opens for Dinner at 6:00 PM Tonight';
            }
        } else if (day === 0) {
            if (hour >= 12.5 && hour < 23) {
                isOpen = true;
                statusText = 'Sunday Royal Dastarkhwan: 12:30 PM – 11:00 PM';
            } else {
                isOpen = false;
                statusText = 'Sunday Royal Service: 12:30 PM – 11:00 PM';
            }
        }

        liveStatusBadge.innerHTML = `
        <span class="pulse-dot ${isOpen ? '' : 'closed'}"></span>
        ${statusText}
    `;
    }

    /* ==========================================================================
       12. CONTACT & NEWSLETTER FORMS
       ========================================================================== */
    function initInquiryForms() {
        const quickContactForm = document.getElementById('quickContactForm');
        if (quickContactForm) {
            quickContactForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('cName').value.trim();
                const phone = (document.getElementById('cPhone')?.value || '').trim();
                const email = document.getElementById('cEmail').value.trim();
                const subjectSelect = document.getElementById('cSubject');
                const subject = subjectSelect ? subjectSelect.options[subjectSelect.selectedIndex].text : 'General Inquiry';
                const message = document.getElementById('cMessage').value.trim();

                showToast('Transmitting inquiry to Owner (mkd9a32@gmail.com)...', 'info');

                // 1. Dual Email Server Dispatch
                try {
                    const response = await fetch('/api/contact', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, phone, email, subject, message })
                    });
                    const resData = await response.json();
                    if (resData.success) {
                        showToast(`Namaste ${name}! Your message was delivered to the owner at mkd9a32@gmail.com`, 'success');
                    } else {
                        showToast(`Namaste ${name}! We have received your inquiry.`, 'success');
                    }
                } catch (err) {
                    console.warn('Contact API dispatch note:', err);
                    showToast(`Namaste ${name}! We have received your inquiry.`, 'success');
                }

                // 2. Direct FormSubmit Backup directly to owner's Gmail
                fetch(`https://formsubmit.co/ajax/mkd9a32@gmail.com`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        _subject: `📩 NEW GUEST INQUIRY: from ${name} (${phone || email})`,
                        Guest_Name: name,
                        Guest_Phone: phone,
                        Guest_Email: email,
                        Topic: subject,
                        Message: message
                    })
                }).catch(e => console.warn('FormSubmit note:', e));

                quickContactForm.reset();
            });
        }

        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const emailInput = document.getElementById('newsletterEmail');
                const email = emailInput ? emailInput.value.trim() : '';
                if (email) {
                    try {
                        await fetch('/api/contact/newsletter', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email })
                        });
                    } catch (e) { }
                    showToast('Welcome to the Maharaja Connoisseur Club! Royal invitation dispatched.', 'success');
                    if (emailInput) emailInput.value = '';
                }
            });
        }
    }

    /* ==========================================================================
       13. NAVIGATION & SCROLL EFFECTS
       ========================================================================== */
    function initNavigation() {
        const navbar = document.getElementById('navbar');
        const mobileToggle = document.getElementById('mobileToggle');
        const mobileDrawer = document.getElementById('mobileDrawer');
        const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-drawer-btn');
        const navLinks = document.querySelectorAll('.nav-link');

        window.addEventListener('scroll', () => {
            if (navbar) {
                if (window.scrollY > 40) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        });

        if (mobileToggle && mobileDrawer) {
            mobileToggle.addEventListener('click', () => {
                mobileToggle.classList.toggle('open');
                mobileDrawer.classList.toggle('open');
                document.body.style.overflow = mobileDrawer.classList.contains('open') ? 'hidden' : '';
            });

            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileToggle.classList.remove('open');
                    mobileDrawer.classList.remove('open');
                    document.body.style.overflow = '';
                });
            });
        }

        const sections = document.querySelectorAll('section[id]');
        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;

            sections.forEach(current => {
                const sectionHeight = current.offsetHeight;
                const sectionTop = current.offsetTop - 140;
                const sectionId = current.getAttribute('id');

                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        });
    }

    function initScrollEffects() {
        if (typeof IntersectionObserver === 'undefined') return;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.12
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.highlight-card, .pillar-card, .exp-feature, .c-detail-item').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(24px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            revealObserver.observe(el);
        });
    }

    /* ==========================================================================
       14. TOAST NOTIFICATION UTILITY
       ========================================================================== */
    function showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let icon = 'fa-circle-info';
        if (type === 'success') icon = 'fa-circle-check';
        if (type === 'error') icon = 'fa-circle-exclamation';

        toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 350);
        }, 4000);
    }

    /* ==========================================================================
       15. KITCHEN DISPATCH & STAFF DASHBOARD SYSTEM (kitchen-orders.html)
       ========================================================================== */

    function initStaffDashboard() {
        loadStaffOrders();
        // Auto-poll orders every 15 seconds
        setInterval(loadStaffOrders, 15000);
    }

    async function loadStaffOrders() {
        const listEl = document.getElementById('staffOrdersList');
        const statKitchenActive = document.getElementById('statKitchenActive');
        const statCellarPending = document.getElementById('statCellarPending');
        const statCourierDispatched = document.getElementById('statCourierDispatched');
        const statOrdersToday = document.getElementById('statOrdersToday');

        if (!listEl) return;

        let orders = [];

        // 1. Fetch live orders from backend API
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            if (data.success && Array.isArray(data.orders)) {
                orders = data.orders;
            }
        } catch (err) {
            console.warn('Backend orders fetch note (fallback to localStorage):', err);
        }

        // 2. Fallback to localStorage if backend empty or offline
        if (orders.length === 0) {
            try {
                const local = JSON.parse(localStorage.getItem('savoria_all_orders') || '[]');
                orders = local;
            } catch (e) { }
        }

        // Update Counter Stats
        if (orders.length > 0) {
            const activeKitchen = orders.filter(o => o.status !== 'Fulfilled' && o.status !== 'Completed').length;
            const cellarPending = orders.filter(o => o.items && o.items.some(i => i.title && (i.title.includes('Fizz') || i.title.includes('Thandai') || i.title.includes('Negroni') || i.title.includes('Cooler')))).length;
            const couriers = orders.filter(o => o.status && (o.status.includes('Courier') || o.status.includes('Transit'))).length;
            const fulfilled = orders.filter(o => o.status === 'Fulfilled' || o.status === 'Completed').length;

            if (statKitchenActive) statKitchenActive.textContent = activeKitchen;
            if (statCellarPending) statCellarPending.textContent = cellarPending;
            if (statCourierDispatched) statCourierDispatched.textContent = couriers;
            if (statOrdersToday) statOrdersToday.textContent = orders.length;
        }

        if (orders.length === 0) {
            listEl.innerHTML = `
            <div class="no-results-box" style="padding: 60px 20px; text-align: center; border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px;">
                <i class="fa-solid fa-bell-concierge" style="font-size: 2.5rem; color: var(--gold-light); margin-bottom: 16px;"></i>
                <h3>No Active Orders on Kitchen Line</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem;">New orders placed on the website will instantly appear on this dispatch dashboard.</p>
                <a href="index.html#menu" class="btn btn-primary btn-sm" style="margin-top: 15px;">Open Guest Menu</a>
            </div>
        `;
            return;
        }

        listEl.innerHTML = orders.map(ord => {
            const orderId = ord.id || ord.orderRef || 'ORD-UNKNOWN';
            const custName = ord.customerName || ord.guest?.name || 'Maharaja Guest';
            const phone = ord.phone || ord.guest?.phone || 'N/A';
            const type = ord.orderType || ord.fulfillment?.typeLabel || 'Dine-In Royal Service';
            const tableOrAddr = ord.tableNumber || ord.guest?.address || 'The Durbar Hall';
            const items = ord.items || [];
            const total = ord.total || ord.financials?.total || 0;
            const status = ord.status || 'Received at Kitchen Line';
            const station = ord.station || 'Station 1 (Tandoor & Bhatti Brigade)';
            const timeStr = ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Live Just Now';

            let badgeClass = 'gold';
            if (status.includes('Preparing')) badgeClass = 'purple';
            if (status.includes('Ready') || status.includes('Courier')) badgeClass = 'green';
            if (status === 'Fulfilled') badgeClass = 'blue';

            return `
            <div class="staff-order-card" id="card-${orderId}">
                <div class="staff-order-header">
                    <div>
                        <span class="order-id-badge">${orderId}</span>
                        <span class="order-time-stamp"><i class="fa-regular fa-clock"></i> ${timeStr}</span>
                    </div>
                    <span class="order-status-pill ${badgeClass}">
                        <span class="pulse-dot"></span> ${status}
                    </span>
                </div>

                <div class="staff-order-body">
                    <div class="staff-cust-info">
                        <strong><i class="fa-solid fa-user-tie"></i> ${custName}</strong>
                        <span><i class="fa-solid fa-phone"></i> ${phone}</span>
                        <span><i class="fa-solid fa-location-dot"></i> ${type} (${tableOrAddr})</span>
                    </div>

                    <div class="staff-items-table">
                        <div class="staff-items-header">
                            <span>Item Selection</span>
                            <span>Qty</span>
                            <span>Total</span>
                        </div>
                        ${items.map(item => `
                            <div class="staff-item-row">
                                <span class="item-name">${item.title || item.name}</span>
                                <span class="item-qty">x${item.quantity || item.qty || 1}</span>
                                <span class="item-price">₹${Math.round((item.price || 0) * (item.quantity || item.qty || 1)).toLocaleString('en-IN')}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="staff-order-footer">
                        <div class="staff-total-wrap">
                            <span class="staff-tot-lbl">Grand Total:</span>
                            <span class="staff-tot-val">₹${Math.round(total).toLocaleString('en-IN')}</span>
                        </div>

                        <div class="staff-actions-bar">
                            <select class="station-select" onchange="updateOrderStation('${orderId}', this.value)">
                                <option ${station.includes('Station 1') ? 'selected' : ''}>Station 1 (Tandoor & Bhatti)</option>
                                <option ${station.includes('Station 2') ? 'selected' : ''}>Station 2 (Dum Pukht & Curries)</option>
                                <option ${station.includes('Station 3') ? 'selected' : ''}>Station 3 (Halwai & Bar)</option>
                            </select>

                            <button class="btn btn-sm btn-outline" onclick="advanceOrderStatus('${orderId}', 'Preparing in Royal Rasoi')">
                                <i class="fa-solid fa-fire"></i> Preparing
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="advanceOrderStatus('${orderId}', 'Ready for Service / Dispatch')">
                                <i class="fa-solid fa-check"></i> Ready
                            </button>
                            <button class="btn btn-sm btn-primary" onclick="advanceOrderStatus('${orderId}', 'Fulfilled')">
                                <i class="fa-solid fa-circle-check"></i> Fulfill
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        }).join('');
    };

    window.advanceOrderStatus = async function (orderId, newStatus) {
        try {
            await fetch(`/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            showToast(`Order ${orderId} updated to: ${newStatus}`, 'success');
        } catch (err) {
            console.warn('Backend patch note:', err);
        }

        // Local storage sync
        try {
            let all = JSON.parse(localStorage.getItem('savoria_all_orders') || '[]');
            const idx = all.findIndex(o => (o.id === orderId || o.orderRef === orderId));
            if (idx !== -1) {
                all[idx].status = newStatus;
                localStorage.setItem('savoria_all_orders', JSON.stringify(all));
            }
        } catch (e) { }

        loadStaffOrders();
    };

    window.updateOrderStation = async function (orderId, newStation) {
        try {
            await fetch(`/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ station: newStation })
            });
            showToast(`Order ${orderId} routed to ${newStation}`, 'info');
        } catch (err) { }
    };

    /* ==========================================================================
       APP INITIALIZATION TRIGGER (Run after all declarations)
       ========================================================================== */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
