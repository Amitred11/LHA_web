// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    const signInPanel = document.getElementById('sign-in-panel');
    const signUpPanel = document.getElementById('sign-up-panel');
    
    const showSignUpButton = document.getElementById('show-signup-button');
    const showSignInButton = document.getElementById('show-signin-button');

    // --- NEW: Select the form submission buttons ---
    const signInButton = signInPanel.querySelector('button[type="submit"]');
    const signUpButton = signUpPanel.querySelector('button[type="submit"]');

    if (signInPanel && signUpPanel && showSignUpButton && showSignInButton) {
        
        showSignUpButton.addEventListener('click', () => {
            signInPanel.classList.add('is-exiting');
            setTimeout(() => {
                signInPanel.classList.add('hidden');
                signUpPanel.classList.remove('hidden');
                void signUpPanel.offsetWidth; 
                signUpPanel.classList.remove('is-exiting');
            }, 400); 
        });

        showSignInButton.addEventListener('click', () => {
            signUpPanel.classList.add('is-exiting');
            setTimeout(() => {
                signUpPanel.classList.add('hidden');
                signInPanel.classList.remove('hidden');
                void signInPanel.offsetWidth;
                signInPanel.classList.remove('is-exiting');
            }, 400); 
        });

        signUpPanel.classList.add('is-exiting');

        // --- NEW: Login Simulation Logic ---
        const handleLogin = (event) => {
            // Prevent the form from actually submitting
            event.preventDefault(); 
            
            // Set a flag in localStorage to indicate the user is logged in
            localStorage.setItem('isLoggedIn', 'true');
            
            // Redirect the user to the homepage
            window.location.href = 'index.html';
        };

        // Attach the login handler to both buttons
        if (signInButton) signInButton.addEventListener('click', handleLogin);
        if (signUpButton) signUpButton.addEventListener('click', handleLogin);

    } else {
        console.error("Authentication panel elements not found. Check your HTML IDs.");
    }
});