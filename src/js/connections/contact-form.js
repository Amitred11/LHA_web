document.addEventListener('DOMContentLoaded', () => {
    // Select by action attribute as defined in index.html
    const contactForm = document.querySelector('form[action="contact-form"]'); 

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // UI Feedback
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-satellite-dish fa-spin"></i> Transmitting...';

            // Data Preparation
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('http://127.0.0.1:5000/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    // Success
                    if(typeof showAlert === 'function') {
                        showAlert('Message Received', 'Your transmission has been logged.', 'success');
                    } else {
                        alert('Message Sent!');
                    }
                    contactForm.reset();
                } else {
                    throw new Error(result.message || 'Server rejected the message.');
                }
            } catch (error) {
                console.error(error);
                if(typeof showAlert === 'function') {
                    showAlert('Connection Failed', 'Could not reach the server.', 'error');
                } else {
                    alert('Error sending message.');
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
});