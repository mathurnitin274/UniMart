document.addEventListener('DOMContentLoaded', () => {
  if (!API.auth.isAuthenticated()) {
    showToast('Please login to view profile', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
    return;
  }

  const currentUser = API.auth.getCurrentUser();

  // Elements
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const profileCollege = document.getElementById('profile-college-label');
  const profileDept = document.getElementById('profile-dept-label');
  const profileYear = document.getElementById('profile-year-label');
  const profilePhone = document.getElementById('profile-phone-label');
  const profilePic = document.getElementById('profile-pic');

  // Customizer Elements
  const themeToggle = document.getElementById('profile-theme-toggle');
  const hueSlider = document.getElementById('profile-hue-slider');

  // Tab Elements
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // Settings Form Elements
  const settingsForm = document.getElementById('settings-form');
  const settingsName = document.getElementById('settings-name');
  const settingsPhone = document.getElementById('settings-phone');
  const settingsCollege = document.getElementById('settings-college');
  const settingsDept = document.getElementById('settings-department');
  const settingsYear = document.getElementById('settings-year');
  const settingsAvatar = document.getElementById('settings-avatar');

  // Containers
  const myListingsContainer = document.getElementById('my-listings-container');
  const listingsLoading = document.getElementById('listings-loading');
  const listingsEmpty = document.getElementById('listings-empty');

  const myWishlistContainer = document.getElementById('my-wishlist-container');
  const wishlistLoading = document.getElementById('wishlist-loading');
  const wishlistEmpty = document.getElementById('wishlist-empty');

  // Init Actions
  bindSidebarInfo();
  initSettingsForm();
  initCustomizer();
  initTabs();

  // Load My Listings by default
  loadMyListings();

  function bindSidebarInfo() {
    profileName.textContent = currentUser.name;
    profileEmail.textContent = currentUser.email;
    profileCollege.nextSibling.textContent = ` ${currentUser.college}`;
    profileDept.nextSibling.textContent = ` ${currentUser.department}`;
    profileYear.nextSibling.textContent = ` ${currentUser.year}`;
    profilePhone.nextSibling.textContent = ` ${currentUser.phone || 'Not added'}`;
    
    if (currentUser.profileImage) {
      profilePic.src = currentUser.profileImage;
    }
  }

  function initSettingsForm() {
    settingsName.value = currentUser.name;
    settingsPhone.value = currentUser.phone || '';
    settingsCollege.value = currentUser.college;
    settingsDept.value = currentUser.department;
    settingsYear.value = currentUser.year;
    settingsAvatar.value = currentUser.profileImage || '';

    if (settingsForm) {
      settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
          name: settingsName.value.trim(),
          phone: settingsPhone.value.trim(),
          college: settingsCollege.value.trim(),
          department: settingsDept.value.trim(),
          year: settingsYear.value,
          profileImage: settingsAvatar.value.trim()
        };

        const saveBtn = document.getElementById('save-settings-btn');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving details...';

        try {
          const res = await API.auth.updateProfile(payload);
          if (res.success) {
            showToast('Profile updated successfully!', 'success');
            // Refresh user reference
            setTimeout(() => {
              window.location.reload();
            }, 800);
          }
        } catch(err) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save Profile Changes';
        }
      });
    }
  }

  function initCustomizer() {
    // Sync slider value
    const currentHue = ThemeUtil.getHue();
    if (hueSlider) hueSlider.value = currentHue;

    if (hueSlider) {
      hueSlider.addEventListener('input', (e) => {
        ThemeUtil.setHue(e.target.value);
        // Sync navbar slider if exists
        const navSlider = document.getElementById('hue-slider');
        if (navSlider) navSlider.value = e.target.value;
      });
    }

    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const newTheme = ThemeUtil.toggleMode();
        const navThemeBtn = document.getElementById('theme-toggle-btn');
        if (navThemeBtn) {
          navThemeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
      });
    }
  }

  function initTabs() {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(target).classList.add('active');

        // Lazy load tab data
        if (target === 'tab-my-listings') {
          loadMyListings();
        } else if (target === 'tab-my-wishlist') {
          loadMyWishlist();
        }
      });
    });
  }

  async function loadMyListings() {
    myListingsContainer.innerHTML = '';
    listingsLoading.style.display = 'block';
    listingsEmpty.style.display = 'none';

    try {
      // Fetch available and sold in parallel, merge
      const [availableRes, soldRes] = await Promise.all([
        API.products.getAll({ sellerId: currentUser._id, status: 'available' }),
        API.products.getAll({ sellerId: currentUser._id, status: 'sold' })
      ]);

      const list1 = availableRes.success ? availableRes.data : [];
      const list2 = soldRes.success ? soldRes.data : [];
      const mergedList = [...list1, ...list2];

      listingsLoading.style.display = 'none';

      if (mergedList.length === 0) {
        listingsEmpty.style.display = 'block';
        return;
      }

      myListingsContainer.innerHTML = mergedList.map(prod => {
        const mainImg = prod.images && prod.images.length > 0 
          ? prod.images[0].url 
          : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100&auto=format&fit=crop&q=60';
        
        const isAvailable = prod.status === 'available';
        
        return `
          <div class="profile-item-row" data-id="${prod._id}">
            <img src="${mainImg}" alt="${prod.title}">
            <div style="flex:1;">
              <h4 style="font-weight:700; font-size:1rem; cursor:pointer;" onclick="window.location.href='product-details.html?id=${prod._id}'">${prod.title}</h4>
              <p style="font-size:0.9rem; font-weight:700; color:var(--primary); margin-top:2px;">₹${prod.price.toLocaleString()}</p>
              <div style="margin-top:6px; display:flex; align-items:center; gap:8px;">
                <span class="status-pill status-${prod.status}">${prod.status}</span>
                <span style="font-size:0.8rem; color:var(--text-muted);">${prod.category}</span>
              </div>
            </div>
            
            <div style="display:flex; gap:10px;">
              <button class="btn btn-secondary" style="padding:6px 12px; font-size:0.8rem;" onclick="toggleListingStatus('${prod._id}', '${prod.status}')">
                ${isAvailable ? 'Mark Sold' : 'Mark Available'}
              </button>
              <button class="btn btn-danger" style="padding:6px 12px; font-size:0.8rem; background:none; border:1px solid var(--danger); color:var(--danger);" onclick="deleteListing('${prod._id}')">
                Delete
              </button>
            </div>
          </div>
        `;
      }).join('');
    } catch(err) {
      listingsLoading.style.display = 'none';
      listingsEmpty.style.display = 'block';
    }
  }

  async function loadMyWishlist() {
    myWishlistContainer.innerHTML = '';
    wishlistLoading.style.display = 'block';
    wishlistEmpty.style.display = 'none';

    try {
      const res = await API.wishlist.get();
      wishlistLoading.style.display = 'none';

      const items = res.data || [];
      if (res.success && items.length > 0) {
        myWishlistContainer.innerHTML = items.map(item => {
          const prod = item.productId || {};
          if (!prod._id) return ''; // Catch edge cases of deleted products

          const mainImg = prod.images && prod.images.length > 0 
            ? prod.images[0].url 
            : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100&auto=format&fit=crop&q=60';
          
          return `
            <div class="profile-item-row" data-id="${prod._id}">
              <img src="${mainImg}" alt="${prod.title}">
              <div style="flex:1;">
                <h4 style="font-weight:700; font-size:1rem; cursor:pointer;" onclick="window.location.href='product-details.html?id=${prod._id}'">${prod.title}</h4>
                <p style="font-size:0.9rem; font-weight:700; color:var(--primary); margin-top:2px;">₹${(prod.price || 0).toLocaleString()}</p>
                <div style="margin-top:6px; display:flex; align-items:center; gap:8px;">
                  <span class="status-pill status-${prod.status || 'available'}">${prod.status || 'available'}</span>
                  <span style="font-size:0.8rem; color:var(--text-muted);">${prod.category || 'Other'}</span>
                </div>
              </div>
              
              <button class="btn btn-secondary" style="padding:6px 12px; font-size:0.8rem; border-color:var(--danger); color:var(--danger);" onclick="removeFromWishlist('${prod._id}')">
                Remove
              </button>
            </div>
          `;
        }).join('');
      } else {
        wishlistEmpty.style.display = 'block';
      }
    } catch(err) {
      wishlistLoading.style.display = 'none';
      wishlistEmpty.style.display = 'block';
    }
  }

  // Action methods bound to window for inline onclick execution
  window.toggleListingStatus = async (productId, currentStatus) => {
    const nextStatus = currentStatus === 'available' ? 'sold' : 'available';
    try {
      const res = await API.products.update(productId, { status: nextStatus });
      if (res.success) {
        showToast(`Item status updated to ${nextStatus}!`, 'success');
        loadMyListings();
      }
    } catch(err) {
      console.error(err);
    }
  };

  window.deleteListing = async (productId) => {
    if (confirm('Are you sure you want to remove this product listing? This action is permanent.')) {
      try {
        const res = await API.products.delete(productId);
        if (res.success) {
          showToast('Product listing removed', 'success');
          loadMyListings();
        }
      } catch(err) {
        console.error(err);
      }
    }
  };

  window.removeFromWishlist = async (productId) => {
    try {
      const res = await API.wishlist.delete(productId);
      if (res.success) {
        showToast('Removed from wishlist', 'success');
        loadMyWishlist();
      }
    } catch(err) {
      console.error(err);
    }
  };
});
