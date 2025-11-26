document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const API_BASE_URL = 'https://backendkostudy.onrender.com';
    
    // Elements Cache
    const elements = {
        // Containers
        mainContent: document.getElementById('main-event-content'),
        emptyState: document.getElementById('empty-state-message'),
        regContainer: document.getElementById('registration-container'),

        // UI Components
        navbar: document.getElementById('navbar'),
        mobileMenuBtn: document.getElementById('mobile-menu-button'),
        closeMenuBtn: document.getElementById('close-menu-button'),
        mobileMenu: document.getElementById('mobile-menu'),
        mobileLinks: document.querySelectorAll('.mobile-link'),
        desktopLinks: document.querySelectorAll('.nav-link'),
        themeToggles: document.querySelectorAll('#theme-toggle, #theme-toggle-mobile'),
        fab: document.getElementById('mobile-fab'),
        copyBtn: document.getElementById('copy-id-btn'),
        
        // Event Data Fields
        heroTitleMain: document.getElementById('hero-title-main'),
        heroTitleSub: document.getElementById('hero-title-sub'),
        heroDesc: document.getElementById('hero-desc'),
        heroCta: document.getElementById('hero-cta'),
        statusBadge: document.getElementById('event-status-badge'),
        statusText: document.getElementById('status-text'),
        ticketDate: document.getElementById('ticket-date-display'),
        
        // Registration
        form: document.getElementById('registration-form'), // Might be null if replaced
    };

    // --- 1. DATA FETCHING & STATE MANAGEMENT ---
    const initEventData = async () => {
        try {
            // Fetch latest event
            const response = await fetch(`${API_BASE_URL}/api/events/latest`);
            
            if (response.ok) {
                const event = await response.json();
                
                // Show Main Content, Hide Empty State
                if (elements.mainContent) elements.mainContent.classList.remove('hidden');
                if (elements.emptyState) elements.emptyState.classList.add('hidden');
                
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
        const eventDate = new Date(event.date);
        const now = new Date();
        const isPast = eventDate < now;

        // 1. Update Hero Text (Splitting title for style if possible)
        const titleWords = event.title ? event.title.split(' ') : ['EVENT', 'NAME'];
        if (elements.heroTitleMain) elements.heroTitleMain.innerText = titleWords.slice(0, -1).join(' ');
        if (elements.heroTitleSub) {
            elements.heroTitleSub.innerText = titleWords[titleWords.length - 1];
            elements.heroTitleSub.setAttribute('data-text', titleWords[titleWords.length - 1]);
        }
        if (elements.heroDesc) elements.heroDesc.innerText = event.description;

        // 2. Update Date on Ticket
        if (elements.ticketDate) {
            elements.ticketDate.innerText = eventDate.getDate();
        }

        // 3. Update ID in Navbar
        if (elements.copyBtn) {
            const span = elements.copyBtn.querySelector('span');
            if(span) span.innerText = `ID: ${event._id.substring(0, 8).toUpperCase()}`;
        }

        // 4. Handle STATUS (Past vs Future)
        if (isPast) {
            // --- SCENARIO: PREVIOUS EVENT (Visible but Closed) ---
            
            // Update Status Badge
            if(elements.statusBadge) {
                elements.statusBadge.classList.replace('text-neon-lime', 'text-gray-400');
                elements.statusBadge.classList.replace('border-neon-lime', 'border-gray-500');
                elements.statusBadge.innerHTML = `<i class="fas fa-check-circle mr-2"></i> MISSION COMPLETE`;
            }

            // Zero out countdown
            updateCountdownUI(0);

            // Hide Hero CTA
            if(elements.heroCta) elements.heroCta.style.display = 'none';

            // Replace Registration Form with "Event Ended" Message
            if (elements.regContainer) {
                elements.regContainer.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-lock text-6xl text-gray-300 dark:text-zinc-700 mb-6"></i>
                        <h2 class="font-display font-black text-3xl md:text-4xl uppercase mb-4 text-ink dark:text-white">Protocol Closed</h2>
                        <p class="font-mono text-gray-500 mb-8 max-w-md mx-auto">
                            This mission has been successfully completed. 
                            <br>Await further instructions for the next operation.
                        </p>
                        <div class="inline-block bg-gray-100 dark:bg-zinc-800 px-4 py-2 rounded text-xs font-mono text-gray-500">
                            ARCHIVE_ID: ${event._id.substring(0,6)}
                        </div>
                    </div>
                `;
            }
            // Hide FAB
            if (elements.fab) elements.fab.style.display = 'none';

        } else {
            // --- SCENARIO: ACTIVE EVENT ---
            
            // Start Countdown
            initCountdown(event.date);

            // Ensure Registration Form Exists (In case logic needs to restore it, usually reload handles this)
            if (!document.getElementById('registration-form') && elements.regContainer) {
                 // If we needed to restore form dynamically we would do it here, 
                 // but since we start fresh on load, existing HTML is fine.
            }
        }
    };

    const renderSystemIdle = () => {
        // --- SCENARIO: NO DATA AT ALL ---
        // Hide Main Content
        if (elements.mainContent) elements.mainContent.classList.add('hidden');
        
        // Show Empty State Section
        if (elements.emptyState) elements.emptyState.classList.remove('hidden');
        
        // Hide FAB
        if (elements.fab) elements.fab.style.display = 'none';
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
        
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = countDownDate - now;

            if (distance < 0) {
                clearInterval(timer);
                updateCountdownUI(0);
                // Optional: Reload page or switch state when timer hits 0 in real-time
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

    // --- 4. MENU & UI INTERACTIONS ---
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

    // Ticket Tilt
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

    // Copy ID
    const initCopyFeature = () => {
        if(!elements.copyBtn) return;
        elements.copyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const text = elements.copyBtn.innerText.replace('ID: ', '');
            navigator.clipboard.writeText(text).then(() => {
                const originalHtml = elements.copyBtn.innerHTML;
                elements.copyBtn.innerHTML = '<span class="text-primary">COPIED!</span> <i class="fas fa-check text-primary"></i>';
                setTimeout(() => elements.copyBtn.innerHTML = originalHtml, 2000);
            });
        });
    };

    // --- 5. FORM SUBMISSION ---
    // (Only attaches listener if form exists, i.e., event is active)
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
                alert('Registration Successful!');
                window.location.reload();
            } else {
                throw new Error(result.message || 'Handshake rejected.');
            }
        } catch (error) {
            alert(error.message);
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
        
        // Attach form listener dynamically since form might be removed for past events
        document.body.addEventListener('submit', (e) => {
            if(e.target.id === 'registration-form') handleFormSubmit(e);
        });
    };

    init();
});