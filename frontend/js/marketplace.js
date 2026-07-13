document.addEventListener('DOMContentLoaded', () => {
  let allProducts = [];
  let userWishlist = new Set();
  let selectedConditions = new Set();

  const productsGrid = document.getElementById('products-grid');
  const loadingState = document.getElementById('loading-state');
  const emptyState = document.getElementById('empty-state');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  
  let selectedCategory = '';
  let selectedSubcategory = '';
  const subcategoryPillsRow = document.getElementById('subcategory-pills-row');
  const subcategoryPillsList = document.getElementById('subcategory-pills-list');

  const SUBCATEGORIES = {
    'Electronics': [
      'Laptops & Computers',
      'Mobile Phones & Tablets',
      'Refrigerators & Appliances',
      'Audio & Headphones',
      'Other Electronics'
    ],
    'Books': [
      'Textbooks & Academic',
      'Exam Prep (GATE, GRE, etc.)',
      'Fiction & Literature',
      'Other Books'
    ],
    'Furniture': [
      'Study Tables & Desks',
      'Chairs & Seating',
      'Beds & Mattresses',
      'Storage (Wardrobes, Racks)',
      'Other Furniture'
    ],
    'Clothing': [
      'Winter Wear & Hoodies',
      'T-Shirts & Shirts',
      'Shoes & Sneakers',
      'Other Clothing'
    ],
    'Sports': [
      'Fitness Equipment',
      'Bicycles',
      'Sports Gear & Rackets',
      'Other Sports'
    ],
    'Accessories': [
      'Bags & Backpacks',
      'Watches & Wearables',
      'Other Accessories'
    ],
    'Other': [
      'Lab Coats & Drafters',
      'Miscellaneous'
    ]
  };

  // Initialize page
  initPage();

  async function initPage() {
    // If logged in, fetch user wishlist first to show correct icons
    if (API.auth.isAuthenticated()) {
      try {
        const wishlistData = await API.wishlist.get();
        if (wishlistData.success && wishlistData.data) {
          wishlistData.data.forEach(item => {
            const prodId = item.productId?._id || item.productId || item._id;
            if (prodId) userWishlist.add(prodId);
          });
        }
      } catch (err) {
        console.error('Failed to fetch wishlist', err);
      }
    }

    // Parse URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const qParam = urlParams.get('q');
    const catParam = urlParams.get('category');
    const subcatParam = urlParams.get('subcategory');

    if (qParam) {
      searchInput.value = qParam;
    }
    if (catParam) {
      selectedCategory = catParam;
      syncCategoryPill(catParam);
    }
    if (subcatParam) {
      selectedSubcategory = subcatParam;
    }

    // Set up filter change listeners
    setupFilters();
    
    // Render initial subcategories if category was loaded from URL
    if (selectedCategory) {
      renderSubcategoryPills(selectedCategory);
    }
    
    // Fetch products
    await fetchProducts();
  }

  function syncCategoryPill(categoryName) {
    const pills = document.querySelectorAll('.category-pill');
    pills.forEach(pill => {
      if (pill.getAttribute('data-category') === (categoryName || '')) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  function getRelativeTime(dateString) {
    if (!dateString) return 'Just now';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  function setupFilters() {
    // Debounce search input
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(fetchProducts, 400);
    });
    
    // Category pills click triggers search fetch
    const pills = document.querySelectorAll('.category-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        const cat = pill.getAttribute('data-category');
        selectedCategory = cat;
        selectedSubcategory = ''; // reset subcategory on main category change
        syncCategoryPill(cat);
        renderSubcategoryPills(cat);
        fetchProducts();
      });
    });
  }

  function renderSubcategoryPills(category) {
    if (!subcategoryPillsRow || !subcategoryPillsList) return;

    const list = SUBCATEGORIES[category];
    if (!list || list.length === 0) {
      subcategoryPillsRow.style.display = 'none';
      subcategoryPillsList.innerHTML = '';
      return;
    }

    // Generate HTML for subcategories including "All [Category]"
    let html = `<button class="subcategory-pill ${selectedSubcategory === '' ? 'active' : ''}" data-subcategory="">All ${category}</button>`;
    
    list.forEach(sub => {
      html += `<button class="subcategory-pill ${selectedSubcategory === sub ? 'active' : ''}" data-subcategory="${sub}">${sub}</button>`;
    });

    subcategoryPillsList.innerHTML = html;
    subcategoryPillsRow.style.display = 'flex';

    // Bind event listeners to new subcategory pills
    const subPills = subcategoryPillsList.querySelectorAll('.subcategory-pill');
    subPills.forEach(subPill => {
      subPill.addEventListener('click', () => {
        const sub = subPill.getAttribute('data-subcategory');
        selectedSubcategory = sub;
        
        // Highlight active subcategory pill
        subPills.forEach(p => p.classList.toggle('active', p.getAttribute('data-subcategory') === sub));
        
        fetchProducts();
      });
    });

    // Sort
    sortSelect.addEventListener('change', renderProducts);
  }

  async function fetchProducts() {
    productsGrid.innerHTML = '';
    loadingState.style.display = 'block';
    emptyState.style.display = 'none';

    // Construct server-side parameters
    const params = {
      status: 'available' // Only list available items
    };

    if (searchInput.value.trim()) params.q = searchInput.value.trim();
    if (selectedCategory) params.category = selectedCategory;
    if (selectedSubcategory) params.subcategory = selectedSubcategory;

    try {
      const data = await API.products.getAll(params);
      if (data.success) {
        allProducts = data.data || [];
        renderProducts();
      } else {
        allProducts = [];
        renderProducts();
      }
    } catch (err) {
      loadingState.style.display = 'none';
      emptyState.style.display = 'block';
    }
  }

  function renderProducts() {
    loadingState.style.display = 'none';
    
    let filtered = [...allProducts];

    // Apply sorting
    const sortBy = sortSelect.value;
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    }

    // Breadcrumb and Category Hero Banner dynamic updates
    const breadcrumbCategory = document.getElementById('breadcrumb-category');
    const breadcrumbCategoryName = document.getElementById('breadcrumb-category-name');
    const bannerTitle = document.getElementById('banner-title');
    const bannerCountText = document.getElementById('banner-count-text');
    const resultsCount = document.getElementById('results-count');

    // Breadcrumbs Category Name
    if (selectedCategory) {
      if (breadcrumbCategory) breadcrumbCategory.style.display = 'inline';
      if (breadcrumbCategoryName) breadcrumbCategoryName.textContent = selectedCategory;
    } else {
      if (breadcrumbCategory) breadcrumbCategory.style.display = 'none';
    }

    // Dynamic banner title
    if (searchInput.value.trim()) {
      if (bannerTitle) bannerTitle.textContent = `Search: "${searchInput.value.trim()}"`;
    } else if (selectedCategory) {
      if (bannerTitle) bannerTitle.textContent = selectedCategory;
    } else {
      if (bannerTitle) bannerTitle.textContent = 'Campus Marketplace';
    }

    // Count updates
    const countStr = `${filtered.length.toLocaleString()} listing${filtered.length === 1 ? '' : 's'} available`;
    if (bannerCountText) bannerCountText.textContent = countStr;

    if (resultsCount) {
      resultsCount.style.display = 'block';
      resultsCount.textContent = `${filtered.length.toLocaleString()} result${filtered.length === 1 ? '' : 's'} found`;
    }

    // 3. Render
    if (filtered.length === 0) {
      productsGrid.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    
    productsGrid.innerHTML = filtered.map(prod => {
      // Decode specifications JSON
      let specObj = {};
      try {
        if (prod.specifications && prod.specifications.startsWith('{')) {
          specObj = JSON.parse(prod.specifications);
        }
      } catch(e) {}

      const hasSwap = specObj.swap;
      const dorm = specObj.location || specObj.dorm || '';

      const condClass = `badge-${prod.condition.toLowerCase().replace(' ', '-')}`;
      const isWishlisted = userWishlist.has(prod._id);
      
      const mainImg = prod.images && prod.images.length > 0 
        ? prod.images[0].url 
        : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60';

      const timeString = getRelativeTime(prod.createdAt);

      return `
        <div class="glass-card product-card" data-id="${prod._id}">
          <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist('${prod._id}', this)">
            ${isWishlisted ? '❤️' : '🤍'}
          </button>
          
          <div style="overflow:hidden; height:200px; background:var(--border);">
            <img class="product-card-img" src="${mainImg}" alt="${prod.title}" onclick="window.location.href='product-details.html?id=${prod._id}'" style="cursor:pointer;">
          </div>
          
          <div style="padding:16px; flex:1; display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; justify-content:space-between; align-items:start;">
              <span class="badge ${condClass}">${prod.condition}</span>
              ${hasSwap ? '<span class="badge badge-swap">Swap</span>' : ''}
            </div>
            
            <h4 style="font-size:1.05rem; font-weight:700; cursor:pointer; color:var(--text); line-weight:1.4;" onclick="window.location.href='product-details.html?id=${prod._id}'">${prod.title}</h4>
            
            <p style="font-size:1.25rem; font-weight:800; color:var(--primary); margin: 4px 0 2px 0;">INR ${prod.price.toLocaleString()}</p>
            
            <p style="font-size:0.82rem; color:var(--text-muted); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; margin-top:auto; border-top:1px solid var(--border); padding-top:8px;">
              <span>📍 ${dorm || 'Campus'}</span>
              <span>🕒 ${timeString}</span>
            </p>
          </div>
        </div>
      `;
    }).join('');
  }

  // Exposed globally to handle click binding inside template string
  window.toggleWishlist = async (productId, button) => {
    if (!API.auth.isAuthenticated()) {
      showToast('Please login to wishlist items', 'warning');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 800);
      return;
    }

    const isActive = button.classList.contains('active');
    
    try {
      if (isActive) {
        const data = await API.wishlist.delete(productId);
        if (data.success) {
          userWishlist.delete(productId);
          button.classList.remove('active');
          button.innerHTML = '🤍';
          showToast('Removed from wishlist', 'success');
        }
      } else {
        const data = await API.wishlist.add(productId);
        if (data.success) {
          userWishlist.add(productId);
          button.classList.add('active');
          button.innerHTML = '❤️';
          showToast('Added to wishlist!', 'success');
        }
      }
    } catch(err) {
      console.error(err);
    }
  };
});
