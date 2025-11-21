document.addEventListener('DOMContentLoaded', () => {
    // Select all navigation links in the sidebar and all content panes
    const navLinks = document.querySelectorAll('.account-nav-link');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const folderLabel = document.getElementById('folder-label');

    const labels = {
        'profile': 'Profile.dat',
        'settings': 'Config.sys',
        'projects': 'Projects.exe'
    };

    // Function to handle switching tabs
    const switchTab = (tabId) => {
        // Remove 'active' class from all nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        tabPanes.forEach(pane => {
            pane.classList.add('hidden');
        });

        const activeLink = document.querySelector(`.account-nav-link[data-tab="${tabId}"]`);
        const activePane = document.getElementById(`${tabId}-pane`);

        // If they exist, make them active/visible
        if (activeLink) {
            activeLink.classList.add('active');
        }
        if (activePane) {
            activePane.classList.remove('hidden');
        }
        
        if(folderLabel && labels[tabId]) {
            folderLabel.innerText = labels[tabId];
        }
    };

    // Add click event listeners to each navigation link
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); 
            const tabId = link.dataset.tab;
            history.pushState(null, null, `#${tabId}`);
            switchTab(tabId);
        });
    });

    // Handle the "Edit Profile" button click
    const editProfileButton = document.getElementById('edit-profile-button');
    if (editProfileButton) {
        editProfileButton.addEventListener('click', () => {
            switchTab('settings');
            history.pushState(null, null, '#settings');
        });
    }

    // Check for a hash in the URL on page load
    const currentHash = window.location.hash.substring(1);
    if (currentHash) {
        switchTab(currentHash);
    } else {
        switchTab('profile');
    }
});