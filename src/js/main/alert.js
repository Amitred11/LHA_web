/**
 * js/alert.js
 * FIXED: Attaches event listeners dynamically when the modal opens.
 */

let onConfirmCallback = null;

/**
 * Open the centralized confirmation modal.
 */
function openAlertModal({ title, message, icon, iconHTML, confirmText = "Confirm", cancelText = "Cancel", onConfirm }) {
    const modal = document.getElementById("alert-modal");
    
    // 1. Check if modal exists (It should, because main.js loaded it)
    if (!modal) {
        console.error("Alert Modal HTML not found in DOM.");
        return;
    }

    const titleEl = document.getElementById("alert-title");
    const messageEl = document.getElementById("alert-message");
    const iconContainer = document.getElementById("alert-icon-container");
    
    // --- CRITICAL FIX START ---
    // We grab the buttons here, because they definitely exist now.
    const oldConfirmBtn = document.getElementById("alert-confirm-button");
    const oldCancelBtn = document.getElementById("alert-cancel-button");

    // We clone the buttons to strip any previous event listeners (prevent duplicate clicks)
    // and replace the old buttons with the fresh clones.
    const confirmBtn = oldConfirmBtn.cloneNode(true);
    const cancelBtn = oldCancelBtn.cloneNode(true);
    
    oldConfirmBtn.parentNode.replaceChild(confirmBtn, oldConfirmBtn);
    oldCancelBtn.parentNode.replaceChild(cancelBtn, oldCancelBtn);

    // Now we attach the NEW listeners
    confirmBtn.addEventListener('click', () => {
        if (typeof onConfirm === 'function') onConfirm();
        closeAlertModal();
    });

    cancelBtn.addEventListener('click', closeAlertModal);
    // --- CRITICAL FIX END ---

    // 2. Set Content
    if (titleEl) titleEl.textContent = title || "Alert";
    if (messageEl) messageEl.textContent = message || "";
    
    // 3. Set Button Text
    confirmBtn.textContent = confirmText;
    cancelBtn.textContent = cancelText;

    // 4. Set Icon
    if (iconContainer) {
        if (iconHTML) {
            iconContainer.innerHTML = iconHTML;
        } else {
            iconContainer.innerHTML = `<i class="fas ${icon || 'fa-exclamation'} text-3xl text-ink dark:text-white"></i>`;
        }
    }

    // 5. Show Modal
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

/* --- TOAST NOTIFICATION LOGIC (Keep as is) --- */
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
        success: { bg: 'bg-neon-lime', text: 'text-ink', border: 'border-ink', icon: 'fa-check-circle', iconColor: 'text-ink' },
        error: { bg: 'bg-pop-pink', text: 'text-white', border: 'border-ink', icon: 'fa-times-circle', iconColor: 'text-white' },
        warning: { bg: 'bg-yellow-400', text: 'text-ink', border: 'border-ink', icon: 'fa-exclamation-triangle', iconColor: 'text-ink' },
        info: { bg: 'bg-white', text: 'text-ink', border: 'border-ink', icon: 'fa-info-circle', iconColor: 'text-primary' }
    };

    const config = alertColors[type] || alertColors.info;
    const alertElement = document.createElement('div');
    alertElement.id = alertId;
    alertElement.className = `fixed top-24 right-5 w-full max-w-sm p-4 rounded shadow-[5px_5px_0px_0px_#09090b] dark:shadow-[5px_5px_0px_0px_#fafafa] ${config.bg} ${config.text} border-2 ${config.border} dark:border-paper transform translate-x-[150%] transition-all duration-500 ease-in-out z-[9999] font-mono`;
    
    alertElement.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0 pt-0.5"><i class="fas ${config.icon} ${config.iconColor} text-2xl"></i></div>
            <div class="ml-4 flex-1"><h4 class="font-bold font-display text-lg uppercase leading-tight">${title}</h4><p class="text-xs mt-1 font-bold opacity-90">${message}</p></div>
            <button onclick="document.getElementById('${alertId}').remove()" class="ml-auto -mx-1.5 -my-1.5 text-inherit hover:opacity-70 p-1.5"><i class="fas fa-times"></i></button>
        </div>
    `;

    placeholder.appendChild(alertElement);
    requestAnimationFrame(() => alertElement.classList.remove('translate-x-[150%]'));
    setTimeout(() => {
        if (document.body.contains(alertElement)) {
            alertElement.classList.add('translate-x-[150%]');
            setTimeout(() => alertElement.remove(), 500);
        }
    }, 5000);
}