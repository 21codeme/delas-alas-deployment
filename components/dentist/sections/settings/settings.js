// Settings JavaScript

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    setupDayScheduleToggles();
});

// Load settings from storage
function loadSettings() {
    // In a real application, load settings from your backend or localStorage
    console.log('Loading settings...');
}

// Setup day schedule toggles
function setupDayScheduleToggles() {
    const checkboxes = document.querySelectorAll('.day-schedule input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const timeInputs = this.closest('.day-schedule').querySelectorAll('input[type="time"]');
            timeInputs.forEach(input => {
                input.disabled = !this.checked;
            });
        });
    });
}

// Save profile settings
function saveProfile() {
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const specialization = document.getElementById('specialization').value;

    if (!fullName || !email || !phone) {
        alert('Please fill in all required fields.');
        return;
    }

    // In a real application, save to backend
    console.log('Saving profile:', { fullName, email, phone, specialization });
    
    alert('Profile settings saved successfully!');
}

// Save clinic settings
function saveClinic() {
    const clinicName = document.getElementById('clinicName').value;
    const clinicAddress = document.getElementById('clinicAddress').value;
    const clinicPhone = document.getElementById('clinicPhone').value;
    const clinicEmail = document.getElementById('clinicEmail').value;

    if (!clinicName || !clinicAddress) {
        alert('Please fill in all required fields.');
        return;
    }

    // In a real application, save to backend
    console.log('Saving clinic info:', { clinicName, clinicAddress, clinicPhone, clinicEmail });
    
    alert('Clinic settings saved successfully!');
}

// Save working hours
function saveWorkingHours() {
    const schedules = [];
    const daySchedules = document.querySelectorAll('.day-schedule');
    
    daySchedules.forEach(schedule => {
        const checkbox = schedule.querySelector('input[type="checkbox"]');
        const day = checkbox.parentElement.textContent.trim();
        const timeInputs = schedule.querySelectorAll('input[type="time"]');
        
        if (checkbox.checked) {
            schedules.push({
                day: day,
                startTime: timeInputs[0].value,
                endTime: timeInputs[1].value,
                enabled: true
            });
        }
    });

    // In a real application, save to backend
    console.log('Saving working hours:', schedules);
    
    alert('Working hours saved successfully!');
}

// Save notification settings
function saveNotifications() {
    const notifications = {
        emailAppointments: document.querySelectorAll('.notification-option input[type="checkbox"]')[0].checked,
        smsAppointments: document.querySelectorAll('.notification-option input[type="checkbox"]')[1].checked,
        pushMessages: document.querySelectorAll('.notification-option input[type="checkbox"]')[2].checked,
        dailySummary: document.querySelectorAll('.notification-option input[type="checkbox"]')[3].checked
    };

    // In a real application, save to backend
    console.log('Saving notification settings:', notifications);
    
    alert('Notification settings saved successfully!');
}

// Change password
function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Please fill in all password fields.');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match.');
        return;
    }

    if (newPassword.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
    }

    // In a real application, send to backend
    console.log('Changing password...');
    
    alert('Password changed successfully!');
    
    // Clear password fields
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

// Delete account
function deleteAccount() {
    const confirmation = confirm(
        'Are you absolutely sure you want to delete your account?\n\n' +
        'This action cannot be undone and all your data will be permanently deleted.'
    );

    if (!confirmation) return;

    const finalConfirmation = prompt(
        'To confirm account deletion, please type "DELETE" in all caps:'
    );

    if (finalConfirmation === 'DELETE') {
        // In a real application, send delete request to backend
        console.log('Deleting account...');
        alert('Account deletion initiated. You will be logged out shortly.');
        
        // Redirect to login page
        setTimeout(() => {
            window.location.href = '../../index.html';
        }, 2000);
    } else {
        alert('Account deletion cancelled.');
    }
}

// Auto-save functionality (optional)
let autoSaveTimeout;
function autoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        console.log('Auto-saving settings...');
        // Implement auto-save logic here
    }, 2000); // Save 2 seconds after user stops typing
}

// Add auto-save listeners to all inputs
document.querySelectorAll('input, textarea, select').forEach(input => {
    input.addEventListener('input', autoSave);
});




