// Settings JavaScript
(function() {
let userSettings = {};
let userProfile = {};

document.addEventListener('DOMContentLoaded', function() {
    console.log('Settings section loaded');
    
    // Load user data and settings
    loadUserData();
    loadSettings();
    
    // Set up event listeners
    setupEventListeners();
});

// Load user data
function loadUserData() {
    console.log('Loading user data...');
    
    // Get user data from localStorage or use defaults
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        try {
            userProfile = JSON.parse(storedUser);
        } catch (error) {
            console.error('Error parsing user data:', error);
            userProfile = getDefaultProfile();
        }
    } else {
        userProfile = getDefaultProfile();
    }
    
    updateProfileDisplay();
}

// Get default profile
function getDefaultProfile() {
    return {
        name: 'Patient',
        email: 'patient@email.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main St, City, State 12345',
        birthDate: '1990-01-01'
    };
}

// Load settings
function loadSettings() {
    console.log('Loading settings...');
    
    // Get settings from localStorage or use defaults
    const storedSettings = localStorage.getItem('userSettings');
    if (storedSettings) {
        try {
            userSettings = JSON.parse(storedSettings);
        } catch (error) {
            console.error('Error parsing settings:', error);
            userSettings = getDefaultSettings();
        }
    } else {
        userSettings = getDefaultSettings();
    }
    
    updateSettingsDisplay();
}

// Get default settings
function getDefaultSettings() {
    return {
        emailNotifications: true,
        smsNotifications: false,
        appointmentReminders: true,
        treatmentUpdates: true,
        dataSharing: false,
        marketingCommunications: false,
        profileVisibility: false
    };
}

// Update profile display
function updateProfileDisplay() {
    document.getElementById('profileName').textContent = userProfile.name;
    document.getElementById('profileEmail').textContent = userProfile.email;
    document.getElementById('profilePhone').textContent = userProfile.phone;
}

// Update settings display
function updateSettingsDisplay() {
    document.getElementById('emailNotifications').checked = userSettings.emailNotifications;
    document.getElementById('smsNotifications').checked = userSettings.smsNotifications;
    document.getElementById('appointmentReminders').checked = userSettings.appointmentReminders;
    document.getElementById('treatmentUpdates').checked = userSettings.treatmentUpdates;
    document.getElementById('dataSharing').checked = userSettings.dataSharing;
    document.getElementById('marketingCommunications').checked = userSettings.marketingCommunications;
    document.getElementById('profileVisibility').checked = userSettings.profileVisibility;
}

// Set up event listeners
function setupEventListeners() {
    // Notification settings
    document.getElementById('emailNotifications').addEventListener('change', function() {
        userSettings.emailNotifications = this.checked;
        saveSettings();
    });
    
    document.getElementById('smsNotifications').addEventListener('change', function() {
        userSettings.smsNotifications = this.checked;
        saveSettings();
    });
    
    document.getElementById('appointmentReminders').addEventListener('change', function() {
        userSettings.appointmentReminders = this.checked;
        saveSettings();
    });
    
    document.getElementById('treatmentUpdates').addEventListener('change', function() {
        userSettings.treatmentUpdates = this.checked;
        saveSettings();
    });
    
    // Privacy settings
    document.getElementById('dataSharing').addEventListener('change', function() {
        userSettings.dataSharing = this.checked;
        saveSettings();
    });
    
    document.getElementById('marketingCommunications').addEventListener('change', function() {
        userSettings.marketingCommunications = this.checked;
        saveSettings();
    });
    
    document.getElementById('profileVisibility').addEventListener('change', function() {
        userSettings.profileVisibility = this.checked;
        saveSettings();
    });
}

// Save settings
function saveSettings() {
    console.log('Saving settings:', userSettings);
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
    showToast('Settings saved successfully!', 'success');
}

// Edit profile
function editProfile() {
    console.log('Opening edit profile modal');
    
    // Populate form with current data
    document.getElementById('profileNameInput').value = userProfile.name;
    document.getElementById('profileEmailInput').value = userProfile.email;
    document.getElementById('profilePhoneInput').value = userProfile.phone;
    document.getElementById('profileAddressInput').value = userProfile.address || '';
    document.getElementById('profileBirthDateInput').value = userProfile.birthDate || '';
    
    document.getElementById('editProfileModal').style.display = 'block';
}

// Save profile
function saveProfile(event) {
    event.preventDefault();
    console.log('Saving profile...');
    
    const formData = {
        name: document.getElementById('profileNameInput').value,
        email: document.getElementById('profileEmailInput').value,
        phone: document.getElementById('profilePhoneInput').value,
        address: document.getElementById('profileAddressInput').value,
        birthDate: document.getElementById('profileBirthDateInput').value
    };
    
    // Update user profile
    userProfile = { ...userProfile, ...formData };
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(userProfile));
    
    // Update display
    updateProfileDisplay();
    
    // Close modal
    closeModal('editProfileModal');
    
    // Show success message
    showToast('Profile updated successfully!', 'success');
    
    console.log('Profile saved:', userProfile);
}

// Change profile picture
function changeProfilePicture() {
    console.log('Changing profile picture');
    
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            // Simulate file upload
            const reader = new FileReader();
            reader.onload = function(e) {
                // Update avatar (in a real app, you'd upload to server)
                const avatar = document.querySelector('.avatar-placeholder');
                avatar.innerHTML = `<img src="${e.target.result}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                
                showToast('Profile picture updated successfully!', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
}

// Change password
function changePassword() {
    console.log('Opening change password modal');
    document.getElementById('changePasswordModal').style.display = 'block';
}

// Save password
function savePassword(event) {
    event.preventDefault();
    console.log('Changing password...');
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match!', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showToast('Password must be at least 8 characters long!', 'error');
        return;
    }
    
    // Simulate password change
    setTimeout(() => {
        // Clear form
        document.getElementById('changePasswordForm').reset();
        
        // Close modal
        closeModal('changePasswordModal');
        
        // Show success message
        showToast('Password changed successfully!', 'success');
        
        console.log('Password changed successfully');
    }, 1000);
}

// Toggle 2FA
function toggle2FA() {
    console.log('Toggling 2FA');
    
    const isEnabled = confirm('Do you want to enable Two-Factor Authentication?');
    
    if (isEnabled) {
        // Simulate 2FA setup
        setTimeout(() => {
            showToast('Two-Factor Authentication enabled successfully!', 'success');
        }, 1000);
    }
}

// Delete account
function deleteAccount() {
    console.log('Deleting account');
    
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    
    if (confirmation === 'DELETE') {
        if (confirm('Are you absolutely sure? This action cannot be undone!')) {
            // Simulate account deletion
            setTimeout(() => {
                localStorage.clear();
                showToast('Account deleted successfully!', 'success');
                
                // Redirect to login
                setTimeout(() => {
                    window.location.href = '../../index.html';
                }, 2000);
            }, 1000);
        }
    } else if (confirmation !== null) {
        showToast('Account deletion cancelled. Please type "DELETE" exactly.', 'error');
    }
}

// Close modal
function closeModal(modalId) {
    console.log('Closing modal:', modalId);
    document.getElementById(modalId).style.display = 'none';
}

// Show toast notification
function showToast(message, type = 'info') {
    if (window.parent && window.parent.showToast) {
        window.parent.showToast(message, type);
    } else {
        console.log(`Toast (${type}):`, message);
    }
}

// Navigation function for sections
function navigateToSection(sectionId) {
    console.log('Settings navigateToSection called with:', sectionId);
    
    // Dispatch a custom event to the main window
    const event = new CustomEvent('navigateToSection', { 
        detail: { sectionId: sectionId } 
    });
    window.dispatchEvent(event);
}

// Export functions for global access
window.editProfile = editProfile;
window.saveProfile = saveProfile;
window.changeProfilePicture = changeProfilePicture;
window.changePassword = changePassword;
window.savePassword = savePassword;
window.toggle2FA = toggle2FA;
window.deleteAccount = deleteAccount;
window.closeModal = closeModal;
window.navigateToSection = navigateToSection;
})();
