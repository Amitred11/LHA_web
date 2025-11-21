document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('project-inquiry-form');
    const steps = Array.from(form.querySelectorAll('.form-step'));
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-btn');
    const progressBar = document.getElementById('progress-bar');
    
    let currentStep = 0;
    const totalSteps = steps.length;
    const progressWidths = [25, 50, 75, 100];

    // Ensure alert modal is loaded
    const ensureAlert = (title, msg, type) => {
        if(typeof showAlert === 'function') {
            showAlert({
                title: title,
                message: msg,
                iconHTML: type === 'error' ? '<i class="fas fa-times-circle text-red-500 text-4xl"></i>' : '<i class="fas fa-check-circle text-green-500 text-4xl"></i>',
                confirmText: 'Got it'
            });
        } else {
            alert(`${title}\n${msg}`);
        }
    };

    const updateFormState = () => {
        // Hide all steps
        steps.forEach(step => step.classList.add('hidden'));
        // Show current step
        steps[currentStep].classList.remove('hidden');

        // Update progress bar
        progressBar.style.width = `${progressWidths[currentStep]}%`;

        // Update button visibility
        if (currentStep === 0) {
            prevBtn.classList.add('hidden');
        } else {
            prevBtn.classList.remove('hidden');
        }

        if (currentStep === totalSteps - 1) {
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        }
    };

    const validateStep = () => {
        const currentStepInputs = steps[currentStep].querySelectorAll('input, textarea, select');
        let isValid = true;

        for (const input of currentStepInputs) {
            if (input.hasAttribute('required') && !input.value.trim()) {
                input.classList.add('border-red-500');
                isValid = false;
            } else {
                input.classList.remove('border-red-500');
            }
            
            // Checkbox logic
            if (input.type === 'checkbox') {
                const checked = steps[currentStep].querySelector('input[type="checkbox"]:checked');
                if (!checked) {
                    isValid = false;
                }
            }
        }

        if (!isValid) {
            ensureAlert('Missing Info', 'Please fill out the required fields before moving on.', 'error');
        }
        return isValid;
    };

    nextBtn.addEventListener('click', () => {
        if (validateStep() && currentStep < totalSteps - 1) {
            currentStep++;
            updateFormState();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateFormState();
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateStep()) return;

        const originalButtonText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending...';
        submitBtn.disabled = true;

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
        data.projectTypes = projectTypes;
        
        try {
            const response = await fetch('http://127.0.0.1:5000/api/project-inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Submission failed.');
            }

            ensureAlert('Success!', 'Your project pitch has been sent. We will be in touch shortly.', 'success');
            
            // Reset Form
            form.reset();
            currentStep = 0;
            updateFormState();

        } catch (error) {
            ensureAlert('Error', error.message, 'error');
        } finally {
            submitBtn.innerHTML = originalButtonText;
            submitBtn.disabled = false;
        }
    });

    // Initialize
    updateFormState();
});