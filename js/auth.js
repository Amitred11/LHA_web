document.addEventListener('DOMContentLoaded', () => {
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

    const signInForm = document.querySelector('#signInForm');
    const signUpForm = document.querySelector('#signUpForm');

    const hideAllErrors = () => {
        document.querySelectorAll('.error-message').forEach(el => el.classList.add('hidden'));
    };

    // Ensure modal helper exists
    const ensureAlert = (title, msg, type) => {
        if(typeof showAlert === 'function') {
            showAlert({
                title: title,
                message: msg,
                iconHTML: type === 'error' ? '<i class="fas fa-times-circle text-red-500 text-4xl"></i>' : '<i class="fas fa-check-circle text-green-500 text-4xl"></i>',
                confirmText: 'Got it'
            });
        } else {
            alert(`${title}\n${msg}`);
        }
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        hideAllErrors();

        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const buttonText = submitButton.querySelector('.btn-text');
        const buttonSpinner = submitButton.querySelector('.btn-spinner');

        // Set Loading State
        submitButton.disabled = true;
        if(buttonText) buttonText.classList.add('hidden');
        if(buttonSpinner) buttonSpinner.classList.remove('hidden');

        const isSignIn = form.id === 'signInForm';
        let isValid = true;
        let payload = {};

        if (isSignIn) {
            const username = form.username;
            const password = form.password;

            if (!username.value.trim()) {
                document.querySelector('#usernameError').classList.remove('hidden');
                isValid = false;
            }
            if (!password.value.trim()) {
                document.querySelector('#passwordError').classList.remove('hidden');
                isValid = false;
            }

            if (isValid) {
                payload = {
                    username: username.value,
                    password: password.value,
                };
            }
        } else {
            const username = form.username;
            const email = form.email;
            const password = form.password;
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!username.value.trim()) {
                document.querySelector('#usernameError').classList.remove('hidden');
                isValid = false;
            }
            if (!emailPattern.test(email.value)) {
                document.querySelector('#emailError').classList.remove('hidden');
                isValid = false;
            }
            if (password.value.length < 8) {
                document.querySelector('#passwordError').classList.remove('hidden');
                isValid = false;
            }

            if (isValid) {
                payload = {
                    username: username.value,
                    email: email.value,
                    password: password.value,
                };
            }
        }

        if (!isValid) {
            submitButton.disabled = false;
            if(buttonText) buttonText.classList.remove('hidden');
            if(buttonSpinner) buttonSpinner.classList.add('hidden');
            return;
        }

        const endpoint = isSignIn ? 'http://127.0.0.1:5000/login' : 'http://127.0.0.1:5000/register';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.access_token) {
                    localStorage.setItem('accessToken', data.access_token);
                    localStorage.setItem('isLoggedIn', 'true');
                }

                ensureAlert('Success', `Successfully ${isSignIn ? 'logged in' : 'signed up'}! Redirecting...`, 'success');

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                ensureAlert('Error', data.message || 'An error occurred.', 'error');
                submitButton.disabled = false;
                if(buttonText) buttonText.classList.remove('hidden');
                if(buttonSpinner) buttonSpinner.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error:', error);
            ensureAlert('Network Error', 'Could not connect to the server.', 'error');
            submitButton.disabled = false;
            if(buttonText) buttonText.classList.remove('hidden');
            if(buttonSpinner) buttonSpinner.classList.add('hidden');
        }
    };

    if (signInForm) signInForm.addEventListener('submit', handleFormSubmit);
    if (signUpForm) signUpForm.addEventListener('submit', handleFormSubmit);
});