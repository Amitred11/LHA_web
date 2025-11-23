document.addEventListener('DOMContentLoaded', () => {
    // Toggle Password Visibility
    const togglePassword = document.querySelector('#togglePassword');
    const passwordInput = document.querySelector('#password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // Select Forms
    const signInForm = document.querySelector('#signInForm');
    const signUpForm = document.querySelector('form[action="#"]'); // Adjust selector if your signup HTML differs

    // Helper: Custom Alert Wrapper
    const notify = (title, msg, type) => {
        if(typeof showAlert === 'function') {
            showAlert(title, msg, type);
        } else {
            alert(`${title}: ${msg}`);
        }
    };

    // Universal Form Handler
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
            const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                // Success
                notify('Success', result.message || 'Authentication successful!', 'success');
                
                // Store Token
                if (result.access_token) {
                    localStorage.setItem('accessToken', result.access_token);
                    localStorage.setItem('isLoggedIn', 'true');
                    // Optional: Store username if backend sends it
                    if(payload.username) localStorage.setItem('username', payload.username);
                }

                // Redirect
                setTimeout(() => {
                    window.location.href = '../../../src/screens/main/index.html';
                }, 1500);
            } else {
                // API Error
                notify('Error', result.message || 'Authentication failed.', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
            }
        } catch (error) {
            // Network Error
            console.error('Auth Error:', error);
            notify('Network Error', 'Could not connect to the server. Is app.py running?', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
        }
    };

    // Attach Listeners
    if (signInForm) {
        signInForm.addEventListener('submit', (e) => handleAuthSubmit(e, '/login'));
    }
    
    // Note: Ensure your Signup Form in signup.html has an ID or specific selector
    const registerForm = document.querySelector('#signup-form') || document.querySelector('form:not(#signInForm)'); 
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => handleAuthSubmit(e, '/register'));
    }
});