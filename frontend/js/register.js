document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect to marketplace
  if (API.auth.isAuthenticated()) {
    window.location.href = 'marketplace.html';
    return;
  }

  const registerForm = document.getElementById('register-form');
  const emailInput = document.getElementById('email');
  const emailBadge = document.getElementById('email-badge');



  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const college = document.getElementById('college').value.trim();
      const department = document.getElementById('department').value.trim();
      const year = document.getElementById('year').value;
      const phone = document.getElementById('phone').value.trim();

      const fileInput = document.getElementById('profileImage');
      let profileImageBase64 = "";

      if (!name || !email || !password || !college || !department || !year) {
        showToast('Please fill in all required fields', 'warning');
        return;
      }

      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending OTP...';

      if (fileInput && fileInput.files && fileInput.files[0]) {
        try {
          const toBase64 = file => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
          });
          profileImageBase64 = await toBase64(fileInput.files[0]);
        } catch (err) {
          console.error("Failed to convert profile image", err);
        }
      }

      const payload = {
        name,
        email,
        password,
        college,
        department,
        year
      };

      if (phone) payload.phone = phone;
      if (profileImageBase64) payload.profileImage = profileImageBase64;

      try {
        const openRegisterOtpModal = (currentOtp) => {
          showOtpModal(
            phone || email,
            async (otp, closeModal) => {
              try {
                const data = await API.auth.register({ ...payload, otp });
                if (data.success) {
                  showToast('Account created successfully!', 'success');
                  closeModal();
                  setTimeout(() => {
                    window.location.href = 'marketplace.html';
                  }, 1000);
                }
              } catch (err) {
                throw err;
              }
            },
            async () => {
              const resendRes = await API.auth.sendOtp({ email, phone });
              openRegisterOtpModal(resendRes.otp);
            },
            currentOtp
          );
        };
        
        const initialRes = await API.auth.sendOtp({ email, phone });
        
        // Reset submit button text
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

        openRegisterOtpModal(initialRes.otp);
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // Google Sign-In initialization
  async function initGoogleSignIn() {
    try {
      const res = await API.auth.getGoogleClientId();
      const clientId = res.clientId;

      if (clientId) {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              const payload = {
                idToken: response.credential,
                googleVerified: true
              };

              const loginRes = await API.auth.googleLogin(payload);
              if (loginRes.success) {
                showToast("Google sign-in successful!", "success");
                setTimeout(() => {
                  window.location.href = "marketplace.html";
                }, 1000);
              }
            } catch (err) {
              showToast(err.message || "Google Authentication failed", "danger");
            }
          }
        });

        google.accounts.id.renderButton(
          document.getElementById('google-login-button-container'),
          { theme: 'outline', size: 'large', width: '100%', text: 'continue_with' }
        );
      } else {
        const container = document.getElementById('google-login-button-container');
        if (container) {
          container.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding:10px; border:1px dashed var(--border); border-radius:var(--radius-sm); width: 100%;">Google Sign-in not configured. Set GOOGLE_CLIENT_ID in backend/.env</p>`;
        }
      }
    } catch (err) {
      console.error("Failed to initialize Google Sign-In:", err);
    }
  }

  if (window.google) {
    initGoogleSignIn();
  } else {
    window.addEventListener('load', () => {
      if (window.google) initGoogleSignIn();
    });
  }
});
