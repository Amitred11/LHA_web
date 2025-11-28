/**
 * src/js/main/loader.js
 * 
 * THEME: LHA Collective (Cyberpunk/Terminal)
 * BEHAVIOR: 
 *  - Synchronous injection.
 *  - Mobile/Desktop Responsive.
 *  - LOGIC: Only shows on first session load or logout. Skips on refresh.
 *  - UPDATE: Rectangular "Theater" Border (16:9 Aspect Ratio).
 */

const Loader = {
    STORAGE_KEY: 'lha_booted',

    template: `
    <div id="global-loader">
        <style>
            /* --- CORE LAYOUT --- */
            #global-loader {
                position: fixed;
                inset: 0;
                background-color: #050505;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                font-family: 'Courier New', Courier, monospace;
            }

            /* --- BACKGROUND FX --- */
            .loader-bg-grid {
                position: absolute;
                inset: 0;
                background-image: 
                    linear-gradient(rgba(139, 92, 246, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(139, 92, 246, 0.05) 1px, transparent 1px);
                background-size: 50px 50px;
                opacity: 0.4;
                pointer-events: none;
            }
            
            /* Vignette for Theater Feel */
            .loader-vignette {
                position: absolute;
                inset: 0;
                background: radial-gradient(circle, transparent 50%, #050505 130%);
                pointer-events: none;
                z-index: 1;
            }
            
            .loader-scanline {
                position: absolute;
                inset: 0;
                background: linear-gradient(to bottom, transparent, rgba(209, 242, 94, 0.03), transparent);
                animation: loader-scan 4s linear infinite;
                pointer-events: none;
                z-index: 2;
            }

            /* --- WIDESCREEN LOGO SECTION --- */
            .loader-logo-wrapper {
                position: relative;
                /* RECTANGULAR SIZING (16:9) */
                width: min(85vw, 800px); /* Massive width */
                aspect-ratio: 16 / 9;      /* Cinema Rectangle */
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 2.5rem;
                z-index: 10;
            }

            /* Rectangular Dashed Frame (Replaces circular ring) */
            .loader-frame-dashed {
                position: absolute;
                inset: -15px;
                border: 2px dashed #3f3f46;
                border-radius: 4px;
                opacity: 0.5;
                animation: loader-breath 4s ease-in-out infinite;
            }

            /* The Main "Cinema Screen" Box */
            .loader-logo-box {
                position: relative;
                width: 100%;
                height: 100%;
                background-color: #000;
                border: 4px solid #8b5cf6;
                /* Cyberpunk Cut Corners (Adjusted for Rectangle) */
                clip-path: polygon(
                    5% 0, 100% 0, 
                    100% 85%, 95% 100%, 
                    0 100%, 0 15%
                );
                display: flex;
                align-items: center;
                justify-content: center;
                /* Cinematic Glow */
                box-shadow: 0 0 50px rgba(139, 92, 246, 0.2), inset 0 0 30px rgba(139, 92, 246, 0.1);
                transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                z-index: 5;
            }

            /* Image Styling */
            .loader-logo-box img {
                width: 100%;
                height: 100%;
                object-fit: cover; /* Crops image to fill the rectangle */
                display: block;
                opacity: 0.85;
                filter: grayscale(100%) contrast(1.1);
                transition: filter 0.6s ease, opacity 0.6s ease;
            }

            /* Success State */
            .loader-logo-box.logo-success {
                border-color: #d1f25e;
                /* Intense Screen Glow */
                box-shadow: 0 0 80px rgba(209, 242, 94, 0.4), 0 0 30px rgba(209, 242, 94, 0.6); 
                transform: scale(1.02);
            }
            .loader-logo-box.logo-success img {
                filter: grayscale(0%) contrast(1);
                opacity: 1;
            }

            /* Ping Rect (Pulse) */
            .loader-ping-rect {
                position: absolute;
                inset: 0;
                border: 1px solid #8b5cf6;
                border-radius: 2px;
                opacity: 0;
                animation: loader-ping-rect 2.5s ease-out infinite;
                z-index: 2;
            }

            /* --- PROGRESS & TEXT --- */
            .loader-bar-container {
                /* Match width of logo wrapper */
                width: min(85vw, 800px);
                height: 4px;
                background-color: #27272a;
                position: relative;
                overflow: hidden;
                margin-bottom: 1.5rem;
                z-index: 10;
            }

            .loader-bar-fill {
                position: absolute;
                left: 0; top: 0;
                height: 100%; width: 0%;
                background-color: #d1f25e;
                box-shadow: 0 0 20px #d1f25e;
            }

            .loader-text {
                color: #52525b;
                font-size: 14px;
                letter-spacing: 0.4em;
                font-weight: 800;
                text-transform: uppercase;
                z-index: 10;
                transition: color 0.3s ease;
            }

            /* --- ANIMATIONS --- */
            @keyframes loader-scan {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(100%); }
            }
            @keyframes loader-breath {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.01); }
            }
            @keyframes loader-ping-rect {
                0% { transform: scale(0.95); opacity: 0.6; border-color: #8b5cf6; }
                100% { transform: scale(1.1); opacity: 0; border-color: #d1f25e; }
            }

            /* --- SHUTDOWN CRT EFFECT --- */
            body.crt-shutdown-active { overflow: hidden !important; height: 100vh !important; }
            @keyframes crt-off {
                0% { opacity: 1; transform: scale(1); filter: brightness(1); }
                40% { opacity: 1; transform: scale(1, 0.005); filter: brightness(5); }
                100% { opacity: 0; transform: scale(0, 0); filter: brightness(0); }
            }
            .crt-effect-on {
                animation: crt-off 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
                pointer-events: none;
            }
        </style>

        <div class="loader-bg-grid"></div>
        <div class="loader-vignette"></div>
        <div class="loader-scanline"></div>

        <div class="loader-logo-wrapper">
            <div class="loader-frame-dashed"></div>
            <div class="loader-ping-rect"></div>
            
            <div id="loader-logo-box" class="loader-logo-box">
                <img src="/src/assets/logodaw.jpg" onerror="this.style.display='none';this.parentNode.innerText='LHA'">
            </div>
        </div>

        <div class="loader-bar-container">
            <div id="loader-bar-fill" class="loader-bar-fill"></div>
        </div>

        <div id="loader-text" class="loader-text">
            SYSTEM_BOOT...
        </div>
    </div>
    `,

    /**
     * INJECT: Puts HTML into page immediately.
     */
    inject: function() {
        if (document.body) {
            document.body.insertAdjacentHTML('afterbegin', this.template);
        } else {
            window.addEventListener('DOMContentLoaded', () => {
                if (!document.getElementById('global-loader')) {
                    document.body.insertAdjacentHTML('afterbegin', this.template);
                    this.boot();
                }
            });
        }
    },

    /**
     * BOOT: Runs the load bar animation.
     */
    boot: function() {
        const container = document.getElementById('global-loader');
        const logoBox = document.getElementById('loader-logo-box');
        const bar = document.getElementById('loader-bar-fill');
        const text = document.getElementById('loader-text');

        if (!container || !bar) return;

        // 1. Start Bar Animation
        setTimeout(() => {
            bar.style.transition = "width 1.5s cubic-bezier(0.22, 1, 0.36, 1)";
            bar.style.width = "100%";
        }, 100);

        // 2. Success State (Highlight Logo)
        setTimeout(() => {
            if(text) {
                text.innerText = "ACCESS_GRANTED";
                text.style.color = "#d1f25e"; 
                text.style.textShadow = "0 0 15px #d1f25e";
            }
            if(logoBox) {
                logoBox.classList.add('logo-success');
            }
        }, 1100);

        // 3. Finish & Cleanup
        setTimeout(() => {
            container.style.transition = "opacity 0.7s ease";
            container.style.opacity = "0";
            container.style.pointerEvents = "none";
            
            sessionStorage.setItem(this.STORAGE_KEY, 'true');

            setTimeout(() => {
                container.style.display = 'none';
            }, 700);
        }, 2000);
    },

    /**
     * SHUTDOWN: Reactivates loader for logout.
     */
    shutdown: function(callback) {
        sessionStorage.removeItem(this.STORAGE_KEY);

        let container = document.getElementById('global-loader');
        if (!container) {
            this.inject();
            container = document.getElementById('global-loader');
        }

        if (!container) {
            if (callback) callback();
            return;
        }

        const bar = document.getElementById('loader-bar-fill');
        const text = document.getElementById('loader-text');
        const logoBox = document.getElementById('loader-logo-box');

        // Reset visibility
        container.style.display = 'flex';
        void container.offsetWidth; // Force reflow
        container.style.opacity = '1';
        container.style.pointerEvents = 'auto';

        if (logoBox) logoBox.classList.remove('logo-success');

        if (text) {
            text.innerText = "TERMINATING...";
            text.style.color = "#ff2a6d"; 
            text.style.textShadow = "none";
        }
        if (bar) {
            bar.style.transition = 'none';
            bar.style.width = '0%';
        }

        // Fast Fill
        setTimeout(() => {
            if (bar) {
                bar.style.transition = "width 0.8s linear";
                bar.style.width = "100%";
            }
        }, 50);

        // CRT Squeeze
        setTimeout(() => {
            document.body.classList.add('crt-effect-on');
        }, 900);

        // Callback
        setTimeout(() => {
            if (callback) callback();
        }, 1600);
    }
};

// --- LOGIC: Only run inject/boot if this is the start of a session ---
if (!sessionStorage.getItem(Loader.STORAGE_KEY)) {
    Loader.inject();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            Loader.boot();
        });
    } else {
        Loader.boot();
    }
}