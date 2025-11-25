/**
 * js/alert.js
 * FIXED: Attaches event listeners dynamically.
 * MOBILE: Toasts are now full-width top banners on mobile.
 */

let onConfirmCallback = null;

function openAlertModal({ title, message, icon, iconHTML, confirmText = "Confirm", cancelText = "Cancel", onConfirm }) {
    const modal = document.getElementById("alert-modal");
    if (!modal) return;

    const titleEl = document.getElementById("alert-title");
    const messageEl = document.getElementById("alert-message");
    const iconContainer = document.getElementById("alert-icon-container");
    
    // Clone buttons to remove old listeners
    const oldConfirmBtn = document.getElementById("alert-confirm-button");
    const oldCancelBtn = document.getElementById("alert-cancel-button");

    const confirmBtn = oldConfirmBtn.cloneNode(true);
    const cancelBtn = oldCancelBtn.cloneNode(true);
    
    oldConfirmBtn.parentNode.replaceChild(confirmBtn, oldConfirmBtn);
    oldCancelBtn.parentNode.replaceChild(cancelBtn, oldCancelBtn);

    confirmBtn.addEventListener('click', () => {
        if (typeof onConfirm === 'function') onConfirm();
        closeAlertModal();
    });

    cancelBtn.addEventListener('click', closeAlertModal);

    // Set Content
    if (titleEl) titleEl.textContent = title || "Alert";
    if (messageEl) messageEl.textContent = message || "";
    confirmBtn.textContent = confirmText;
    cancelBtn.textContent = cancelText;

    // Set Icon
    if (iconContainer) {
        if (iconHTML) {
            iconContainer.innerHTML = iconHTML;
        } else {
            let colorClass = "text-ink dark:text-white";
            if(icon === 'fa-exclamation-triangle') colorClass = "text-yellow-500";
            if(icon === 'fa-trash' || icon === 'fa-times') colorClass = "text-pop-pink";
            if(icon === 'fa-check') colorClass = "text-neon-lime";

            iconContainer.innerHTML = `<i class="fas ${icon || 'fa-bell'} text-2xl ${colorClass}"></i>`;
        }
    }

    // Show Modal
    modal.classList.remove("hidden");
    setTimeout(() => {
        modal.classList.remove("opacity-0");
        const dialog = modal.querySelector('#alert-dialog');
        if(dialog) dialog.classList.remove("opacity-0", "scale-95");
    }, 10);
}

function closeAlertModal() {
    const modal = document.getElementById("alert-modal");
    if (!modal) return;

    const dialog = modal.querySelector('#alert-dialog');
    if(dialog) dialog.classList.add("opacity-0", "scale-95");
    modal.classList.add("opacity-0");

    setTimeout(() => {
        modal.classList.add("hidden");
        onConfirmCallback = null; 
    }, 300);
}

/* --- TOAST NOTIFICATION LOGIC --- */
function showAlert(title, message, type = 'info') {
    if (typeof title === 'object') {
        const params = title;
        type = params.type || 'info';
        message = params.message || '';
        title = params.title || 'Alert';
    }

    const placeholder = document.getElementById('alert-modal-placeholder');
    if (!placeholder) return;

    const alertId = `alert-${Date.now()}`;
    
    const alertColors = {
        success: { 
            bg: 'bg-white dark:bg-zinc-900', 
            text: 'text-ink dark:text-white', 
            border: 'border-l-4 border-l-neon-lime', 
            icon: 'fa-check-circle', 
            iconColor: 'text-neon-lime' 
        },
        error: { 
            bg: 'bg-white dark:bg-zinc-900', 
            text: 'text-ink dark:text-white', 
            border: 'border-l-4 border-l-pop-pink', 
            icon: 'fa-times-circle', 
            iconColor: 'text-pop-pink' 
        },
        warning: { 
            bg: 'bg-white dark:bg-zinc-900', 
            text: 'text-ink dark:text-white', 
            border: 'border-l-4 border-l-yellow-400', 
            icon: 'fa-exclamation-triangle', 
            iconColor: 'text-yellow-400' 
        },
        info: { 
            bg: 'bg-white dark:bg-zinc-900', 
            text: 'text-ink dark:text-white', 
            border: 'border-l-4 border-l-primary', 
            icon: 'fa-info-circle', 
            iconColor: 'text-primary' 
        }
    };

    const config = alertColors[type] || alertColors.info;
    
    const alertElement = document.createElement('div');
    alertElement.id = alertId;
    
    // --- MOBILE RESPONSIVE CLASSES ---
    // Mobile: fixed top-4 left-4 right-4 (Full width banner)
    // Desktop: md:left-auto md:right-5 md:w-full md:max-w-sm (Corner toast)
    alertElement.className = `fixed top-4 left-4 right-4 md:left-auto md:right-5 md:w-full md:max-w-sm p-4 rounded-lg md:rounded-r shadow-mobile-glow md:shadow-manga dark:shadow-lg ${config.bg} ${config.text} ${config.border} transform -translate-y-[150%] md:translate-y-0 md:translate-x-[150%] transition-all duration-500 ease-in-out z-[9999] border-y border-r border-gray-200 dark:border-zinc-700`;
    
    alertElement.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0 pt-0.5"><i class="fas ${config.icon} ${config.iconColor} text-xl"></i></div>
            <div class="ml-4 flex-1">
                <h4 class="font-bold font-display text-sm uppercase tracking-wide">${title}</h4>
                <p class="text-xs mt-1 font-mono text-gray-500 dark:text-gray-400">${message}</p>
            </div>
            <button onclick="document.getElementById('${alertId}').remove()" class="ml-auto -mx-1.5 -my-1.5 text-gray-400 hover:text-ink dark:hover:text-white p-1.5 transition-colors">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    placeholder.appendChild(alertElement);
    
    // Animation Frame to trigger transition
    requestAnimationFrame(() => {
        alertElement.classList.remove('-translate-y-[150%]', 'md:translate-x-[150%]');
    });
    
    // Auto remove
    setTimeout(() => {
        if (document.body.contains(alertElement)) {
            // Slide up on mobile, slide right on desktop
            alertElement.classList.add('-translate-y-[150%]', 'md:translate-x-[150%]');
            setTimeout(() => alertElement.remove(), 500);
        }
    }, 5000);
}