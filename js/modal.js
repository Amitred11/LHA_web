// js/modal.js
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('universal-modal');
    const modalContentContainer = document.getElementById('modal-content-container');
    const closeModalButton = document.getElementById('close-modal-button');

    // Function to open the modal and load content
    const openModal = async (contentUrl, contentId) => {
        try {
            const response = await fetch(contentUrl);
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const content = doc.getElementById(contentId).innerHTML;
            
            modalContentContainer.innerHTML = content;
            modal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden'); // Prevent background scrolling
        } catch (error) {
            console.error('Error loading modal content:', error);
            modalContentContainer.innerHTML = '<p class="text-red-400">Sorry, we could not load the content.</p>';
            modal.classList.remove('hidden');
        }
    };

    // Function to close the modal
    const closeModal = () => {
        modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    };

    // Event listeners for modal triggers
    document.getElementById('privacy-policy-link').addEventListener('click', (e) => {
        e.preventDefault();
        openModal('components/privacy-policy.html', 'privacy-policy-content');
    });

    document.getElementById('terms-of-service-link').addEventListener('click', (e) => {
        e.preventDefault();
        openModal('components/terms-of-service.html', 'terms-of-service-content');
    });

    // Close modal when the close button is clicked
    closeModalButton.addEventListener('click', closeModal);

    // Close modal when clicking outside the content area
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal with the Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
});