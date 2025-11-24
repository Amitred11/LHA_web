document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Password Toggler ---
    const togglePassword = document.querySelector('#togglePassword');
    const passwordInput = document.querySelector('#password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle icon
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    }

    // --- 2. Universal Form Handler ---
    // Ensure this matches your running backend URL
    const API_URL = 'https://backendkostudy.onrender.com/auth'; 

    const handleAuthSubmit = async (event, endpoint) => {
        event.preventDefault();
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // UI Loading State
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing...';

        // Gather Data
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                // FIX: Used showAlert instead of showToast
                showAlert('Access Granted', result.message || 'Welcome back.', 'success');
                
                // Store Token if login/signup
                if (result.access_token) {
                    localStorage.setItem('accessToken', result.access_token);
                    localStorage.setItem('isLoggedIn', 'true');
                    if(payload.username) localStorage.setItem('username', payload.username);
                    
                    // Redirect after 1.5 seconds so user can see the toast
                    setTimeout(() => {
                        window.location.href = '/index.html';
                    }, 1500);
                } else if (endpoint === '/recover') {
                    submitBtn.innerHTML = 'Check Email';
                }
            } else {
                // FIX: Used showAlert
                showAlert('Access Denied', result.message || 'Operation failed.', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
            }
        } catch (error) {
            console.error('Auth Error:', error);
            // FIX: Used showAlert
            showAlert('System Error', 'Could not connect to the mainframe.', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
        }
    };

    // --- 3. Attach Listeners ---
    const signinForm = document.getElementById('signin-form');
    if (signinForm) signinForm.addEventListener('submit', (e) => handleAuthSubmit(e, '/login')); 
    // Note: Ensure endpoint matches your Python Flask routes (e.g., /auth/login vs /login)

    const signupForm = document.getElementById('signup-form');
    if (signupForm) signupForm.addEventListener('submit', (e) => handleAuthSubmit(e, '/register'));

    const recoveryForm = document.getElementById('recovery-form');
    if (recoveryForm) recoveryForm.addEventListener('submit', (e) => handleAuthSubmit(e, '/recover'));
});