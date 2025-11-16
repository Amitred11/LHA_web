// js/alert.js

/**
 * Opens the alert modal with a smooth fade-in and scale-up animation.
 */
function openAlertModal() {
    const modal = document.getElementById("alert-modal");
    const dialog = document.getElementById("alert-dialog");

    if (!modal || !dialog) return;

    modal.classList.remove("hidden");

    // This brief delay allows the browser to apply the 'display: flex' from
    // removing 'hidden' before starting the transition.
    setTimeout(() => {
        modal.classList.remove("opacity-0");
        dialog.classList.remove("opacity-0", "scale-95");
    }, 10);
}

/**
 * Closes the alert modal with a fade-out and scale-down animation.
 */
function closeAlertModal() {
    const modal = document.getElementById("alert-modal");
    const dialog = document.getElementById("alert-dialog");

    if (!modal || !dialog) return;

    modal.classList.add("opacity-0");
    dialog.classList.add("opacity-0", "scale-95");

    // Wait for the animation to finish before hiding the modal completely.
    setTimeout(() => {
        modal.classList.add("hidden");
    }, 300); // This duration should match the transition duration in the CSS.
}