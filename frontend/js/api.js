const API_BASE = 'https://unimart-1-xnlh.onrender.com/api';

// --- Toast notification system ---
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button style="background:none;border:none;color:inherit;cursor:pointer;font-weight:bold;margin-left:8px;" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(toast);

  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// --- Request wrapper ---
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('unimart_token');
  
  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json();

    if (!res.ok) {
      // If unauthorized, clear token and redirect to login (if not already on login/register/index)
      if (res.status === 401 && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html') && !window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
        localStorage.removeItem('unimart_token');
        localStorage.removeItem('unimart_user');
        window.location.href = 'login.html';
      }
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err.message);
    showToast(err.message, 'danger');
    throw err;
  }
}

// --- API SDK functions ---
const API = {
  auth: {
    register: async (userData) => {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      if (data.data && data.data.token) {
        localStorage.setItem('unimart_token', data.data.token);
        localStorage.setItem('unimart_user', JSON.stringify(data.data.user));
      }
      return data;
    },
    login: async (email, password) => {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.data && data.data.token) {
        localStorage.setItem('unimart_token', data.data.token);
        localStorage.setItem('unimart_user', JSON.stringify(data.data.user));
      }
      return data;
    },
    googleLogin: async (payload) => {
      const data = await request('/auth/google', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (data.data && data.data.token) {
        localStorage.setItem('unimart_token', data.data.token);
        localStorage.setItem('unimart_user', JSON.stringify(data.data.user));
      }
      return data;
    },
    getGoogleClientId: async () => {
      return await request('/auth/google/client-id');
    },
    sendOtp: async (payload) => {
      return await request('/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    verifyLoginOtp: async (email, otp) => {
      const data = await request('/auth/login/verify', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
      if (data.data && data.data.token) {
        localStorage.setItem('unimart_token', data.data.token);
        localStorage.setItem('unimart_user', JSON.stringify(data.data.user));
      }
      return data;
    },
    getProfile: async () => {
      const data = await request('/auth/profile');
      if (data.success && data.data) {
        localStorage.setItem('unimart_user', JSON.stringify(data.data));
      }
      return data;
    },
    updateProfile: async (profileData) => {
      const data = await request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      if (data.success && data.data) {
        localStorage.setItem('unimart_user', JSON.stringify(data.data));
      }
      return data;
    },
    logout: () => {
      localStorage.removeItem('unimart_token');
      localStorage.removeItem('unimart_user');
      showToast('Logged out successfully', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 500);
    },
    getCurrentUser: () => {
      const userStr = localStorage.getItem('unimart_user');
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      if (user && user.id && !user._id) {
        user._id = user.id;
      }
      return user;
    },
    isAuthenticated: () => {
      return !!localStorage.getItem('unimart_token');
    }
  },

  products: {
    getAll: async (filters = {}) => {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return await request(`/products${queryString}`);
    },
    getOne: async (id) => {
      return await request(`/products/${id}`);
    },
    create: async (productData) => {
      return await request('/products', {
        method: 'POST',
        body: productData instanceof FormData ? productData : JSON.stringify(productData),
      });
    },
    update: async (id, productData) => {
      return await request(`/products/${id}`, {
        method: 'PUT',
        body: productData instanceof FormData ? productData : JSON.stringify(productData),
      });
    },
    delete: async (id) => {
      return await request(`/products/${id}`, {
        method: 'DELETE',
      });
    }
  },

  wishlist: {
    get: async () => {
      return await request('/wishlist');
    },
    add: async (productId) => {
      return await request(`/wishlist/${productId}`, {
        method: 'POST',
      });
    },
    delete: async (productId) => {
      return await request(`/wishlist/${productId}`, {
        method: 'DELETE',
      });
    }
  },

  chat: {
    getAll: async () => {
      return await request('/chat');
    },
    create: async (productId, sellerId) => {
      return await request('/chat', {
        method: 'POST',
        body: JSON.stringify({ productId, sellerId }),
      });
    },
    getMessages: async (chatId) => {
      return await request(`/chat/${chatId}/messages`);
    },
    sendMessage: async (chatId, messageText) => {
      return await request('/chat/message', {
        method: 'POST',
        body: JSON.stringify({ chatId, message: messageText }),
      });
    }
  },

  ai: {
    generateDescription: async (payload) => {
      return await request('/ai/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
  },

  admin: {
    getUsers: async () => {
      return await request('/admin/users');
    },
    getProducts: async () => {
      return await request('/admin/products');
    },
    updateProductStatus: async (id, status) => {
      return await request(`/admin/products/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    }
  }
};

// --- Theme Utility ---
const ThemeUtil = {
  init: () => {
    const savedTheme = localStorage.getItem('unimart_theme') || 'light';
    const savedHue = localStorage.getItem('unimart_hue') || '250';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.style.setProperty('--primary-hue', savedHue);
  },
  toggleMode: () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('unimart_theme', newTheme);
    return newTheme;
  },
  setHue: (hue) => {
    document.documentElement.style.setProperty('--primary-hue', hue);
    localStorage.setItem('unimart_hue', hue);
  },
  getHue: () => {
    return localStorage.getItem('unimart_hue') || '250';
  },
  getTheme: () => {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }
};

// Auto initialize theme settings
ThemeUtil.init();

// --- OTP Verification Modal Helper ---
function showOtpModal(target, onVerify, onResend, devOtp = null) {
  let modal = document.getElementById('otp-verification-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'otp-verification-modal';
  modal.style = `
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  const modalContent = document.createElement('div');
  modalContent.className = 'glass-card';
  modalContent.style = `
    width: 100%;
    max-width: 440px;
    padding: 36px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    text-align: center;
    transform: translateY(20px);
    transition: transform 0.3s ease;
  `;

  modalContent.innerHTML = `
    <h3 style="font-size: 1.6rem; font-weight:700; margin-bottom: 8px; color:var(--text);">Enter Verification Code</h3>
    <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 24px;">
      We've sent a 6-digit verification code to <br>
      <strong style="color: var(--primary); word-break: break-all;">${target}</strong>
    </p>
    
    <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 24px;">
      <input type="text" maxlength="1" class="otp-input-field" style="width: 48px; height: 52px; text-align: center; font-size: 1.5rem; font-weight: 700; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface-hover); color: var(--text);" />
      <input type="text" maxlength="1" class="otp-input-field" style="width: 48px; height: 52px; text-align: center; font-size: 1.5rem; font-weight: 700; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface-hover); color: var(--text);" />
      <input type="text" maxlength="1" class="otp-input-field" style="width: 48px; height: 52px; text-align: center; font-size: 1.5rem; font-weight: 700; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface-hover); color: var(--text);" />
      <input type="text" maxlength="1" class="otp-input-field" style="width: 48px; height: 52px; text-align: center; font-size: 1.5rem; font-weight: 700; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface-hover); color: var(--text);" />
      <input type="text" maxlength="1" class="otp-input-field" style="width: 48px; height: 52px; text-align: center; font-size: 1.5rem; font-weight: 700; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface-hover); color: var(--text);" />
      <input type="text" maxlength="1" class="otp-input-field" style="width: 48px; height: 52px; text-align: center; font-size: 1.5rem; font-weight: 700; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface-hover); color: var(--text);" />
    </div>

    <div style="margin-bottom: 24px;">
      <span style="font-size: 0.9rem; color: var(--text-muted);">Didn't receive the code?</span>
      <button type="button" id="otp-resend-btn" style="background: none; border: none; color: var(--primary); font-weight: 600; cursor: pointer; font-size: 0.9rem; padding: 0 4px; text-decoration: underline;">Resend</button>
    </div>

    <div style="display: flex; gap: 12px;">
      <button type="button" id="otp-cancel-btn" class="btn btn-secondary" style="flex: 1; padding: 12px;">Cancel</button>
      <button type="button" id="otp-submit-btn" class="btn btn-primary" style="flex: 1; padding: 12px;" disabled>Verify Code</button>
    </div>
  `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  setTimeout(() => {
    modal.style.opacity = '1';
    modalContent.style.transform = 'translateY(0)';
  }, 10);

  const inputs = modalContent.querySelectorAll('.otp-input-field');
  inputs[0].focus();

  // Focus and advanced navigation handler
  inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      input.value = input.value.replace(/[^0-9]/g, '');
      if (input.value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
      checkOTPCompletion();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && input.value.length === 0 && index > 0) {
        inputs[index - 1].focus();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
      if (pasteData.length > 0) {
        let pasteIndex = index;
        for (let i = 0; i < pasteData.length && pasteIndex < inputs.length; i++) {
          inputs[pasteIndex].value = pasteData[i];
          pasteIndex++;
        }
        if (pasteIndex < inputs.length) {
          inputs[pasteIndex].focus();
        } else {
          inputs[inputs.length - 1].focus();
        }
        checkOTPCompletion();
      }
    });
  });

  const checkOTPCompletion = () => {
    const submitBtn = document.getElementById('otp-submit-btn');
    const otp = Array.from(inputs).map(i => i.value).join('');
    submitBtn.disabled = otp.length !== 6;
  };

  const closeModal = () => {
    modal.style.opacity = '0';
    modalContent.style.transform = 'translateY(20px)';
    setTimeout(() => modal.remove(), 300);
  };

  document.getElementById('otp-cancel-btn').addEventListener('click', closeModal);
  
  document.getElementById('otp-submit-btn').addEventListener('click', async () => {
    const otp = Array.from(inputs).map(i => i.value).join('');
    const submitBtn = document.getElementById('otp-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';
    try {
      await onVerify(otp, closeModal);
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Verify Code';
    }
  });

  if (onResend) {
    document.getElementById('otp-resend-btn').addEventListener('click', async () => {
      const resendBtn = document.getElementById('otp-resend-btn');
      resendBtn.disabled = true;
      resendBtn.textContent = 'Sending...';
      try {
        await onResend();
        showToast('Verification code resent successfully', 'success');
      } catch (err) {
        // error handled by wrapper
      } finally {
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend';
      }
    });
  }
}
