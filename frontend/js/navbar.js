document.addEventListener('DOMContentLoaded', () => {
  injectNavbar();
  injectFooter();
});

function injectNavbar() {
  const placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) return;

  const user = API.auth.getCurrentUser();
  const isAuthenticated = API.auth.isAuthenticated();
  const isAdmin = user && user.role === 'admin';

  // Get current page name to set active link
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1);

  let navLinksHTML = `
    <li><a href="marketplace.html" class="nav-link ${page === 'marketplace.html' ? 'active' : ''}">Marketplace</a></li>
  `;

  if (isAuthenticated) {
    navLinksHTML += `
      <li><a href="wishlist.html" class="nav-link ${page === 'wishlist.html' ? 'active' : ''}">Wishlist</a></li>
      <li><a href="chat.html" class="nav-link ${page === 'chat.html' ? 'active' : ''}">Chats</a></li>
      <li><a href="sell-product.html" class="nav-link ${page === 'sell-product.html' ? 'active' : ''}">Sell Item</a></li>
    `;
    if (isAdmin) {
      navLinksHTML += `
        <li><a href="admin-dashboard.html" class="nav-link ${page === 'admin-dashboard.html' ? 'active' : ''}">Admin Dashboard</a></li>
      `;
    }
  }

  let authSectionHTML = '';
  if (isAuthenticated) {
    const avatar = user.profileImage || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NiZDVlMSI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg==';
    authSectionHTML = `
      <div class="user-nav-profile" style="position:relative; display:flex; align-items:center; gap:12px; cursor:pointer;" id="user-menu-trigger">
        <span style="font-weight:600; font-size:0.95rem; color:var(--text); max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${user.name.split(' ')[0]}</span>
        <img src="${avatar}" alt="${user.name}" style="width:36px; height:36px; border-radius:var(--radius-full); object-fit:cover; border:2px solid var(--primary);">
        <div class="user-menu-dropdown glass-card" id="user-menu-dropdown" style="display:none; position:absolute; top:calc(100% + 10px); right:0; width:180px; padding:8px 0; z-index:102; border-radius:var(--radius-sm); text-align:left;">
          <a href="profile.html" style="display:block; padding:10px 16px; font-size:0.9rem; transition:var(--transition);" onmouseover="this.style.background='var(--surface-hover)'" onmouseout="this.style.background='none'">My Profile</a>
          <div style="border-top:1px solid var(--border); margin:4px 0;"></div>
          <button id="logout-btn" style="width:100%; border:none; background:none; text-align:left; color:var(--danger); display:block; padding:10px 16px; font-size:0.9rem; font-weight:600; cursor:pointer; transition:var(--transition);" onmouseover="this.style.background='var(--surface-hover)'" onmouseout="this.style.background='none'">Logout</button>
        </div>
      </div>
    `;
  } else {
    authSectionHTML = `
      <a href="login.html" class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.9rem;">Login</a>
      <a href="register.html" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.9rem;">Register</a>
    `;
  }

  const currentTheme = ThemeUtil.getTheme();
  const isDark = currentTheme === 'dark';

  const sunIcon = `
    <svg style="width:20px; height:20px; fill:none; stroke:currentColor; stroke-width:2.2; stroke-linecap:round; stroke-linejoin:round;" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  `;
  const moonIcon = `
    <svg style="width:20px; height:20px; fill:none; stroke:currentColor; stroke-width:2.2; stroke-linecap:round; stroke-linejoin:round;" viewBox="0 0 24 24">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  `;

  const navbarContent = `
    <header class="app-header">
      <nav class="navbar">
        <!-- Logo -->
        <a href="index.html" class="nav-logo" style="flex-shrink:0;">
          <svg class="logo-svg" style="width:32px; height:32px; transition:transform 0.3s ease;" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="var(--primary)"></stop>
                <stop offset="100%" stop-color="hsl(calc(var(--primary-hue) + 30), 85%, 55%)"></stop>
              </linearGradient>
            </defs>
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="url(#logo-grad)"></path>
            <path d="M6 9.5V14a6 6 0 0 0 12 0V9.5" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>
            <path d="M9 10a3 3 0 0 1 6 0" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>
          </svg>
          Uni<span>Mart</span>
        </a>

        <!-- Search Bar Container (OLX Style) -->
        <div class="nav-search-container">
          <div class="nav-location-wrapper" style="position:relative; z-index:110;" id="loc-dropdown-wrapper">
            <input type="hidden" id="header-location" value="">
            <button class="nav-location-trigger" id="loc-trigger-btn" type="button" style="display:flex; align-items:center; gap:8px; border:none; background:none; color:var(--text); cursor:pointer; font-weight:600; font-size:0.92rem; height:100%; padding:0 12px; width:100%;">
              <span class="loc-pin-icon" style="font-size:1.1rem; color:var(--primary);">📍</span>
              <span id="loc-display-text" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:110px;">All Locations</span>
              <span class="loc-chevron" style="font-size:0.75rem; margin-left:auto; transition:transform 0.3s ease;">▼</span>
            </button>
            
            <!-- Custom Location Dropdown Card (OLX-style but campus unique) -->
            <div class="loc-dropdown-card glass-card" id="loc-dropdown-card" style="display:none; position:absolute; top:calc(100% + 10px); left:0; width:340px; padding:20px; z-index:1000; border-radius:var(--radius-md); box-shadow:var(--shadow-lg); text-align:left; flex-direction:column; gap:16px;">
              <!-- Search Input -->
              <div style="position:relative; width:100%;">
                <input type="text" id="loc-search-input" placeholder="Search campus block..." style="width:100%; padding:10px 12px 10px 36px; border:1px solid var(--border); border-radius:var(--radius-sm); background:var(--background); color:var(--text); font-size:0.88rem; transition:var(--transition); outline:none;">
                <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-muted); font-size:0.9rem;">🔍</span>
              </div>
              
              <!-- Action Rows -->
              <div style="display:flex; flex-direction:column; gap:8px;">
                <!-- Detect Live Location -->
                <div class="loc-action-row" id="loc-action-detect" style="display:flex; align-items:center; gap:14px; padding:10px 12px; border-radius:var(--radius-sm); cursor:pointer; transition:var(--transition);">
                  <div class="loc-action-icon-circle" style="width:36px; height:36px; border-radius:50%; background:var(--primary-muted); color:var(--primary); display:flex; align-items:center; justify-content:center;">
                    <svg viewBox="0 0 24 24" style="width:18px; height:18px; fill:none; stroke:currentColor; stroke-width:2.5; stroke-linecap:round; stroke-linejoin:round;"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                  </div>
                  <div style="display:flex; flex-direction:column;">
                    <span style="font-weight:700; font-size:0.9rem; color:var(--text);">Use current location</span>
                    <span style="font-size:0.75rem; color:var(--text-muted);">Find listings near you</span>
                  </div>
                </div>
                
                <!-- All Locations -->
                <div class="loc-action-row" id="loc-action-all" style="display:flex; align-items:center; gap:14px; padding:10px 12px; border-radius:var(--radius-sm); cursor:pointer; transition:var(--transition);">
                  <div class="loc-action-icon-circle" style="width:36px; height:36px; border-radius:50%; background:var(--surface-hover); color:var(--text-muted); display:flex; align-items:center; justify-content:center;">
                    <svg viewBox="0 0 24 24" style="width:18px; height:18px; fill:none; stroke:currentColor; stroke-width:2; stroke-linecap:round; stroke-linejoin:round;"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  </div>
                  <div style="display:flex; flex-direction:column;">
                    <span style="font-weight:700; font-size:0.9rem; color:var(--text);">All Locations</span>
                    <span style="font-size:0.75rem; color:var(--text-muted);">Browse all campus areas</span>
                  </div>
                </div>
              </div>
              
              <div style="margin:4px 0 0 0; border-top:1px solid var(--border);"></div>
              
              <!-- Popular Campus Blocks -->
              <div>
                <h5 style="font-size:0.78rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin:0 0 12px 12px;">Popular Campus Areas</h5>
                <div class="loc-grid" id="loc-grid-container" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                  <div class="loc-grid-item" data-value="Hostel A">Hostel A</div>
                  <div class="loc-grid-item" data-value="Hostel B">Hostel B</div>
                  <div class="loc-grid-item" data-value="Library">Library</div>
                  <div class="loc-grid-item" data-value="Canteen">Canteen</div>
                  <div class="loc-grid-item" data-value="Academic Block">Academic Block</div>
                  <div class="loc-grid-item" data-value="Sports Complex">Sports Complex</div>
                  <div class="loc-grid-item" data-value="Tech Park">Tech Park</div>
                  <div class="loc-grid-item" data-value="Science Quad">Science Quad</div>
                </div>
              </div>
            </div>
          </div>
          <div class="nav-search-input-wrapper">
            <input type="text" id="header-search" placeholder="Find laptops, books, dorm items..." class="nav-search-input">
            <button id="header-search-btn" class="nav-search-btn" title="Search">
              <svg style="width:16px; height:16px; fill:none; stroke:white; stroke-width:2.5; stroke-linecap:round; stroke-linejoin:round;" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </div>

        <ul class="nav-links" style="display:none;">
          ${navLinksHTML}
        </ul>

        <div class="nav-actions">
          <!-- Theme Switcher -->
          <button id="theme-toggle-btn" class="theme-mode-btn" title="Toggle Dark/Light Mode">
            ${isDark ? sunIcon : moonIcon}
          </button>

          <!-- Direct Wishlist Icon -->
          <a href="wishlist.html" class="nav-action-link" title="My Wishlist" style="display:inline-flex;">
            <svg style="width:20px; height:20px; fill:none; stroke:currentColor; stroke-width:2.2; stroke-linecap:round; stroke-linejoin:round;" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </a>

          <!-- Direct Chats Icon with Notification Dot -->
          ${isAuthenticated ? `
          <a href="chat.html" class="nav-action-link" id="nav-chat-link" title="Chats" style="display:inline-flex; position:relative;">
            <svg style="width:20px; height:20px; fill:none; stroke:currentColor; stroke-width:2.2; stroke-linecap:round; stroke-linejoin:round;" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span id="chat-notif-dot" style="display:none; position:absolute; top:-2px; right:-2px; width:10px; height:10px; background:var(--danger); border-radius:50%; border:2px solid var(--surface); box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.4); animation: pulse 1.5s infinite;"></span>
          </a>
          ` : ''}

          ${authSectionHTML}

          <!-- SELL Button -->
          <a href="sell-product.html" class="btn-sell" style="display:inline-flex; align-items:center; text-decoration:none;">
            <span class="plus-icon">+</span> SELL
          </a>
        </div>
      </nav>
    </header>
  `;

  placeholder.outerHTML = navbarContent;

  // Add event listeners
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const newTheme = ThemeUtil.toggleMode();
      themeBtn.innerHTML = newTheme === 'dark' ? sunIcon : moonIcon;
    });
  }

  // Bind Search and Location Bar listeners
  const headerSearch = document.getElementById('header-search');
  const headerLocation = document.getElementById('header-location');
  const headerSearchBtn = document.getElementById('header-search-btn');

  const executeSearch = () => {
    const query = headerSearch ? headerSearch.value.trim() : '';
    const loc = headerLocation ? headerLocation.value : '';
    let url = 'marketplace.html';
    const params = [];
    if (query) params.push(`q=${encodeURIComponent(query)}`);
    if (loc) params.push(`dorm=${encodeURIComponent(loc)}`);
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    window.location.href = url;
  };

  if (headerSearch) {
    // Populate header inputs from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('q')) headerSearch.value = urlParams.get('q');
    if (urlParams.get('dorm')) {
      const dormVal = urlParams.get('dorm');
      headerLocation.value = dormVal;
      const locDisplayText = document.getElementById('loc-display-text');
      if (locDisplayText) {
        locDisplayText.textContent = dormVal;
      }
    }

    headerSearch.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        executeSearch();
      }
    });
  }

  if (headerSearchBtn) {
    headerSearchBtn.addEventListener('click', executeSearch);
  }

  const locDropdownWrapper = document.getElementById('loc-dropdown-wrapper');
  const locTriggerBtn = document.getElementById('loc-trigger-btn');
  const locDropdownCard = document.getElementById('loc-dropdown-card');
  const locSearchInput = document.getElementById('loc-search-input');
  const locDisplayText = document.getElementById('loc-display-text');
  const locChevron = locDropdownWrapper ? locDropdownWrapper.querySelector('.loc-chevron') : null;

  // Toggle location dropdown
  if (locTriggerBtn && locDropdownCard) {
    locTriggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = locDropdownCard.style.display === 'flex';
      locDropdownCard.style.display = isVisible ? 'none' : 'flex';
      if (locChevron) {
        locChevron.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
      }
    });

    document.addEventListener('click', (e) => {
      if (locDropdownWrapper && !locDropdownWrapper.contains(e.target)) {
        locDropdownCard.style.display = 'none';
        if (locChevron) locChevron.style.transform = 'rotate(0deg)';
      }
    });
  }

  // Filter campus list by search input
  if (locSearchInput) {
    locSearchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      const items = document.querySelectorAll('.loc-grid-item');
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(term) ? 'block' : 'none';
      });
    });
  }

  // Select location function
  function setLocation(val) {
    if (headerLocation) {
      headerLocation.value = val;
    }
    if (locDisplayText) {
      locDisplayText.textContent = val || 'All Locations';
    }
    if (locDropdownCard) {
      locDropdownCard.style.display = 'none';
    }
    if (locChevron) {
      locChevron.style.transform = 'rotate(0deg)';
    }
    executeSearch();
  }

  // Bind blocks selection
  document.querySelectorAll('.loc-grid-item').forEach(item => {
    item.addEventListener('click', () => {
      setLocation(item.getAttribute('data-value'));
    });
  });

  const locActionAll = document.getElementById('loc-action-all');
  if (locActionAll) {
    locActionAll.addEventListener('click', () => {
      setLocation('');
    });
  }

  // Geolocation detection handler
  const locActionDetect = document.getElementById('loc-action-detect');
  if (locActionDetect) {
    locActionDetect.addEventListener('click', () => {
      const subtitleText = locActionDetect.querySelector('span:nth-child(2)');
      const originalText = subtitleText ? subtitleText.textContent : 'Find listings near you';
      
      if (subtitleText) subtitleText.textContent = 'Detecting location...';

      if (!navigator.geolocation) {
        showToast('Geolocation is not supported by your browser', 'danger');
        if (subtitleText) subtitleText.textContent = originalText;
        return;
      }

      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12`);
          const data = await res.json();
          
          if (data && data.address) {
            const detected = data.address.suburb || data.address.neighbourhood || data.address.city_district || data.address.city || data.address.town || data.address.village || 'My Location';
            
            showToast(`Location detected: ${detected}`, 'success');
            if (subtitleText) subtitleText.textContent = originalText;
            setLocation(detected);
          } else {
            throw new Error('No location address returned');
          }
        } catch (err) {
          console.error(err);
          showToast('Failed to identify details', 'danger');
          if (subtitleText) subtitleText.textContent = originalText;
        }
      }, (err) => {
        console.error(err);
        showToast('Location permission denied or lookup timed out', 'warning');
        if (subtitleText) subtitleText.textContent = originalText;
      }, { timeout: 8000 });
    });
  }

  const userTrigger = document.getElementById('user-menu-trigger');
  const userDropdown = document.getElementById('user-menu-dropdown');
  if (userTrigger && userDropdown) {
    userTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.style.display = userDropdown.style.display === 'none' ? 'block' : 'none';
    });

    document.addEventListener('click', (e) => {
      if (!userDropdown.contains(e.target) && !userTrigger.contains(e.target)) {
        userDropdown.style.display = 'none';
      }
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      API.auth.logout();
    });
  }

  // Notification Polling System
  async function checkChatNotifications() {
    if (!API.auth.isAuthenticated()) return;
    try {
      const res = await API.chat.getAll();
      if (res.success && res.data) {
        const chats = res.data;
        const currentUser = API.auth.getCurrentUser();
        if (!currentUser) return;
        
        let hasUnread = false;
        let unreadCount = 0;
        let newChatsFound = [];

        chats.forEach(chat => {
          if (chat.lastMessage) {
            // Check if sender is NOT current user
            const senderId = chat.lastMessage.senderId._id || chat.lastMessage.senderId;
            const isFromOther = senderId.toString() !== currentUser.id.toString();
            
            if (isFromOther) {
              const lastSeen = localStorage.getItem(`unimart_chat_last_seen_${chat._id}`);
              const lastMsgTime = new Date(chat.lastMessage.createdAt).getTime();
              const lastSeenTime = lastSeen ? new Date(lastSeen).getTime() : 0;
              
              if (lastMsgTime > lastSeenTime + 1000) { // Add small padding for clock skew
                hasUnread = true;
                unreadCount++;
                
                // Track if this is a newly arrived message to trigger a Toast notification
                const lastNotified = localStorage.getItem(`unimart_chat_last_notified_${chat._id}`);
                const lastNotifiedTime = lastNotified ? new Date(lastNotified).getTime() : 0;
                
                if (lastMsgTime > lastNotifiedTime + 1000) {
                  localStorage.setItem(`unimart_chat_last_notified_${chat._id}`, chat.lastMessage.createdAt);
                  newChatsFound.push(chat);
                }
              }
            }
          }
        });

        // Update Notification Dot
        const notifDot = document.getElementById('chat-notif-dot');
        if (notifDot) {
          if (hasUnread) {
            notifDot.style.display = 'block';
            notifDot.title = `${unreadCount} unread chat thread(s)`;
          } else {
            notifDot.style.display = 'none';
          }
        }

        // Trigger toast alerts for newly arrived messages/offers
        newChatsFound.forEach(chat => {
          const partnerName = chat.buyerId._id === currentUser.id ? chat.sellerId.name : chat.buyerId.name;
          const isOffer = chat.lastMessage.message.startsWith('__OFFER__');
          const isOfferAccept = chat.lastMessage.message === '__OFFER_ACCEPT__';
          
          if (isOffer) {
            showToast(`🤝 New price offer from ${partnerName} on "${chat.productId.title}"!`, 'info');
          } else if (isOfferAccept) {
            showToast(`✅ ${partnerName} accepted your offer on "${chat.productId.title}"!`, 'success');
          } else {
            showToast(`💬 New message from ${partnerName}: "${chat.lastMessage.message.substring(0, 30)}..."`, 'info');
          }
        });
      }
    } catch (e) {
      console.error('Error checking chat notifications:', e);
    }
  }

  if (isAuthenticated) {
    checkChatNotifications();
    // Poll every 8 seconds for notifications
    setInterval(checkChatNotifications, 8000);
  }
}

function injectFooter() {
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;

  const footerContent = `
    <footer class="app-footer">
      <div class="footer-container">
        <div class="footer-grid">
          <!-- Col 1: Brand Info & Socials -->
          <div class="footer-col footer-brand-col">
            <a href="index.html" class="footer-logo">
              <svg class="logo-svg" style="width:32px; height:32px;" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="footer-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="var(--primary)"></stop>
                    <stop offset="100%" stop-color="hsl(calc(var(--primary-hue) + 30), 85%, 55%)"></stop>
                  </linearGradient>
                </defs>
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="url(#footer-logo-grad)"></path>
                <path d="M6 9.5V14a6 6 0 0 0 12 0V9.5" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>
                <path d="M9 10a3 3 0 0 1 6 0" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>
              </svg>
              <span>Uni<span style="color:var(--primary);">Mart</span></span>
            </a>
            <p class="footer-brand-desc">
              A secure, AI-powered campus marketplace for verified college students to buy, sell, and swap items safely.
            </p>
            <div class="footer-socials">
              <!-- Discord Inline SVG -->
              <a href="#" class="footer-social-icon" title="Discord" onclick="event.preventDefault();">
                <svg viewBox="0 0 127.14 96.36" style="width: 16px; height: 16px; fill: currentColor;">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77,77,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77,77,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c1-.75,2-1.55,3-2.38a75.4,75.4,0,0,0,72,0c1,.83,2,1.63,3,2.38a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.86,50.77,123.63,28.09,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
                </svg>
              </a>
              <!-- Instagram Inline SVG -->
              <a href="#" class="footer-social-icon" title="Instagram" onclick="event.preventDefault();">
                <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round;">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <!-- GitHub Inline SVG -->
              <a href="#" class="footer-social-icon" title="GitHub" onclick="event.preventDefault();">
                <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: currentColor;">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              </a>
              <!-- LinkedIn Inline SVG -->
              <a href="#" class="footer-social-icon" title="LinkedIn" onclick="event.preventDefault();">
                <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: currentColor;">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Col 2: Quick Links Grid -->
          <div class="footer-col footer-links-col">
            <h4>Quick Navigation</h4>
            <div class="footer-links-grid">
              <a href="marketplace.html">Browse Marketplace</a>
              <a href="help.html">Help & Support</a>
              <a href="help.html#safety">Safety Center</a>
              <a href="report-listing.html">Report a Listing</a>
              <a href="terms.html#honor-code">Honor Code</a>
              <a href="terms.html">Terms & Privacy</a>
            </div>
          </div>

          <!-- Col 3: Campus Partners -->
          <div class="footer-col footer-partners-col">
            <h4>Sponsors & Partners</h4>
            <div class="footer-partner-badges">
              <span class="footer-partner-logo">🏫 Student Council</span>
              <span class="footer-partner-logo">💡 Innovation Lab</span>
              <span class="footer-partner-logo">🌱 Green Campus</span>
            </div>
          </div>
        </div>

        <div class="footer-bottom-bar">
          <p>All rights reserved &copy; 2026 UniMart. Built for Students, by Students.</p>
          <div class="footer-bottom-links">
            <a href="#" onclick="event.preventDefault(); showToast('Campus Map is coming soon!', 'info');">Campus Map</a>
            <span>&bull;</span>
            <a href="#" onclick="event.preventDefault(); showToast('Support ticket system coming soon!', 'info');">Support</a>
          </div>
        </div>
      </div>
    </footer>
  `;

  placeholder.outerHTML = footerContent;
}
