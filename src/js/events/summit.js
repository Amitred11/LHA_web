document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIG ---
    const API_BASE_URL = 'https://backendkostudy.onrender.com'; // Update with your Flask port
    
    // --- 1. Theme Logic ---
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
    document.getElementById('theme-toggle').addEventListener('click', function() {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        }
    });

    // --- 2. Mobile Menu Logic ---
    const btn = document.getElementById('mobile-menu-button');
    const closeBtn = document.getElementById('close-menu-button');
    const menu = document.getElementById('mobile-menu');
    const body = document.body;

    function toggleMenu() {
        const isHidden = menu.classList.contains('hidden');
        if(isHidden) {
            menu.classList.remove('hidden');
            setTimeout(() => menu.classList.add('flex'), 10);
            body.classList.add('overflow-hidden');
        } else {
            menu.classList.remove('flex');
            setTimeout(() => menu.classList.add('hidden'), 300);
            body.classList.remove('overflow-hidden');
        }
    }

    if(btn) btn.addEventListener('click', toggleMenu);
    if(closeBtn) closeBtn.addEventListener('click', toggleMenu);
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('flex');
            setTimeout(() => menu.classList.add('hidden'), 300);
            body.classList.remove('overflow-hidden');
        });
    });

    // --- 3. Countdown Timer ---
    const countDownDate = new Date("Nov 29, 2025 09:00:00").getTime();
    const x = setInterval(function() {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const d = document.getElementById("d");
        const h = document.getElementById("h");
        const m = document.getElementById("m");
        const s = document.getElementById("s");

        if(d) d.innerHTML = days < 10 ? '0'+days : days;
        if(h) h.innerHTML = hours < 10 ? '0'+hours : hours;
        if(m) m.innerHTML = minutes < 10 ? '0'+minutes : minutes;
        if(s) s.innerHTML = seconds < 10 ? '0'+seconds : seconds;

        if (distance < 0) {
            clearInterval(x);
            if(d) document.getElementById("d").innerHTML = "00";
        }
    }, 1000);

    // --- 4. Alert Helper (Loading Reuse) ---
    // Note: We rely on alert.js being loaded before this file in HTML
    let alertModalElements = {};
    const cacheModalElements = () => {
        alertModalElements = {
            modal: document.getElementById('alert-modal'),
            title: document.getElementById('alert-title'),
            message: document.getElementById('alert-message'),
            iconContainer: document.getElementById('alert-icon-container'),
            confirmButton: document.getElementById('alert-confirm-button'),
            cancelButton: document.getElementById('alert-cancel-button'),
        };
    };

    const loadAlertModal = async () => {
        if (document.getElementById('alert-modal')) {
            cacheModalElements();
            return;
        }
        try {
            const response = await fetch('/src/components/alert.html');
            if (response.ok) {
                const html = await response.text();
                document.getElementById('alert-modal-placeholder').innerHTML = html;
                cacheModalElements();
            }
        } catch (error) { console.error(error); }
    };

    // --- 5. Registration Form Logic ---
    const form = document.getElementById('registration-form');
    const submitBtn = document.getElementById('submit-btn');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Load modal requirements
            await loadAlertModal();
            cacheModalElements();

            // Set Loading State
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing...';

            // Gather Data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${API_BASE_URL}/api/events/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    if (typeof openAlertModal === 'function') {
                        openAlertModal({
                            title: 'ACCESS GRANTED',
                            message: result.message,
                            iconHTML: '<i class="fas fa-ticket-alt text-4xl text-neon-lime mb-2 animate-bounce"></i>',
                            confirmText: 'Awesome',
                            cancelText: 'Close',
                            onConfirm: () => { window.location.reload(); }
                        });
                    } else {
                        alert(result.message);
                        window.location.reload();
                    }
                    form.reset();
                } else {
                    throw new Error(result.message || 'Registration failed.');
                }

            } catch (error) {
                if (typeof openAlertModal === 'function') {
                    openAlertModal({
                        title: 'ERROR',
                        message: error.message,
                        iconHTML: '<i class="fas fa-exclamation-triangle text-4xl text-pop-pink mb-2"></i>',
                        confirmText: 'Retry',
                        cancelText: 'Close'
                    });
                } else {
                    alert('Error: ' + error.message);
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
});