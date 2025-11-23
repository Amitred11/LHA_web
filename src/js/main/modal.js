document.addEventListener('DOMContentLoaded', () => {

    const modalPlaceholder = document.getElementById('modal-placeholder');
    
    // Inject transition styles if not already present
    if (!document.getElementById('modal-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'modal-styles';
        document.head.appendChild(styleSheet);
        styleSheet.innerHTML = `
            [data-state="closed"] { opacity: 0; pointer-events: none; }
            [data-state="closed"] #modal-dialog { transform: translateY(20px) scale(0.95); }
            [data-state="open"] { opacity: 1; pointer-events: auto; }
            [data-state="open"] #modal-dialog { transform: translateY(0) scale(1); }
        `;
    }

    const openModal = async (contentUrl) => {
        // Prevent opening multiple instances
        if (document.getElementById('universal-modal')) return;

        try {
            // 1. Fetch the Modal Shell Template
            const modalResponse = await fetch('../../../src/components/modal.html');
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
            
            // Attempt to extract an H1, H2, or H3 for the Modal Title
            const titleElement = tempDiv.querySelector('h1, h2, h3');
            if (titleElement) {
                modalTitle.innerText = titleElement.innerText;
                titleElement.remove(); // Remove it from the body
            }
            
            modalContentContainer.innerHTML = tempDiv.innerHTML;
            
            // 5. Define Closing Logic
            const closeModal = () => {
                modal.setAttribute('data-state', 'closed');
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
                if (e.target === modal) closeModal();
            });
            document.addEventListener('keydown', handleEscKey);

            // 7. Open Animation
            requestAnimationFrame(() => {
                modal.setAttribute('data-state', 'open');
            });

        } catch (error) {
            console.error("Error opening modal:", error);
            // Fallback
            window.location.href = contentUrl;
        }
    };

    // Connect Footer Links to Modal
    const privacyLink = document.querySelector('a[href*="privacy-policy"]');
    const termsLink = document.querySelector('a[href*="terms-of-service"]');

    if (privacyLink) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('../../../src/components/privacy-policy.html');
        });
    }
    if (termsLink) {
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('../../../src/components/terms-of-service.html');
        });
    }
});