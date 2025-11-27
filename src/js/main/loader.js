/**
 * src/js/main/loader.js
 * 
 * THEME: LHA Collective (Cyberpunk/Terminal)
 * BEHAVIOR: 
 *  - Synchronous injection.
 *  - Mobile/Desktop Responsive.
 *  - LOGIC: Only shows on first session load or logout. Skips on refresh.
 */

const Loader = {
    // Storage key to track if we have already shown the boot animation
    STORAGE_KEY: 'lha_booted',

    template: `
    <div id="global-loader">
        <style>
            /* --- CRITICAL LOADER CSS --- */
            #global-loader {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background-color: #050505;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                font-family: 'Courier New', Courier, monospace;
            }

            /* Background Decor */
            .loader-bg-grid {
                position: absolute;
                inset: 0;
                background-image: linear-gradient(rgba(20, 20, 20, 0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(20, 20, 20, 0.5) 1px, transparent 1px);
                background-size: 30px 30px;
                opacity: 0.5;
                pointer-events: none;
            }
            
            .loader-scanline {
                position: absolute;
                inset: 0;
                background: linear-gradient(to bottom, transparent, rgba(0, 255, 0, 0.02), transparent);
                animation: loader-scan 4s linear infinite;
                pointer-events: none;
                z-index: 0;
            }

            /* Logo Container */
            .loader-logo-wrapper {
                position: relative;
                margin-bottom: 2rem;
                z-index: 10;
            }

            .loader-logo-box {
                width: 70px;
                height: 70px;
                background-color: #8b5cf6;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2.5rem;
                font-weight: 900;
                border-radius: 4px;
                box-shadow: 4px 4px 0px #ffffff;
                animation: loader-glitch 2s infinite alternate-reverse;
            }

            .loader-ping-ring {
                position: absolute;
                inset: -5px;
                border: 2px solid #d1f25e;
                border-radius: 6px;
                opacity: 0;
                animation: loader-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            }

            /* Progress Bar */
            .loader-bar-container {
                width: 80vw;
                max-width: 350px;
                height: 4px;
                background-color: #27272a;
                border-radius: 2px;
                position: relative;
                overflow: hidden;
                margin-bottom: 1rem;
                z-index: 10;
            }

            .loader-bar-fill {
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                width: 0%;
                background-color: #d1f25e;
                box-shadow: 0 0 10px #d1f25e;
                transition: width 0.1s linear;
            }

            /* Text */
            .loader-text {
                color: #d1f25e;
                font-size: 12px;
                letter-spacing: 0.2em;
                font-weight: bold;
                text-transform: uppercase;
                animation: loader-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                z-index: 10;
            }

            /* --- ANIMATIONS --- */
            @keyframes loader-scan {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(100%); }
            }
            @keyframes loader-glitch {
                0% { transform: translate(0); clip-path: inset(0 0 0 0); }
                20% { transform: translate(-2px, 2px); clip-path: inset(10% 0 80% 0); }
                40% { transform: translate(-2px, -2px); clip-path: inset(80% 0 10% 0); }
                60% { transform: translate(2px, 2px); clip-path: inset(40% 0 40% 0); }
                80% { transform: translate(2px, -2px); clip-path: inset(20% 0 60% 0); }
                100% { transform: translate(0); clip-path: inset(0 0 0 0); }
            }
            @keyframes loader-ping {
                75%, 100% { transform: scale(1.5); opacity: 0; }
                0% { transform: scale(1); opacity: 0.5; }
            }
            @keyframes loader-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            /* --- SHUTDOWN EFFECT --- */
            body.crt-shutdown-active {
                overflow: hidden !important;
                height: 100vh !important;
            }
            
            @keyframes crt-off-anim {
                0% { opacity: 1; transform: scale(1); filter: brightness(1); }
                40% { opacity: 1; transform: scale(1, 0.005); filter: brightness(3); }
                100% { opacity: 0; transform: scale(0, 0); filter: brightness(0); }
            }
            .crt-effect-on {
                animation: crt-off-anim 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
                pointer-events: none;
            }
        </style>

        <div class="loader-bg-grid"></div>
        <div class="loader-scanline"></div>

        <div class="loader-logo-wrapper">
            <div class="loader-logo-box">L</div>
            <div class="loader-ping-ring"></div>
        </div>

        <div class="loader-bar-container">
            <div id="loader-bar-fill" class="loader-bar-fill"></div>
        </div>

        <div id="loader-text" class="loader-text">
            INITIALIZING_SYSTEM...
        </div>
    </div>
    `,

    /**
     * INJECT: Puts HTML into page immediately.
     */
    inject: function() {
        if (document && document.body) {
            document.body.insertAdjacentHTML('afterbegin', this.template);
        } else if (document) {
            document.write(this.template);
        }
    },

    /**
     * BOOT: Runs the load bar animation.
     */
    boot: function() {
        const container = document.getElementById('global-loader');
        const bar = document.getElementById('loader-bar-fill');
        const text = document.getElementById('loader-text');

        if (!container || !bar) return;

        // 1. Start Animation
        setTimeout(() => {
            bar.style.transition = "width 1.8s cubic-bezier(0.22, 1, 0.36, 1)";
            bar.style.width = "100%";
        }, 50);

        // 2. Change Text
        setTimeout(() => {
            if(text) text.innerText = "ACCESS_GRANTED";
            if(text) text.style.color = "#8b5cf6";
        }, 1200);

        // 3. Finish & Cleanup
        setTimeout(() => {
            container.style.transition = "opacity 0.5s ease";
            container.style.opacity = "0";
            container.style.pointerEvents = "none";
            
            // Mark session as booted so it doesn't run on refresh
            sessionStorage.setItem(this.STORAGE_KEY, 'true');

            setTimeout(() => {
                container.style.display = 'none';
            }, 500);
        }, 2000);
    },

    /**
     * SHUTDOWN: Reactivates loader for logout.
     */
    shutdown: function(callback) {
        // Reset the session flag so loader appears on next login/visit
        sessionStorage.removeItem(this.STORAGE_KEY);

        // If user refreshed previously, the loader might not be in DOM. Inject it now.
        let container = document.getElementById('global-loader');
        if (!container) {
            this.inject();
            container = document.getElementById('global-loader');
        }

        const bar = document.getElementById('loader-bar-fill');
        const text = document.getElementById('loader-text');

        // Reset visibility
        container.style.display = 'flex';
        void container.offsetWidth; // Force reflow
        container.style.opacity = '1';
        container.style.pointerEvents = 'auto';

        if (text) {
            text.innerText = "TERMINATING_SESSION...";
            text.style.color = "#ff2a6d"; 
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

        // Callback (Redirect)
        setTimeout(() => {
            if (callback) callback();
        }, 1600);
    }
};

// --- LOGIC: Only run inject/boot if this is the start of a session ---
if (!sessionStorage.getItem(Loader.STORAGE_KEY)) {
    // 1. Inject immediately
    Loader.inject();

    // 2. Animate when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        Loader.boot();
    });
}