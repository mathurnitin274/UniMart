document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect to marketplace
  if (API.auth.isAuthenticated()) {
    window.location.href = 'marketplace.html';
    return;
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (!email || !password) {
        showToast('Please fill in all fields', 'warning');
        return;
      }

      // Add a loading class or disable button to improve UX
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in...';

      try {
        const data = await API.auth.login(email, password);
        if (data.requiresOTP) {
          // Reset login button text
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;

          const openLoginOtpModal = (currentOtp) => {
            showOtpModal(
              email,
              async (otp, closeModal) => {
                try {
                  const verifyRes = await API.auth.verifyLoginOtp(email, otp);
                  if (verifyRes.success) {
                    showToast('Signed in successfully!', 'success');
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
                const resendData = await API.auth.login(email, password);
                openLoginOtpModal(resendData.otp);
              },
              currentOtp
            );
          };
          openLoginOtpModal(data.otp);
        } else if (data.success) {
          showToast('Signed in successfully!', 'success');
          setTimeout(() => {
            window.location.href = 'marketplace.html';
          }, 1000);
        }
      } catch (err) {
        // Error toast is already triggered inside API.request
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
