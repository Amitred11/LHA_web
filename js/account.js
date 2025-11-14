// js/account.js
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-link');
    const panes = document.querySelectorAll('.tab-pane');
    const heroTitle = document.getElementById('account-hero-title');
    const heroSubtitle = document.getElementById('account-hero-subtitle');
    const editProfileButton = document.getElementById('edit-profile-button');

    const heroContent = {
        profile: {
            title: 'My Profile',
            subtitle: 'Your central hub in the LHA Collective. View your information and manage your account.'
        },
        settings: {
            title: 'Account Settings',
            subtitle: 'Update your profile information, change your password, and manage your account preferences.'
        }
    };

    const switchTab = (tabName) => {
        // Update hero content
        if (heroContent[tabName]) {
            heroTitle.textContent = heroContent[tabName].title;
            heroSubtitle.textContent = heroContent[tabName].subtitle;
        }

        // Update active tab link
        tabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Show the correct pane
        panes.forEach(pane => {
            if (pane.id === `${tabName}-pane`) {
                pane.classList.remove('hidden');
            } else {
                pane.classList.add('hidden');
            }
        });
        
        // Update URL hash without jumping
        history.pushState(null, null, `#${tabName}`);
    };

    // Event listener for tab clicks
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = e.currentTarget.dataset.tab;
            switchTab(tabName);
        });
    });

    // Event listener for the "Edit Profile" button
    if (editProfileButton) {
        editProfileButton.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab('settings');
        });
    }

    // Handle browser back/forward navigation
    window.addEventListener('popstate', () => {
        const hash = window.location.hash.substring(1);
        const initialTab = (hash === 'settings') ? 'settings' : 'profile';
        switchTab(initialTab);
    });

    // Set initial tab based on URL hash on page load
    const hash = window.location.hash.substring(1);
    const initialTab = (hash === 'settings') ? 'settings' : 'profile';
    switchTab(initialTab);
});