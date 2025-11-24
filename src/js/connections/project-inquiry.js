document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    // Change this to your computer's IP (e.g., 'http://192.168.1.5:5000') if testing on mobile
    const API_BASE_URL = 'http://127.0.0.1:5000'; 

    const form = document.getElementById('project-inquiry-form');
    if (!form) return;

    // UI References
    const steps = Array.from(document.querySelectorAll('.form-step'));
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-btn');
    const progressBar = document.getElementById('progress-bar');
    const stepIndicator = document.getElementById('step-indicator');

    let currentStepIndex = 0;

    // --- UI LOGIC ---
    function updateUI() {
        steps.forEach((step, index) => {
            if (index === currentStepIndex) {
                step.classList.remove('hidden');
                step.classList.add('animate-fade-in'); // Re-trigger animation
            } else {
                step.classList.add('hidden');
                step.classList.remove('animate-fade-in');
            }
        });

        const progress = ((currentStepIndex + 1) / steps.length) * 100;
        progressBar.style.width = `${progress}%`;
        stepIndicator.textContent = `STEP ${currentStepIndex + 1} OF ${steps.length}`;

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
                input.addEventListener('input', () => input.classList.remove('border-red-500'), { once: true });
            }
        });
        return isValid;
    }

    // --- EVENT LISTENERS ---
    nextBtn.addEventListener('click', () => {
        if (validateCurrentStep()) {
            currentStepIndex++;
            updateUI();
        } else {
            nextBtn.classList.add('animate-pulse', 'bg-red-500');
            setTimeout(() => nextBtn.classList.remove('animate-pulse', 'bg-red-500'), 500);
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStepIndex > 0) {
            currentStepIndex--;
            updateUI();
        }
    });

    // --- API CONNECTION ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateCurrentStep()) return;

        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Transmitting...';
        submitBtn.disabled = true;

        const formData = new FormData(form);
        const data = {};
        const projectTypes = [];

        // Handle Multi-select Checkboxes
        for (const [key, value] of formData.entries()) {
            if (key === 'projectTypes') {
                projectTypes.push(value);
            } else {
                data[key] = value;
            }
        }
        if (projectTypes.length > 0) data.projectTypes = projectTypes;

        try {
            const response = await fetch(`${API_BASE_URL}/api/project-inquiry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // Success Redirect
                window.location.href = '/src/screens/projects/quest-accepted.html';
            } else {
                throw new Error(result.message || 'Server error');
            }
        } catch (error) {
            console.error('Submission Error:', error);
            alert('Connection Failed: ' + error.message);
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    updateUI();
});