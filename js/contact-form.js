document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('form[action="contact-form"]'); // Updated selector to match index.html
    const submitButton = contactForm ? contactForm.querySelector('button[type="submit"]') : null;

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            if (typeof showAlert !== 'function') {
                alert('Error: Alert system not loaded.');
                return;
            }

            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin ml-2"></i>';
            submitButton.disabled = true;
            submitButton.classList.add('opacity-75', 'cursor-not-allowed');

            // Collect form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('http://127.0.0.1:5000/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (response.ok) {
                    showAlert('Message Sent!', result.message || 'We will get back to you soon.', 'success');
                    contactForm.reset(); 
                } else {
                    throw new Error(result.message || 'Failed to send message.');
                }
            } catch (error) {
                showAlert('Error', error.message || 'Could not connect to server.', 'error');
            } finally {
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
                submitButton.classList.remove('opacity-75', 'cursor-not-allowed');
            }
        });
    }
});