document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    showToast('Product ID not specified', 'warning');
    setTimeout(() => {
      window.location.href = 'marketplace.html';
    }, 1000);
    return;
  }

  let product = null;
  let isWishlisted = false;
  const user = API.auth.getCurrentUser();

  const loadingEl = document.getElementById('details-loading');
  const detailsView = document.getElementById('details-view');

  // Load product details
  try {
    const res = await API.products.getOne(productId);
    if (res.success && res.data) {
      product = res.data;
      await checkWishlistStatus();
      renderProductDetails();
    } else {
      throw new Error('Could not fetch product details');
    }
  } catch (err) {
    loadingEl.innerHTML = `<p style="color:var(--danger); font-weight:600;">Error: ${err.message}</p>`;
  }

  async function checkWishlistStatus() {
    if (!API.auth.isAuthenticated()) return;
    try {
      const wishRes = await API.wishlist.get();
      if (wishRes.success && wishRes.data) {
        isWishlisted = wishRes.data.some(item => {
          const prodId = item.productId?._id || item.productId || item._id;
          return prodId === productId;
        });
      }
    } catch(e) {}
  }

  function renderProductDetails() {
    loadingEl.style.display = 'none';
    detailsView.style.display = 'grid';

    // 1. Details binding
    document.getElementById('product-title').textContent = product.title;
    document.getElementById('product-price').textContent = `₹${product.price.toLocaleString()}`;
    document.getElementById('product-category-label').textContent = `in ${product.category}`;
    document.getElementById('product-description').textContent = product.description;

    // Condition Badge styling
    const condBadge = document.getElementById('product-condition-badge');
    condBadge.textContent = product.condition;
    condBadge.className = `badge badge-${product.condition.toLowerCase().replace(' ', '-')}`;

    // 2. Decode Specs
    let specObj = {};
    try {
      if (product.specifications && product.specifications.startsWith('{')) {
        specObj = JSON.parse(product.specifications);
      }
    } catch(e) {}

    // Campus specific features rendering
    const dormBadge = document.getElementById('product-dorm-badge');
    const dormVal = specObj.location || specObj.dorm || 'Campus Pickup';
    dormBadge.innerHTML = `📍 <strong>Location / Proximity:</strong> ${dormVal}`;

    const courseBadge = document.getElementById('product-course-badge');
    if (specObj.courseCode) {
      courseBadge.innerHTML = `📚 <strong>Target Course:</strong> ${specObj.courseCode.toUpperCase()}`;
      courseBadge.style.display = 'block';
    } else {
      courseBadge.style.display = 'none';
    }

    const swapBadge = document.getElementById('product-swap-badge');
    if (specObj.swap) {
      swapBadge.style.display = 'inline-block';
    } else {
      swapBadge.style.display = 'none';
    }

    // Dynamic specs table
    const specsList = document.getElementById('specs-list');
    let specsHTML = '';
    
    // Add default rows
    specsHTML += createSpecRow('Condition', product.condition);
    specsHTML += createSpecRow('Listed Date', new Date(product.createdAt).toLocaleDateString());
    
    if (dormVal) specsHTML += createSpecRow('Location / Proximity', dormVal);
    if (specObj.courseCode) specsHTML += createSpecRow('Course Specifics', specObj.courseCode.toUpperCase());
    if (specObj.swap) specsHTML += createSpecRow('Trade/Swap Mode', 'Available for barter');

    // Add general details
    if (specObj.details) {
      specsHTML += createSpecRow('Extra Specs', specObj.details);
    } else if (product.specifications && !product.specifications.startsWith('{')) {
      specsHTML += createSpecRow('Specifications', product.specifications);
    }

    specsList.innerHTML = specsHTML;

    // Update Report Link
    const reportLink = document.getElementById('report-listing-link');
    if (reportLink) {
      reportLink.href = `report-listing.html?id=${product._id}`;
    }

    // 3. Images rendering
    const mainImgEl = document.getElementById('main-product-img');
    const mainImgUrl = product.images && product.images.length > 0 
      ? product.images[0].url 
      : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=60';
    mainImgEl.src = mainImgUrl;

    const thumbGrid = document.getElementById('thumbnail-grid');
    if (product.images && product.images.length > 0) {
      thumbGrid.innerHTML = product.images.map((img, i) => `
        <div class="thumb-card ${i === 0 ? 'active' : ''}" onclick="switchMainImage('${img.url}', this)">
          <img src="${img.url}" alt="Thumbnail ${i+1}">
        </div>
      `).join('');
    } else {
      thumbGrid.innerHTML = '';
    }

    // 4. Seller details binding
    const seller = product.sellerId || {};
    document.getElementById('seller-name').textContent = seller.name || 'Anonymous Student';
    
    const college = seller.college || 'State University';
    const dept = seller.department || 'N/A';
    const year = seller.year ? `(${seller.year})` : '';
    document.getElementById('seller-edu-info').textContent = `${college} &middot; ${dept} ${year}`;
    
    const avatar = seller.profileImage || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NiZDVlMSI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg==';
    document.getElementById('seller-avatar').src = avatar;

    // 5. Wishlist button label
    const wishlistBtn = document.getElementById('toggle-details-wishlist-btn');
    wishlistBtn.innerHTML = isWishlisted ? '❤️ In Wishlist' : '🤍 Add to Wishlist';

    // 6. Moderation Controls Checks
    const isOwner = user && seller._id === user._id;
    const isAdmin = user && user.role === 'admin';

    if (isOwner || isAdmin) {
      const modPanel = document.getElementById('moderation-controls');
      modPanel.style.display = 'block';

      const statusSelect = document.getElementById('mod-status-select');
      statusSelect.value = product.status;

      // Dropdown changes status
      statusSelect.addEventListener('change', async (e) => {
        const newStatus = e.target.value;
        try {
          let modRes;
          if (isAdmin) {
            modRes = await API.admin.updateProductStatus(productId, newStatus);
          } else {
            modRes = await API.products.update(productId, { status: newStatus });
          }
          if (modRes.success) {
            showToast(`Product marked as ${newStatus}!`, 'success');
            product.status = newStatus;
          }
        } catch(err) {
          statusSelect.value = product.status;
        }
      });

      // Delete listing
      const deleteBtn = document.getElementById('mod-delete-btn');
      deleteBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to remove this product listing? This cannot be undone.')) {
          try {
            const delRes = await API.products.delete(productId);
            if (delRes.success) {
              showToast('Product removed successfully', 'success');
              setTimeout(() => {
                window.location.href = 'marketplace.html';
              }, 800);
            }
          } catch(err) {}
        }
      });
    }

    // Hide actions if the item is sold or removed
    if (product.status !== 'available' && !isOwner && !isAdmin) {
      document.getElementById('chat-seller-btn').disabled = true;
      document.getElementById('chat-seller-btn').textContent = 'Product Sold';
      document.getElementById('open-offer-modal-btn').style.display = 'none';
    }
  }

  function createSpecRow(key, value) {
    return `
      <div style="display:flex; justify-content:space-between; padding: 8px 0; border-bottom:1px solid var(--border); font-size:0.9rem;">
        <span style="color:var(--text-muted); font-weight:550;">${key}</span>
        <span style="font-weight:600; text-align:right;">${value}</span>
      </div>
    `;
  }

  // Gallery swapping
  window.switchMainImage = (url, thumbEl) => {
    document.getElementById('main-product-img').src = url;
    document.querySelectorAll('.thumb-card').forEach(card => card.classList.remove('active'));
    thumbEl.classList.add('active');
  };

  // Zoom Modal triggers
  const zoomTrigger = document.getElementById('zoom-trigger');
  const zoomModal = document.getElementById('zoom-modal');
  const zoomImg = document.getElementById('zoom-img');

  if (zoomTrigger && zoomModal && zoomImg) {
    zoomTrigger.addEventListener('click', () => {
      zoomImg.src = document.getElementById('main-product-img').src;
      zoomModal.style.display = 'flex';
    });

    zoomModal.addEventListener('click', () => {
      zoomModal.style.display = 'none';
    });
  }

  // Wishlist Action
  const wishlistBtn = document.getElementById('toggle-details-wishlist-btn');
  wishlistBtn.addEventListener('click', async () => {
    if (!API.auth.isAuthenticated()) {
      showToast('Please login to wishlist items', 'warning');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 800);
      return;
    }

    wishlistBtn.disabled = true;
    try {
      if (isWishlisted) {
        const data = await API.wishlist.delete(productId);
        if (data.success) {
          isWishlisted = false;
          wishlistBtn.innerHTML = '🤍 Add to Wishlist';
          showToast('Removed from wishlist', 'success');
        }
      } else {
        const data = await API.wishlist.add(productId);
        if (data.success) {
          isWishlisted = true;
          wishlistBtn.innerHTML = '❤️ In Wishlist';
          showToast('Added to wishlist!', 'success');
        }
      }
    } catch(err) {
      console.error(err);
    } finally {
      wishlistBtn.disabled = false;
    }
  });

  // Chat with Seller Action
  const chatSellerBtn = document.getElementById('chat-seller-btn');
  chatSellerBtn.addEventListener('click', async () => {
    if (!API.auth.isAuthenticated()) {
      showToast('Please login to chat with the seller', 'warning');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 800);
      return;
    }

    if (product.sellerId._id === user._id) {
      showToast('You cannot chat with yourself!', 'warning');
      return;
    }

    chatSellerBtn.disabled = true;
    chatSellerBtn.textContent = 'Opening chat...';

    try {
      const chatRes = await API.chat.create(productId, product.sellerId._id);
      if (chatRes.success && chatRes.data) {
        window.location.href = `chat.html?chatId=${chatRes.data._id}`;
      }
    } catch(err) {
      chatSellerBtn.disabled = false;
      chatSellerBtn.textContent = '💬 Chat with Seller';
    }
  });

  // Make Offer Modals
  const offerModal = document.getElementById('offer-modal');
  const openOfferBtn = document.getElementById('open-offer-modal-btn');
  const closeOfferBtn = document.getElementById('close-offer-modal');
  const sendOfferBtn = document.getElementById('send-offer-btn');

  if (openOfferBtn && offerModal && closeOfferBtn && sendOfferBtn) {
    openOfferBtn.addEventListener('click', () => {
      if (!API.auth.isAuthenticated()) {
        showToast('Please login to negotiate', 'warning');
        setTimeout(() => { window.location.href = 'login.html'; }, 800);
        return;
      }
      if (product.sellerId._id === user._id) {
        showToast('You cannot offer to buy your own item!', 'warning');
        return;
      }
      offerModal.style.display = 'flex';
      document.getElementById('offer-amount').value = product.price;
    });

    closeOfferBtn.addEventListener('click', () => {
      offerModal.style.display = 'none';
    });

    sendOfferBtn.addEventListener('click', async () => {
      const amount = parseFloat(document.getElementById('offer-amount').value);
      if (isNaN(amount) || amount < 0) {
        showToast('Please enter a valid offer price', 'warning');
        return;
      }

      sendOfferBtn.disabled = true;
      sendOfferBtn.textContent = 'Sending offer...';

      try {
        // 1. Create or retrieve active chat thread
        const chatRes = await API.chat.create(productId, product.sellerId._id);
        if (chatRes.success && chatRes.data) {
          const chatId = chatRes.data._id;
          
          // 2. Format a system-tagged interactive offer message inside message string
          const payload = {
            amount: amount,
            status: 'pending'
          };
          const offerString = `__OFFER__:${JSON.stringify(payload)}`;
          
          // 3. Send message
          await API.chat.sendMessage(chatId, offerString);
          
          showToast('Offer sent! Redirecting to chat...', 'success');
          setTimeout(() => {
            window.location.href = `chat.html?chatId=${chatId}`;
          }, 1000);
        }
      } catch(err) {
        sendOfferBtn.disabled = false;
        sendOfferBtn.textContent = 'Send Offer in Chat';
      }
    });
  }
});
