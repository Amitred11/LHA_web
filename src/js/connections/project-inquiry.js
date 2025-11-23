document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('project-inquiry-form');
    if (!form) return;

    // --- UI REFERENCES ---
    const steps = Array.from(document.querySelectorAll('.form-step'));
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-btn');
    const progressBar = document.getElementById('progress-bar');
    const stepIndicator = document.getElementById('step-indicator');

    let currentStepIndex = 0;

    // --- MULTI-STEP NAVIGATION LOGIC ---
    function updateUI() {
        // Show/Hide Steps
        steps.forEach((step, index) => {
            if (index === currentStepIndex) {
                step.classList.remove('hidden');
            } else {
                step.classList.add('hidden');
            }
        });

        // Progress Bar
        const progress = ((currentStepIndex + 1) / steps.length) * 100;
        progressBar.style.width = `${progress}%`;
        stepIndicator.textContent = `STEP ${currentStepIndex + 1} OF ${steps.length}`;

        // Button Visibility
        if (currentStepIndex === 0) {
            prevBtn.classList.add('hidden');
        } else {
            prevBtn.classList.remove('hidden');
        }

        if (currentStepIndex === steps.length - 1) {
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        }
    }

    function validateCurrentStep() {
        const currentStepEl = steps[currentStepIndex];
        const inputs = currentStepEl.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('border-red-500');
                // Remove red border on input
                input.addEventListener('input', () => input.classList.remove('border-red-500'), { once: true });
            }
        });

        return isValid;
    }

    // Button Listeners
    nextBtn.addEventListener('click', () => {
        if (validateCurrentStep()) {
            currentStepIndex++;
            updateUI();
            window.scrollTo({ top: 100, behavior: 'smooth' });
        } else {
            // Simple shake animation or alert could go here
            alert("Please fill in all required fields.");
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStepIndex > 0) {
            currentStepIndex--;
            updateUI();
        }
    });

    // --- API SUBMISSION LOGIC ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateCurrentStep()) {
            alert("Please complete the form.");
            return;
        }

        // 1. UI Loading State
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-70', 'cursor-not-allowed');

        // 2. Gather Data
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
                // Success: Redirect to quest-accepted.html
                window.location.href = '/src/screens/projects/quest-accepted.html';
            } else {
                throw new Error(result.message || 'Server rejected the request.');
            }

        } catch (error) {
            console.error('Submission Error:', error);
            
            // Reset Button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');

            // Use your custom alert system if available, otherwise standard alert
            if(typeof showAlert === 'function') {
                showAlert('Mission Failed', 'Could not connect to the server. Check your connection.', 'error');
            } else {
                alert('Error: Could not submit project. Is the server running?');
            }
        }
    });

    // Initialize UI
    updateUI();
});