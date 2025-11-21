document.addEventListener('DOMContentLoaded', () => {

    const modalPlaceholder = document.getElementById('modal-placeholder');
    
    // Inject transition styles
    const styleSheet = document.createElement('style');
    document.head.appendChild(styleSheet);
    styleSheet.innerHTML = `
        [data-state="closed"] { opacity: 0; pointer-events: none; }
        [data-state="closed"] #modal-dialog { transform: translateY(20px) scale(0.95); }
        [data-state="open"] { opacity: 1; pointer-events: auto; }
        [data-state="open"] #modal-dialog { transform: translateY(0) scale(1); }
    `;

    const openModal = async (contentUrl) => {
        // Prevent opening multiple instances
        if (document.getElementById('universal-modal')) return;

        try {
            // 1. Fetch the Modal Shell
            const modalResponse = await fetch('components/modal.html');
            if (!modalResponse.ok) throw new Error('Could not load modal component.');
            const modalTemplate = await modalResponse.text();
            modalPlaceholder.innerHTML = modalTemplate;

            // 2. Select Elements
            const modal = document.getElementById('universal-modal');
            const modalContentContainer = document.getElementById('modal-content-container');
            const modalTitle = document.getElementById('modal-title');
            const closeModalButton = document.getElementById('close-modal-button');

            // 3. Fetch the Content (Privacy or Terms)
            const contentResponse = await fetch(contentUrl);
            if (!contentResponse.ok) throw new Error(`Could not load content from ${contentUrl}`);
            const contentHtml = await contentResponse.text();
            
            // 4. Parse Title and Content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = contentHtml;
            
            // Extract H3 from content to use as Modal Title
            const titleElement = tempDiv.querySelector('h3');
            if (titleElement) {
                modalTitle.innerText = titleElement.innerText;
                titleElement.remove(); // Remove title from body since it's now in header
            }
            
            modalContentContainer.innerHTML = tempDiv.innerHTML;
            
            // 5. Define Closing Logic
            const closeModal = () => {
                modal.setAttribute('data-state', 'closed');
                // Wait for animation to finish before removing from DOM
                setTimeout(() => {
                    modalPlaceholder.innerHTML = '';
                    document.removeEventListener('keydown', handleEscKey);
                }, 300);
            };
            
            const handleEscKey = (event) => {
                if (event.key === "Escape") closeModal();
            };

            // 6. Attach Listeners
            closeModalButton.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                // Close if clicking outside the dialog box
                if (e.target === modal) closeModal();
            });
            document.addEventListener('keydown', handleEscKey);

            // 7. Open Animation
            // Small delay to ensure DOM is ready for transition
            requestAnimationFrame(() => {
                modal.setAttribute('data-state', 'open');
            });

        } catch (error) {
            console.error("Error opening modal:", error);
            // Fallback: Just go to the link if fetch fails (e.g., local file system issues)
            window.location.href = contentUrl;
        }
    };

    // Global Click Listener for the Footer Links
    document.body.addEventListener('click', (event) => {
        const trigger = event.target.closest('#privacy-policy-link, #terms-of-service-link');
        if (trigger) {
            event.preventDefault();
            const contentUrl = trigger.getAttribute('href');
            openModal(contentUrl);
        }
    });
});