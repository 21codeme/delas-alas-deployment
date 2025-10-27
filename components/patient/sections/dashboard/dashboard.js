// Dashboard JavaScript
(function() {
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard section loaded');
    
    // Load dashboard data
    loadDashboardData();
    
    // Set up real-time updates
    setInterval(updateDashboardStats, 30000); // Update every 30 seconds
});

// Load dashboard data
function loadDashboardData() {
    console.log('Loading dashboard data...');
    
    // Simulate loading delay
    setTimeout(() => {
        updateDashboardStats();
        loadRecentAppointments();
    }, 500);
}

// Update dashboard statistics
function updateDashboardStats() {
    console.log('Updating dashboard stats...');
    
    // Simulate real-time data
    const stats = {
        upcomingAppointments: Math.floor(Math.random() * 5) + 1,
        completedTreatments: Math.floor(Math.random() * 10) + 5,
        unreadMessages: Math.floor(Math.random() * 3),
        nextCheckup: getNextCheckupDate()
    };
    
    // Update stat values
    document.getElementById('upcomingAppointments').textContent = stats.upcomingAppointments;
    document.getElementById('completedTreatments').textContent = stats.completedTreatments;
    document.getElementById('unreadMessages').textContent = stats.unreadMessages;
    document.getElementById('nextCheckup').textContent = stats.nextCheckup;
    
    console.log('Dashboard stats updated:', stats);
}

// Get next checkup date
function getNextCheckupDate() {
    const today = new Date();
    const nextCheckup = new Date(today);
    nextCheckup.setDate(today.getDate() + Math.floor(Math.random() * 30) + 7);
    
    return nextCheckup.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

// Load recent appointments
function loadRecentAppointments() {
    console.log('Loading recent appointments...');
    
    const appointmentsContainer = document.getElementById('recentAppointments');
    
    // Simulate recent appointments data
    const recentAppointments = [
        {
            id: 1,
            date: '2024-01-15',
            time: '10:00 AM',
            dentist: 'Dr. Smith',
            service: 'Regular Checkup',
            status: 'scheduled'
        },
        {
            id: 2,
            date: '2024-01-10',
            time: '2:00 PM',
            dentist: 'Dr. Johnson',
            service: 'Teeth Cleaning',
            status: 'completed'
        },
        {
            id: 3,
            date: '2024-01-05',
            time: '11:30 AM',
            dentist: 'Dr. Smith',
            service: 'Cavity Filling',
            status: 'completed'
        }
    ];
    
    // Clear existing content
    appointmentsContainer.innerHTML = '';
    
    // Add appointments to the list
    recentAppointments.forEach(appointment => {
        const appointmentElement = createAppointmentElement(appointment);
        appointmentsContainer.appendChild(appointmentElement);
    });
    
    console.log('Recent appointments loaded:', recentAppointments.length);
}

// Create appointment element
function createAppointmentElement(appointment) {
    const div = document.createElement('div');
    div.className = 'appointment-item';
    
    div.innerHTML = `
        <div class="appointment-info">
            <h4>${appointment.service}</h4>
            <p>${appointment.dentist} • ${appointment.date} at ${appointment.time}</p>
        </div>
        <div class="appointment-status ${appointment.status}">
            ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </div>
    `;
    
    return div;
}

// Navigation function for sections
function navigateToSection(sectionId) {
    console.log('Dashboard navigateToSection called with:', sectionId);
    
    // Dispatch a custom event to the main window
    const event = new CustomEvent('navigateToSection', { 
        detail: { sectionId: sectionId } 
    });
    window.dispatchEvent(event);
}

// Export functions for global access
window.loadDashboardData = loadDashboardData;
window.updateDashboardStats = updateDashboardStats;
window.navigateToSection = navigateToSection;
})();
