document.addEventListener('DOMContentLoaded', () => {

    const modalPlaceholder = document.getElementById('modal-placeholder');
    
    // Inject transition styles if not already present
    if (!document.getElementById('modal-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'modal-styles';
        document.head.appendChild(styleSheet);
        
        // CSS FOR MOBILE BOTTOM SHEET vs DESKTOP MODAL
        styleSheet.innerHTML = `
            /* Default State (Closed) */
            [data-state="closed"] { 
                opacity: 0; 
                pointer-events: none; 
            }
            
            /* Mobile: Slide down to close */
            [data-state="closed"] #modal-dialog { 
                transform: translateY(100%); 
            }

            /* Desktop: Fade out and scale down */
            @media (min-width: 768px) {
                [data-state="closed"] #modal-dialog { 
                    transform: translateY(20px) scale(0.95); 
                    opacity: 0;
                }
            }

            /* Open State */
            [data-state="open"] { 
                opacity: 1; 
                pointer-events: auto; 
            }
            [data-state="open"] #modal-dialog { 
                transform: translateY(0) scale(1); 
                opacity: 1; 
            }
            
            /* Custom Scrollbar */
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e5e7eb; border-radius: 20px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #a1a1aa; }
        `;
    }

    const openModal = async (contentUrl) => {
        // Prevent opening multiple instances
        if (document.getElementById('universal-modal')) return;

        try {
            // 1. Fetch Template
            const modalResponse = await fetch('/src/components/modal.html');
            if (!modalResponse.ok) throw new Error('Could not load modal component.');
            const modalTemplate = await modalResponse.text();
            modalPlaceholder.innerHTML = modalTemplate;

            // 2. Select Elements
            const modal = document.getElementById('universal-modal');
            const modalContentContainer = document.getElementById('modal-content-container');
            const modalTitle = document.getElementById('modal-title');
            const closeModalButton = document.getElementById('close-modal-button');

            // 3. Fetch Content
            const contentResponse = await fetch(contentUrl);
            if (!contentResponse.ok) throw new Error(`Could not load content from ${contentUrl}`);
            const contentHtml = await contentResponse.text();
            
            // 4. Parse Title
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = contentHtml;
            const titleElement = tempDiv.querySelector('h1, h2, h3');
            if (titleElement) {
                modalTitle.innerText = titleElement.innerText;
                titleElement.remove(); 
            }
            modalContentContainer.innerHTML = tempDiv.innerHTML;
            
            // 5. Close Logic
            const closeModal = () => {
                modal.setAttribute('data-state', 'closed');
                setTimeout(() => {
                    modalPlaceholder.innerHTML = '';
                    document.removeEventListener('keydown', handleEscKey);
                }, 300); // Wait for animation
            };
            
            const handleEscKey = (event) => {
                if (event.key === "Escape") closeModal();
            };

            // 6. Attach Listeners
            closeModalButton.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                // Close if clicking the backdrop (outside dialog)
                if (e.target === modal) closeModal();
            });
            document.addEventListener('keydown', handleEscKey);

            // 7. Open Animation
            // Double RAF ensures CSS transition triggers correctly
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    modal.setAttribute('data-state', 'open');
                });
            });

        } catch (error) {
            console.error("Error opening modal:", error);
            window.location.href = contentUrl;
        }
    };

    // Connect Footer Links
    const privacyLink = document.querySelector('a[href*="privacy-policy"]');
    const termsLink = document.querySelector('a[href*="terms-of-service"]');

    if (privacyLink) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('/src/components/privacy-policy.html');
        });
    }
    if (termsLink) {
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('/src/components/terms-of-service.html');
        });
    }
});