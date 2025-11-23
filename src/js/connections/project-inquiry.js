document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('project-inquiry-form');
    
    // Only run if form exists (start-project.html)
    if (!form) return;

    const submitBtn = document.getElementById('submit-btn');
    
    // Assuming the multi-step logic (next/prev) handles visual state...
    // We attach the API submission to the form's submit event.

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. UI Loading
        if(submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-cog fa-spin"></i> Initializing...';
            submitBtn.style.pointerEvents = 'none';
        }

        // 2. Gather Data (Handle Checkboxes properly)
        const formData = new FormData(form);
        const data = {};
        const projectTypes = [];

        for (const [key, value] of formData.entries()) {
            if (key === 'projectTypes') {
                projectTypes.push(value);
            } else {
                data[key] = value;
            }
        }
        // Add array back to object
        if (projectTypes.length > 0) data.projectTypes = projectTypes;

        // 3. Send to Backend
        try {
            const response = await fetch('http://127.0.0.1:5000/api/project-inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // Redirect to Success Page
                window.location.href = 'quest-accepted.html';
            } else {
                throw new Error(result.message || 'Submission failed.');
            }

        } catch (error) {
            console.error(error);
            if(typeof showAlert === 'function') {
                showAlert('System Error', 'Failed to submit inquiry. Please try again.', 'error');
            } else {
                alert('Error: ' + error.message);
            }
            
            // Reset Button
            if(submitBtn) {
                submitBtn.innerHTML = 'Submit Request';
                submitBtn.style.pointerEvents = 'auto';
            }
        }
    });
});