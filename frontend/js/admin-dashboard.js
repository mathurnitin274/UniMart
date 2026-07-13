document.addEventListener('DOMContentLoaded', async () => {
  const user = API.auth.getCurrentUser();
  const isAdmin = user && user.role === 'admin';

  const unauthView = document.getElementById('admin-unauthorized');
  const adminContent = document.getElementById('admin-content');

  if (!isAdmin) {
    unauthView.style.display = 'block';
    adminContent.remove();
    return;
  }

  adminContent.style.display = 'block';

  // Tabs binding
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });

  // Load Data
  let usersList = [];
  let productsList = [];

  try {
    const [usersRes, productsRes] = await Promise.all([
      API.admin.getUsers(),
      API.admin.getProducts()
    ]);

    if (usersRes.success) {
      // Backend getUsers returns list under data.data or data. Let's see.
      // Looking at getProducts, it populates in "data".
      // Let's assume data or data.data, let's write a safe fallback.
      usersList = usersRes.data || usersRes.users || [];
    }
    
    if (productsRes.success) {
      productsList = productsRes.data || productsRes.products || [];
    }

    renderStats();
    renderProducts();
    renderUsers();

  } catch(err) {
    console.error('Failed to load admin lists', err);
    showToast('Failed to load admin assets', 'danger');
  }

  function renderStats() {
    document.getElementById('stat-total-users').textContent = usersList.length;
    document.getElementById('stat-total-products').textContent = productsList.length;
    
    const activeCount = productsList.filter(p => p.status === 'available').length;
    document.getElementById('stat-active-products').textContent = activeCount;
  }

  function renderProducts() {
    const tbody = document.getElementById('admin-products-table-body');
    if (productsList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No product listings exist</td></tr>';
      return;
    }

    tbody.innerHTML = productsList.map(prod => {
      const mainImg = prod.images && prod.images.length > 0 
        ? prod.images[0].url 
        : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100&auto=format&fit=crop&q=60';
      
      const statusPill = `status-${prod.status}`;
      
      return `
        <tr data-id="${prod._id}">
          <td><img src="${mainImg}" alt="Product thumb"></td>
          <td>
            <div style="font-weight:700; cursor:pointer;" onclick="window.location.href='product-details.html?id=${prod._id}'">${prod.title}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">ID: ${prod._id}</div>
          </td>
          <td style="font-weight:700;">₹${prod.price.toLocaleString()}</td>
          <td>${prod.category}</td>
          <td><span class="status-pill ${statusPill}" id="status-pill-${prod._id}">${prod.status}</span></td>
          <td>
            <select class="form-control" style="padding: 6px 12px; font-size:0.8rem;" onchange="adminUpdateStatus('${prod._id}', this)">
              <option value="available" ${prod.status === 'available' ? 'selected' : ''}>Available</option>
              <option value="sold" ${prod.status === 'sold' ? 'selected' : ''}>Sold</option>
              <option value="removed" ${prod.status === 'removed' ? 'selected' : ''}>Removed</option>
            </select>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderUsers() {
    const tbody = document.getElementById('admin-users-table-body');
    if (usersList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No students exist in database</td></tr>';
      return;
    }

    tbody.innerHTML = usersList.map(u => {
      const avatar = u.profileImage || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NiZDVlMSI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg==';
      const roleLabel = u.role === 'admin' ? '<span style="color:var(--danger); font-weight:700;">ADMIN</span>' : 'Student';
      
      return `
        <tr>
          <td class="avatar-col"><img src="${avatar}" alt="Avatar"></td>
          <td><strong style="font-size:0.95rem;">${u.name}</strong></td>
          <td>${u.email}</td>
          <td>
            <div>${u.college}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${u.department}</div>
          </td>
          <td>${u.year}</td>
          <td>${roleLabel}</td>
        </tr>
      `;
    }).join('');
  }

  // Exposed globally to handle action changes in select options
  window.adminUpdateStatus = async (productId, selectEl) => {
    const newStatus = selectEl.value;
    try {
      const res = await API.admin.updateProductStatus(productId, newStatus);
      if (res.success) {
        showToast('Product status updated by Admin!', 'success');
        
        // Update pill directly in UI
        const pill = document.getElementById(`status-pill-${productId}`);
        if (pill) {
          pill.className = `status-pill status-${newStatus}`;
          pill.textContent = newStatus;
        }

        // Recalculate stats
        const productIndex = productsList.findIndex(p => p._id === productId);
        if (productIndex !== -1) {
          productsList[productIndex].status = newStatus;
          renderStats();
        }
      }
    } catch(err) {
      // Revert select option
      const product = productsList.find(p => p._id === productId);
      if (product) selectEl.value = product.status;
    }
  };
});
