document.addEventListener('DOMContentLoaded', () => {
  if (!API.auth.isAuthenticated()) {
    showToast('Please login to view your wishlist', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
    return;
  }

  const grid = document.getElementById('wishlist-grid');
  const loader = document.getElementById('wishlist-loading');
  const emptyState = document.getElementById('wishlist-empty');

  loadWishlist();

  async function loadWishlist() {
    grid.innerHTML = '';
    loader.style.display = 'block';
    emptyState.style.display = 'none';

    try {
      const res = await API.wishlist.get();
      loader.style.display = 'none';

      const items = res.data || [];

      // Filter out items that might have a null product (if product was deleted)
      const validItems = items.filter(item => item.productId && item.productId._id);

      if (res.success && validItems.length > 0) {
        grid.innerHTML = validItems.map(item => {
          const prod = item.productId;
          let specObj = {};
          try {
            if (prod.specifications && prod.specifications.startsWith('{')) {
              specObj = JSON.parse(prod.specifications);
            }
          } catch(e) {}

          const dorm = specObj.dorm || '';
          const condClass = `badge-${prod.condition.toLowerCase().replace(' ', '-')}`;
          
          const mainImg = prod.images && prod.images.length > 0 
            ? prod.images[0].url 
            : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60';

          return `
            <div class="glass-card product-card" id="wish-card-${prod._id}">
              <button class="wishlist-btn active" onclick="removeFromWishlistPage('${prod._id}')">
                ❤️
              </button>
              
              <div style="overflow:hidden; height:200px; background:var(--border);">
                <img class="product-card-img" src="${mainImg}" alt="${prod.title}" onclick="window.location.href='product-details.html?id=${prod._id}'" style="cursor:pointer;">
              </div>
              
              <div style="padding:16px; display:flex; flex-direction:column; gap:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span class="badge ${condClass}">${prod.condition}</span>
                  ${specObj.swap ? '<span class="badge badge-swap">Swap</span>' : ''}
                </div>
                
                <h4 style="font-weight:700; font-size:1.1rem; cursor:pointer;" onclick="window.location.href='product-details.html?id=${prod._id}'">${prod.title}</h4>
                <p style="font-size:1.25rem; font-weight:800; color:var(--primary);">₹${prod.price.toLocaleString()}</p>
                ${dorm ? `<p style="font-size:0.8rem; color:var(--text-muted); margin-top:auto;">📍 ${dorm}</p>` : ''}
              </div>
            </div>
          `;
        }).join('');
      } else {
        emptyState.style.display = 'block';
      }
    } catch(err) {
      loader.style.display = 'none';
      emptyState.style.display = 'block';
    }
  }

  window.removeFromWishlistPage = async (productId) => {
    try {
      const res = await API.wishlist.delete(productId);
      if (res.success) {
        showToast('Removed from wishlist', 'success');
        
        // Remove from DOM directly
        const card = document.getElementById(`wish-card-${productId}`);
        if (card) {
          card.remove();
        }
        
        // Check if now empty
        if (grid.children.length === 0) {
          emptyState.style.display = 'block';
        }
      }
    } catch(err) {
      console.error(err);
    }
  };
});
