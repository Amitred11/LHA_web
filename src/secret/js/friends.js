// friends.js (Corrected)
document.addEventListener('DOMContentLoaded', () => {
    const SERVER_URL = 'https://portfolio-server-8zei.onrender.com';
    
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    if (localStorage.getItem('friends-token')) {
        window.location.href = 'hub.html';
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.textContent = 'Authenticating...';
        
        try {
            const res = await fetch(`${SERVER_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: document.getElementById('login-email').value,
                    password: document.getElementById('login-password').value
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Login failed.');
            localStorage.setItem('friends-token', data.token);
            localStorage.setItem('friends-displayName', data.displayName);
            localStorage.setItem('friends-role', data.role); // <-- This line was missing
            localStorage.setItem('friends-achievements', JSON.stringify(data.achievements)); 
            window.location.href = 'hub.html';
        } catch (err) {
            // Corrected the path to be consistent with hub.html
            const errorSound = new Audio('../assets/sounds/error.mp3');
            errorSound.play();
            loginError.textContent = `// ${err.message}`;
        }
    });
});
