/**
 * js/alert.js
 * Handles both interactive Modal Alerts (confirmations) and Toast Notifications.
 */

/* --- MODAL CONFIRMATION LOGIC --- */

// Global variable to hold the callback
let onConfirmCallback = null;

/**
 * Open the centralized confirmation modal.
 * @param {Object} options
 * @param {string} options.title - The modal title.
 * @param {string} options.message - The body text.
 * @param {string} options.icon - FontAwesome icon class (e.g., 'fa-trash').
 * @param {Function} options.onConfirm - Function to run if user clicks confirm.
 */
function openAlertModal({ title, message, icon, onConfirm }) {
    const modal = document.getElementById("alert-modal");
    const titleEl = document.getElementById("alert-title");
    const messageEl = document.getElementById("alert-message");
    const iconContainer = document.getElementById("alert-icon-container");

    if (!modal) return;

    // Set Content
    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;
    
    // Set Icon
    if (iconContainer) {
        iconContainer.innerHTML = `<i class="fas ${icon || 'fa-exclamation'} text-3xl text-ink dark:text-white"></i>`;
    }

    // Store Callback
    onConfirmCallback = onConfirm;

    // Show Modal
    modal.classList.remove("hidden");
    setTimeout(() => {
        modal.classList.remove("opacity-0");
        modal.querySelector('#alert-dialog').classList.remove("opacity-0", "scale-95");
    }, 10);
}

function closeAlertModal() {
    const modal = document.getElementById("alert-modal");
    if (!modal) return;

    modal.querySelector('#alert-dialog').classList.add("opacity-0", "scale-95");
    modal.classList.add("opacity-0");

    setTimeout(() => {
        modal.classList.add("hidden");
        onConfirmCallback = null; // Reset callback
    }, 300);
}

// Attach Event Listeners for the Static Alert Modal HTML
document.addEventListener('DOMContentLoaded', () => {
    const confirmBtn = document.getElementById('alert-confirm-button');
    const cancelBtn = document.getElementById('alert-cancel-button');

    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            if (onConfirmCallback) onConfirmCallback();
            closeAlertModal();
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeAlertModal);
    }
});


/* --- TOAST NOTIFICATION LOGIC --- */

/**
 * Displays a custom toast-style alert notification.
 * @param {string} title The bold title of the alert.
 * @param {string} message The body message.
 * @param {string} type 'success', 'error', 'warning', 'info'.
 */
function showAlert(title, message, type = 'info') {
    // Handle object argument if passed as single parameter
    if (typeof title === 'object') {
        const params = title;
        type = params.type || 'info';
        message = params.message || '';
        title = params.title || 'Alert';
    }

    const placeholder = document.getElementById('alert-modal-placeholder');
    if (!placeholder) {
        console.error("Alert Placeholder missing in HTML");
        return;
    }

    const alertId = `alert-${Date.now()}`;
    
    // Manga/Tech Theme Colors
    const alertColors = {
        success: {
            bg: 'bg-neon-lime',
            text: 'text-ink',
            border: 'border-ink',
            icon: 'fa-check-circle',
            iconColor: 'text-ink'
        },
        error: {
            bg: 'bg-pop-pink',
            text: 'text-white',
            border: 'border-ink',
            icon: 'fa-times-circle',
            iconColor: 'text-white'
        },
        warning: {
            bg: 'bg-yellow-400',
            text: 'text-ink',
            border: 'border-ink',
            icon: 'fa-exclamation-triangle',
            iconColor: 'text-ink'
        },
        info: {
            bg: 'bg-white',
            text: 'text-ink',
            border: 'border-ink',
            icon: 'fa-info-circle',
            iconColor: 'text-primary'
        }
    };

    const config = alertColors[type] || alertColors.info;
    const darkModeBorder = 'dark:border-paper';

    const alertElement = document.createElement('div');
    alertElement.id = alertId;
    
    // Tailwind Classes: Fixed Top-Right, Z-Index High, Manga Shadow
    alertElement.className = `fixed top-24 right-5 w-full max-w-sm p-4 rounded shadow-[5px_5px_0px_0px_#09090b] dark:shadow-[5px_5px_0px_0px_#fafafa] ${config.bg} ${config.text} border-2 ${config.border} ${darkModeBorder} transform translate-x-[150%] transition-all duration-500 ease-in-out z-[9999] font-mono`;
    
    alertElement.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0 pt-0.5">
                <i class="fas ${config.icon} ${config.iconColor} text-2xl"></i>
            </div>
            <div class="ml-4 flex-1">
                <h4 class="font-bold font-display text-lg uppercase leading-tight">${title}</h4>
                <p class="text-xs mt-1 font-bold opacity-90">${message}</p>
            </div>
            <button onclick="document.getElementById('${alertId}').remove()" class="ml-auto -mx-1.5 -my-1.5 text-inherit hover:opacity-70 p-1.5">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    placeholder.appendChild(alertElement);

    // Animate In
    requestAnimationFrame(() => {
        alertElement.classList.remove('translate-x-[150%]');
    });

    // Auto Dismiss
    setTimeout(() => {
        if (document.body.contains(alertElement)) {
            alertElement.classList.add('translate-x-[150%]');
            setTimeout(() => alertElement.remove(), 500);
        }
    }, 5000);
}