/**
 * js/alert.js
 * Handles both interactive Modal Alerts (confirmations) and Toast Notifications.
 */

/* --- MODAL LOGIC --- */

function openAlertModal() {
    const modal = document.getElementById("alert-modal");
    const dialog = document.getElementById("alert-dialog");

    if (!modal || !dialog) return;

    modal.classList.remove("hidden");

    // Small delay to allow display:flex to apply before animating opacity
    setTimeout(() => {
        modal.classList.remove("opacity-0");
        dialog.classList.remove("opacity-0", "scale-95");
    }, 10);
}

function closeAlertModal() {
    const modal = document.getElementById("alert-modal");
    const dialog = document.getElementById("alert-dialog");

    if (!modal || !dialog) return;

    modal.classList.add("opacity-0");
    dialog.classList.add("opacity-0", "scale-95");

    setTimeout(() => {
        modal.classList.add("hidden");
    }, 300);
}

/* --- TOAST LOGIC --- */

/**
 * Displays a custom toast-style alert notification.
 * @param {string} title The bold title of the alert.
 * @param {string} message The body message.
 * @param {string} type 'success', 'error', 'warning', 'info'.
 */
function showAlert(title, message, type = 'info') {
    // Handle object argument if passed as single parameter (backward compatibility)
    if (typeof title === 'object') {
        const params = title;
        type = params.type || 'info';
        message = params.message || '';
        title = params.title || 'Alert';
    }

    const placeholder = document.getElementById('alert-modal-placeholder');
    if (!placeholder) {
        // Create placeholder if it doesn't exist
        const div = document.createElement('div');
        div.id = 'alert-modal-placeholder';
        document.body.appendChild(div);
    }

    const alertId = `alert-${Date.now()}`;
    
    // Neo-Brutalist Styles
    const alertColors = {
        success: {
            bg: 'bg-acid-green',
            text: 'text-ink',
            border: 'border-ink',
            icon: 'fa-check-circle',
            iconColor: 'text-ink'
        },
        error: {
            bg: 'bg-hot-pink',
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
            iconColor: 'text-sky-blue'
        }
    };

    const config = alertColors[type] || alertColors.info;
    // Dark mode fallback handled by border-ink/cream logic in CSS or generic classes
    const darkModeBorder = 'dark:border-cream';

    const alertElement = document.createElement('div');
    alertElement.id = alertId;
    
    // Applied Tailwind classes: Fixed position, z-index high, hard shadow, border-3
    alertElement.className = `fixed top-24 right-5 w-full max-w-sm p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#FFF] ${config.bg} ${config.text} border-3 ${config.border} ${darkModeBorder} transform translate-x-[150%] transition-all duration-500 ease-in-out z-[9999]`;
    
    alertElement.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0 pt-0.5">
                <i class="fas ${config.icon} ${config.iconColor} text-2xl"></i>
            </div>
            <div class="ml-4 flex-1">
                <h4 class="font-header font-bold text-lg uppercase leading-tight">${title}</h4>
                <p class="font-body text-sm mt-1 opacity-90">${message}</p>
            </div>
            <button onclick="document.getElementById('${alertId}').remove()" class="ml-auto -mx-1.5 -my-1.5 text-inherit hover:opacity-70 p-1.5">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    document.getElementById('alert-modal-placeholder').appendChild(alertElement);

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