// js/auth.js (NEW, RELIABLE VERSION)

document.addEventListener('DOMContentLoaded', () => {
    // Get the main panels
    const signInPanel = document.getElementById('sign-in-panel');
    const signUpPanel = document.getElementById('sign-up-panel');
    
    // Get the buttons that trigger the switch
    const showSignUpButton = document.getElementById('show-signup-button');
    const showSignInButton = document.getElementById('show-signin-button');

    // Ensure all elements exist before adding listeners
    if (signInPanel && signUpPanel && showSignUpButton && showSignInButton) {
        
        // Listen for clicks on the "Sign Up" button (in the Sign In panel)
        showSignUpButton.addEventListener('click', () => {
            // 1. Add the exiting class to the currently visible panel
            signInPanel.classList.add('is-exiting');

            // 2. Wait for the exit animation (400ms) to finish
            setTimeout(() => {
                // 3. Hide the old panel and show the new one
                signInPanel.classList.add('hidden');
                signUpPanel.classList.remove('hidden');
                
                // 4. Force the browser to repaint before starting the new animation
                // This is a trick to make sure the fade-in animation plays correctly
                void signUpPanel.offsetWidth; 

                // 5. Remove the exiting class from the new panel to make it fade in
                signUpPanel.classList.remove('is-exiting');
            }, 400); // This duration MUST match the CSS transition duration
        });

        // Listen for clicks on the "Sign In" button (in the Sign Up panel)
        showSignInButton.addEventListener('click', () => {
            // 1. Add the exiting class to the currently visible panel
            signUpPanel.classList.add('is-exiting');

            // 2. Wait for the exit animation to finish
            setTimeout(() => {
                // 3. Hide the old panel and show the new one
                signUpPanel.classList.add('hidden');
                signInPanel.classList.remove('hidden');

                // 4. Force repaint
                void signInPanel.offsetWidth;

                // 5. Remove the exiting class from the new panel to make it fade in
                signInPanel.classList.remove('is-exiting');
            }, 400); // This duration MUST match the CSS transition duration
        });

        // Initialize the panels correctly on page load
        signUpPanel.classList.add('is-exiting');

    } else {
        console.error("Authentication panel elements not found. Check your HTML IDs.");
    }
});