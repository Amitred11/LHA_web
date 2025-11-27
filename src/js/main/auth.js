document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Password Toggler Helper ---
    const setupPasswordToggler = (toggleBtnId, inputId) => {
        const toggleBtn = document.getElementById(toggleBtnId);
        const input = document.getElementById(inputId);

        if (toggleBtn && input) {
            toggleBtn.addEventListener('click', function (e) {
                e.preventDefault();
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                const icon = this.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-eye');
                    icon.classList.toggle('fa-eye-slash');
                }
            });
        }
    };

    setupPasswordToggler('togglePassword', 'password');
    setupPasswordToggler('toggleSignupPass', 'signup-pass');
    setupPasswordToggler('toggleSignupConfirm', 'signup-confirm');


    // --- 2. Universal Form Handler ---
    const API_URL = 'https://backendkostudy.onrender.com/auth'; 

    const handleAuthSubmit = async (event, endpoint) => {
        event.preventDefault();
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Password Matching Validation
        if (endpoint === '/register') {
            const password = form.querySelector('[name="password"]').value;
            const confirm = form.querySelector('[name="confirm_password"]').value;

            if (password !== confirm) {
                if(typeof showAlert === 'function') showAlert('Validation Error', 'Passwords do not match.', 'error');
                else alert('Passwords do not match');
                return;
            }
        }
        
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing...';

        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            console.log("Server Response:", result);

            if (response.ok) {
                if(typeof showAlert === 'function') showAlert('Access Granted', result.message || 'Welcome back.', 'success');
                
                if (result.access_token) {
                    localStorage.setItem('accessToken', result.access_token);
                    localStorage.setItem('isLoggedIn', 'true');
                    
                    let finalUserId = result.user_id || result.userId || result.id;

                    if (!finalUserId) {
                        try {
                            const tokenParts = result.access_token.split('.');
                            const payload = JSON.parse(atob(tokenParts[1]));
                            finalUserId = payload.sub || payload.identity || payload.user_id; 
                        } catch (e) {
                            console.error("Could not decode token to find User ID", e);
                        }
                    }

                    if (finalUserId) localStorage.setItem('userId', finalUserId);
                    if (payload.username) localStorage.setItem('username', payload.username);
                    
                    setTimeout(() => {
                        window.location.href = '/index.html';
                    }, 1500);
                } 
                else if (endpoint === '/recover') {
                    submitBtn.innerHTML = 'Check Email';
                }
            } else {
                if(typeof showAlert === 'function') showAlert('Access Denied', result.message || 'Operation failed.', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
            }
        } catch (error) {
            console.error('Auth Error:', error);
            if(typeof showAlert === 'function') showAlert('System Error', 'Could not connect to the mainframe.', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
        }
    };

    // --- 3. Social Login Handler ---
    const handleSocialLogin = (provider) => {
        // This expects your backend to have routes like /auth/google, /auth/github
        // which then redirect to the actual OAuth providers.
        
        const targetUrl = `${API_URL}/${provider}`;
        
        // Visual feedback
        if(typeof showAlert === 'function') {
            showAlert('Redirecting', `Connecting to ${provider}...`, 'success');
        }

        // 1. If backend is ready, uncomment this:
        // window.location.href = targetUrl;

        // 2. OR For now (Simulation):
        console.log(`Attempting social login with: ${targetUrl}`);
        setTimeout(() => {
             if(typeof showAlert === 'function') showAlert('System Notice', `Social login for ${provider} is currently in maintenance.`, 'warning');
        }, 1000);
    };

    // --- 4. Attach Listeners ---
    
    // Forms
    const signinForm = document.getElementById('signin-form');
    if (signinForm) signinForm.addEventListener('submit', (e) => handleAuthSubmit(e, '/login')); 

    const signupForm = document.getElementById('signup-form');
    if (signupForm) signupForm.addEventListener('submit', (e) => handleAuthSubmit(e, '/register'));

    const recoveryForm = document.getElementById('recovery-form');
    if (recoveryForm) recoveryForm.addEventListener('submit', (e) => handleAuthSubmit(e, '/recover'));

    // Social Buttons
    const socialBtns = document.querySelectorAll('.social-auth-btn');
    socialBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const provider = btn.getAttribute('data-provider');
            handleSocialLogin(provider);
        });
    });
});