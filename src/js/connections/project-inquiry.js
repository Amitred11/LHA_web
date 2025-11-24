document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const API_BASE_URL = 'https://backendkostudy.onrender.com'; // Ensure your Flask app is running here

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
        // 1. Show/Hide Steps with Animation
        steps.forEach((step, index) => {
            if (index === currentStepIndex) {
                step.classList.remove('hidden');
                // Small timeout to allow the browser to register the class removal before animating
                setTimeout(() => step.classList.add('animate-fade-in'), 10);
            } else {
                step.classList.add('hidden');
                step.classList.remove('animate-fade-in');
            }
        });

        // 2. Update Progress Bar
        const progress = ((currentStepIndex + 1) / steps.length) * 100;
        progressBar.style.width = `${progress}%`;
        stepIndicator.textContent = `STEP ${currentStepIndex + 1} OF ${steps.length}`;

        // 3. Update Buttons
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
        let isValid = true;

        // A. Validate Text Inputs, Textareas, and Selects
        const inputs = currentStepEl.querySelectorAll('input[type="text"], input[type="email"], textarea, select');
        
        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                isValid = false;
                input.classList.add('border-red-500', 'bg-red-50');
                
                // Remove error style on input
                input.addEventListener('input', () => {
                    input.classList.remove('border-red-500', 'bg-red-50');
                }, { once: true });
            }
        });

        // B. Validate Checkboxes (Step 2 specific logic)
        // If the current step contains checkboxes named 'projectTypes', ensure at least one is checked
        const checkboxes = currentStepEl.querySelectorAll('input[name="projectTypes"]');
        if (checkboxes.length > 0) {
            const isChecked = Array.from(checkboxes).some(cb => cb.checked);
            if (!isChecked) {
                isValid = false;
                // Add a visual shake or border to the container
                const container = currentStepEl.querySelector('.grid'); 
                if (container) {
                    container.classList.add('border-2', 'border-red-500', 'p-2', 'rounded');
                    // Remove error on click
                    container.addEventListener('click', () => {
                        container.classList.remove('border-2', 'border-red-500', 'p-2', 'rounded');
                    }, { once: true });
                }
                alert("Please select at least one service type.");
            }
        }

        return isValid;
    }

    // --- EVENT LISTENERS ---
    nextBtn.addEventListener('click', () => {
        if (validateCurrentStep()) {
            currentStepIndex++;
            updateUI();
        } else {
            // Visual feedback for error
            nextBtn.classList.add('bg-red-500', 'animate-pulse');
            setTimeout(() => nextBtn.classList.remove('bg-red-500', 'animate-pulse'), 500);
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

        // 1. Loading State
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> TRANSMITTING...';
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-75', 'cursor-not-allowed');

        // 2. Prepare Data
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
        
        // Add array to data object
        if (projectTypes.length > 0) {
            data.projectTypes = projectTypes;
        }

        try {
            // 3. Send Request
            const response = await fetch(`${API_BASE_URL}/api/project-inquiry`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // 4. Success -> Redirect
                // Ensure this path exists in your folder structure
                window.location.href = '/src/screens/projects/quest-accepted.html';
            } else {
                throw new Error(result.message || 'Server rejected the quest.');
            }
        } catch (error) {
            console.error('Submission Error:', error);
            
            // 5. Error Handling UI
            alert(`Connection Failed: ${error.message}\nMake sure the backend is running.`);
            
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        }
    });

    // Initialize UI
    updateUI();
});