// src/js/register.js
document.addEventListener('DOMContentLoaded', () => {
    const SERVER_URL = 'https://portfolio-server-8zei.onrender.com';

    // Get references to all necessary DOM elements
    const registerForm = document.getElementById('register-form');
    const statusMessage = document.getElementById('register-status');
    const submitButton = document.getElementById('submit-button');
    const successSound = document.getElementById('success-sound');
    const errorSound = document.getElementById('error-sound');

    // Handle form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // --- DESIGN: Provide immediate feedback to the user ---
        submitButton.disabled = true;
        submitButton.textContent = 'TRANSMITTING...';
        submitButton.setAttribute('data-text', 'TRANSMITTING...');
        statusMessage.textContent = 'Establishing secure link to provisioning server...';
        statusMessage.className = 'status-message success'; // Use success color for "in-progress"

        const email = document.getElementById('register-email').value;
        const displayName = document.getElementById('register-display-name').value;
        const password = document.getElementById('register-password').value;

        try {
            // Send registration data to the server
            const res = await fetch(`${SERVER_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, displayName, password })
            });

            const data = await res.json();

            if (!res.ok) {
                // If server responds with an error, throw it to the catch block
                throw new Error(data.message || 'Registration failed due to an unknown error.');
            }

            // --- DESIGN: Success feedback ---
            statusMessage.textContent = 'Provisioning successful. Dossier created. Redirecting to login...';
            statusMessage.className = 'status-message success';
            successSound.play();

            // Redirect to login after a short delay so the user can see the message
            setTimeout(() => {
                window.location.href = 'friends.html';
            }, 3000);

        } catch (err) {
            // --- DESIGN: Error feedback ---
            statusMessage.textContent = `// ERROR: ${err.message}`;
            statusMessage.className = 'status-message error';
            errorSound.play();

            // Re-enable the button so the user can try again
            submitButton.disabled = false;
            submitButton.textContent = 'PROVISION_AGENT';
            submitButton.setAttribute('data-text', 'PROVISION_AGENT');
        }
    });
});
