document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const API_BASE_URL = 'https://backendkostudy.onrender.com';
    
    // Elements Cache
    const elements = {
        // Containers
        mainContent: document.getElementById('main-event-content'),
        regContainer: document.getElementById('registration-container'),

        // UI Components
        navbar: document.getElementById('navbar'),
        mobileMenuBtn: document.getElementById('mobile-menu-button'),
        closeMenuBtn: document.getElementById('close-menu-button'),
        mobileMenu: document.getElementById('mobile-menu'),
        mobileLinks: document.querySelectorAll('.mobile-link'),
        themeToggles: document.querySelectorAll('#theme-toggle, #theme-toggle-mobile'),
        copyBtn: document.getElementById('copy-id-btn'),
        
        // Event Data Fields
        heroTitleMain: document.getElementById('hero-title-main'),
        heroTitleSub: document.getElementById('hero-title-sub'),
        heroDesc: document.getElementById('hero-desc'),
        heroCta: document.getElementById('hero-cta'),
        statusBadge: document.getElementById('event-status-badge'),
        statusText: document.getElementById('status-text'),
        ticketDate: document.getElementById('ticket-date-display'),
        
        // Form
        form: document.getElementById('registration-form'),
    };

    // --- 1. DATA FETCHING & STATE MANAGEMENT ---
    const initEventData = async () => {
        try {
            // Fetch latest event
            const response = await fetch(`${API_BASE_URL}/api/events/latest`);
            
            if (response.ok) {
                const event = await response.json();
                renderActiveEvent(event);
            } else {
                throw new Error("No active event found");
            }
        } catch (error) {
            console.warn("System Idle:", error);
            renderSystemIdle();
        }
    };

    const renderActiveEvent = (event) => {
        // 1. Ensure Content is Visible
        if (elements.mainContent) elements.mainContent.classList.remove('hidden');

        const eventDate = new Date(event.date);
        const now = new Date();
        const isPast = eventDate < now;

        // 2. Update Hero Text
        const titleWords = event.title ? event.title.split(' ') : ['EVENT', 'NAME'];
        if (elements.heroTitleMain) elements.heroTitleMain.innerText = titleWords.slice(0, -1).join(' ');
        if (elements.heroTitleSub) {
            const subText = titleWords[titleWords.length - 1];
            elements.heroTitleSub.innerText = subText;
            elements.heroTitleSub.setAttribute('data-text', subText);
        }
        if (elements.heroDesc) elements.heroDesc.innerText = event.description;

        // 3. Update Ticket & ID
        if (elements.ticketDate) elements.ticketDate.innerText = eventDate.getDate();
        if (elements.copyBtn) {
            const span = elements.copyBtn.querySelector('span');
            if(span) span.innerText = `ID: ${event._id.substring(0, 8).toUpperCase()}`;
        }

        // 4. Inject Active Registration Form
        if (!isPast && elements.form) {
            // Inject the actual form fields for a live event
            elements.form.innerHTML = `
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="text-xs font-mono uppercase font-bold tracking-wider text-gray-500">Operative Name</label>
                        <input type="text" name="name" required class="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 p-3 rounded-lg focus:outline-none focus:border-primary font-mono text-sm transition-colors" placeholder="ENTER NAME">
                    </div>
                    <div class="space-y-2">
                        <label class="text-xs font-mono uppercase font-bold tracking-wider text-gray-500">Contact Frequency</label>
                        <input type="email" name="email" required class="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 p-3 rounded-lg focus:outline-none focus:border-primary font-mono text-sm transition-colors" placeholder="ENTER EMAIL">
                    </div>
                </div>
                <div class="space-y-2">
                    <label class="text-xs font-mono uppercase font-bold tracking-wider text-gray-500">Affiliation</label>
                    <select name="type" class="w-full bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 p-3 rounded-lg focus:outline-none focus:border-primary font-mono text-sm transition-colors">
                        <option value="student">Student</option>
                        <option value="professional">Professional</option>
                        <option value="guest">Guest</option>
                    </select>
                </div>
                <button type="submit" id="submit-btn" class="w-full bg-ink dark:bg-white text-white dark:text-ink py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all shadow-lg hover:shadow-neon mt-4">
                    Confirm Registration
                </button>
            `;
        }

        // 5. Handle Status (Active vs Past)
        if (isPast) {
            // Update Badge
            if(elements.statusBadge) {
                elements.statusBadge.className = "inline-flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-widest mb-6";
                elements.statusBadge.innerHTML = `<i class="fas fa-check-circle"></i> COMPLETED`;
            }
            updateCountdownUI(0);
            
            // Show "Closed" message instead of form
            if (elements.regContainer) {
                elements.regContainer.innerHTML = `
                    <div class="text-center py-12 opacity-75">
                        <i class="fas fa-lock text-5xl text-gray-300 dark:text-zinc-600 mb-4"></i>
                        <h3 class="font-display font-bold text-2xl uppercase">Protocol Closed</h3>
                        <p class="font-mono text-sm text-gray-500 mt-2">Mission completed on ${eventDate.toLocaleDateString()}</p>
                    </div>
                `;
            }
        } else {
            // Active Badge
            if(elements.statusBadge) {
                elements.statusBadge.className = "inline-flex items-center gap-2 bg-neon-lime/10 border border-neon-lime text-neon-lime px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-widest mb-6";
                elements.statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-neon-lime animate-ping"></span> LIVE EVENT`;
            }
            initCountdown(event.date);
        }
    };

    const renderSystemIdle = () => {
        // --- THIS IS THE KEY CHANGE ---
        // Instead of hiding the content, we populate it with "Empty/Offline" visuals
        
        // 1. Keep Main Content Visible
        if (elements.mainContent) elements.mainContent.classList.remove('hidden');

        // 2. Set Hero Text to "Offline"
        if (elements.heroTitleMain) elements.heroTitleMain.innerText = "SYSTEM";
        if (elements.heroTitleSub) {
            elements.heroTitleSub.innerText = "OFFLINE";
            elements.heroTitleSub.setAttribute('data-text', "OFFLINE");
            // Remove gradient, make it gray to look offline
            elements.heroTitleSub.classList.remove('from-primary', 'via-pop-pink', 'to-cyber-cyan');
            elements.heroTitleSub.classList.add('text-gray-300', 'dark:text-zinc-700');
        }
        if (elements.heroDesc) {
            elements.heroDesc.innerText = "No active event protocols detected. Systems are standing by for future transmission.";
        }
        
        // 3. Badge: System Idle
        if (elements.statusBadge) {
            elements.statusBadge.className = "inline-flex items-center gap-2 bg-red-500/10 border border-red-500 text-red-500 px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-widest mb-6";
            elements.statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> DISCONNECTED`;
        }

        // 4. Ticket: Null Data
        if (elements.ticketDate) elements.ticketDate.innerText = "--";
        if (elements.copyBtn) {
            const span = elements.copyBtn.querySelector('span');
            if (span) span.innerText = "ID: NULL_REF";
        }

        // 5. Countdown: Zero
        updateCountdownUI(0);

        // 6. Registration: Show the structure, but visually disabled
        if (elements.form) {
            elements.form.innerHTML = `
                <div class="relative opacity-50 select-none grayscale pointer-events-none">
                    <div class="absolute inset-0 z-20 flex items-center justify-center">
                        <div class="bg-paper dark:bg-black border border-ink dark:border-zinc-700 px-4 py-2 font-mono font-bold uppercase text-xs tracking-widest shadow-lg transform -rotate-12">
                            No Active Events
                        </div>
                    </div>
                    <div class="grid md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-xs font-mono uppercase font-bold tracking-wider text-gray-500">Operative Name</label>
                            <input type="text" disabled class="w-full bg-gray-100 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 p-3 rounded-lg" placeholder="SYSTEM LOCKED">
                        </div>
                        <div class="space-y-2">
                            <label class="text-xs font-mono uppercase font-bold tracking-wider text-gray-500">Contact Frequency</label>
                            <input type="email" disabled class="w-full bg-gray-100 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 p-3 rounded-lg" placeholder="SYSTEM LOCKED">
                        </div>
                    </div>
                    <div class="space-y-2 mt-6">
                        <label class="text-xs font-mono uppercase font-bold tracking-wider text-gray-500">Affiliation</label>
                        <div class="w-full bg-gray-100 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 p-3 rounded-lg h-12"></div>
                    </div>
                    <div class="w-full bg-gray-300 dark:bg-zinc-800 text-gray-500 py-4 rounded-xl font-bold uppercase tracking-widest mt-6 text-center">
                        Awaiting Server Response
                    </div>
                </div>
            `;
        }
    };

    // --- 2. COUNTDOWN LOGIC ---
    const updateCountdownUI = (distance) => {
        const els = { d: document.getElementById("d"), h: document.getElementById("h"), m: document.getElementById("m"), s: document.getElementById("s") };
        if (!els.d) return;

        if (distance <= 0) {
            els.d.innerHTML = "00"; els.h.innerHTML = "00"; els.m.innerHTML = "00"; els.s.innerHTML = "00";
        } else {
            els.d.innerHTML = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
            els.h.innerHTML = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
            els.m.innerHTML = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            els.s.innerHTML = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
        }
    }

    const initCountdown = (targetDateString) => {
        const countDownDate = new Date(targetDateString).getTime();
        
        // Clear any existing intervals if function is called multiple times
        if (window.eventTimer) clearInterval(window.eventTimer);

        window.eventTimer = setInterval(() => {
            const now = new Date().getTime();
            const distance = countDownDate - now;

            if (distance < 0) {
                clearInterval(window.eventTimer);
                updateCountdownUI(0);
                return;
            }
            updateCountdownUI(distance);
        }, 1000);
    };

    // --- 3. THEME LOGIC ---
    const initTheme = () => {
        const setDark = (isDark) => {
            if (isDark) {
                document.documentElement.classList.add('dark');
                localStorage.theme = 'dark';
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.theme = 'light';
            }
        };
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setDark(true);
        }
        elements.themeToggles.forEach(btn => {
            btn.addEventListener('click', () => setDark(!document.documentElement.classList.contains('dark')));
        });
    };

    // --- 4. UI INTERACTIONS ---
    const toggleMenu = (show) => {
        if (!elements.mobileMenu) return;
        if (show) {
            elements.mobileMenu.classList.remove('hidden');
            setTimeout(() => elements.mobileMenu.classList.add('flex', 'opacity-100', 'scale-100'), 10);
            document.body.style.overflow = 'hidden';
        } else {
            elements.mobileMenu.classList.remove('flex', 'opacity-100', 'scale-100');
            elements.mobileMenu.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    };
    if (elements.mobileMenuBtn) elements.mobileMenuBtn.addEventListener('click', () => toggleMenu(true));
    if (elements.closeMenuBtn) elements.closeMenuBtn.addEventListener('click', () => toggleMenu(false));
    elements.mobileLinks.forEach(link => link.addEventListener('click', () => toggleMenu(false)));

    // Ticket Tilt Effect
    const initTicketTilt = () => {
        const container = document.getElementById('ticket-container');
        if (!container) return;
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            container.style.transform = `perspective(1000px) rotateX(${y * -0.05}deg) rotateY(${x * 0.05}deg) scale(1.02)`;
        });
        container.addEventListener('mouseleave', () => {
            container.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    };

    // Copy ID Feature
    const initCopyFeature = () => {
        if(!elements.copyBtn) return;
        elements.copyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const text = elements.copyBtn.innerText.replace('ID: ', '');
            if(text.includes('LOADING') || text.includes('NULL')) return;
            
            navigator.clipboard.writeText(text).then(() => {
                const originalHtml = elements.copyBtn.innerHTML;
                elements.copyBtn.innerHTML = '<span class="text-neon-lime">COPIED!</span> <i class="fas fa-check text-neon-lime"></i>';
                setTimeout(() => elements.copyBtn.innerHTML = originalHtml, 2000);
            });
        });
    };

    // --- 5. FORM SUBMISSION ---
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submit-btn');
        if (!submitBtn) return;

        const originalText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="relative z-10"><i class="fas fa-circle-notch fa-spin"></i> TRANSMITTING...</span>';

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${API_BASE_URL}/api/events/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();

            if (response.ok) {
                alert('Registration Successful!'); // You can replace this with your modal logic
                e.target.reset();
            } else {
                throw new Error(result.message || 'Handshake rejected.');
            }
        } catch (error) {
            alert(error.message); // You can replace this with your modal logic
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span class="relative z-10">${originalText}</span>`;
        }
    };

    // --- INITIALIZATION ---
    const init = () => {
        initTheme();
        initEventData(); 
        initTicketTilt();
        initCopyFeature();
        
        // Global listener for dynamic form
        document.body.addEventListener('submit', (e) => {
            if(e.target.id === 'registration-form') handleFormSubmit(e);
        });
    };

    init();
});