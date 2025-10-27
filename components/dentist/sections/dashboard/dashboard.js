// Dashboard JavaScript
let appointments = [];
let patients = [];

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    updateStats();
});

// Load dashboard data
function loadDashboardData() {
    // Initialize empty arrays - data will be populated from real-time sources
    appointments = [];
    patients = [];

    // Try to load from localStorage first (for demo purposes)
    loadFromLocalStorage();
    
    // Set up real-time listeners (replace with your real-time data source)
    setupRealtimeListeners();
    
    displayAppointments();
}

// Load data from localStorage (temporary - replace with your real-time source)
function loadFromLocalStorage() {
    try {
        const storedAppointments = localStorage.getItem('dentalAppointments');
        const storedPatients = localStorage.getItem('dentalPatients');
        
        if (storedAppointments) {
            appointments = JSON.parse(storedAppointments);
        }
        
        if (storedPatients) {
            patients = JSON.parse(storedPatients);
        }
    } catch (error) {
        console.log('No existing data found or error loading from storage');
    }
}

// Set up real-time listeners (replace with your Firebase/WebSocket implementation)
function setupRealtimeListeners() {
    // Example: Listen for new appointments
    // firebase.firestore().collection('appointments').onSnapshot((snapshot) => {
    //     appointments = [];
    //     snapshot.forEach(doc => {
    //         appointments.push({ id: doc.id, ...doc.data() });
    //     });
    //     displayAppointments();
    //     updateStats();
    // });
    
    // Example: Listen for new patients
    // firebase.firestore().collection('patients').onSnapshot((snapshot) => {
    //     patients = [];
    //     snapshot.forEach(doc => {
    //         patients.push({ id: doc.id, ...doc.data() });
    //     });
    //     updateStats();
    // });
    
    console.log('Dashboard section initialized - ready for real-time data');
}

// Update statistics
function updateStats() {
    const todayAppointments = appointments.length;
    const totalPatients = patients.length;
    const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;
    
    // Calculate monthly revenue from appointments (replace with your calculation)
    const monthlyRevenue = appointments.reduce((total, apt) => {
        // Add service price if available, otherwise use default
        return total + (apt.servicePrice || 0);
    }, 0);

    document.getElementById('todayAppointments').textContent = todayAppointments;
    document.getElementById('totalPatients').textContent = totalPatients;
    document.getElementById('pendingAppointments').textContent = pendingAppointments;
    document.getElementById('monthlyRevenue').textContent = '₱' + monthlyRevenue.toLocaleString();
}

// Display appointments in table
function displayAppointments() {
    const tbody = document.getElementById('appointmentsTableBody');
    
    if (appointments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div style="padding: 40px; color: #666;">
                        <i class="fas fa-calendar-times" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                        <h3 style="margin: 0 0 10px 0;">No appointments yet</h3>
                        <p style="margin: 0;">Appointments will appear here when patients book online</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = appointments.map(apt => `
        <tr>
            <td><strong>${apt.time}</strong></td>
            <td>${apt.patient}</td>
            <td>${apt.service}</td>
            <td>
                <div>${apt.email}</div>
                <div style="color: #666; font-size: 12px;">${apt.phone}</div>
            </td>
            <td><span class="status ${apt.status}">${apt.status}</span></td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewAppointment(${apt.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-success" onclick="confirmAppointment(${apt.id})">
                    <i class="fas fa-check"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Quick action functions
function viewAllAppointments() {
    alert('Navigating to Appointments page...');
    // In your main dashboard, this would navigate to the appointments section
}

function newAppointment() {
    alert('Opening new appointment form...');
}

function addPatient() {
    alert('Opening add patient form...');
}

function viewSchedule() {
    alert('Navigating to Schedule page...');
}

function viewMessages() {
    alert('Navigating to Messages page...');
}

function viewAppointment(id) {
    const apt = appointments.find(a => a.id === id);
    if (apt) {
        alert(`Viewing appointment for ${apt.patient}\nTime: ${apt.time}\nService: ${apt.service}`);
    }
}

function confirmAppointment(id) {
    const apt = appointments.find(a => a.id === id);
    if (apt) {
        apt.status = 'confirmed';
        displayAppointments();
        updateStats();
        alert(`Appointment for ${apt.patient} confirmed!`);
    }
}

// Real-time updates (replace with your actual real-time implementation)
// This function will be called when new data arrives from your backend
function updateDashboardData(newAppointments, newPatients) {
    if (newAppointments) {
        appointments = newAppointments;
        displayAppointments();
    }
    
    if (newPatients) {
        patients = newPatients;
    }
    
    updateStats();
}

// Example function to add new appointment (called when patient books)
function addNewAppointment(appointmentData) {
    appointments.push(appointmentData);
    displayAppointments();
    updateStats();
    
    // Save to localStorage (replace with your backend save)
    localStorage.setItem('dentalAppointments', JSON.stringify(appointments));
}

// Example function to add new patient (called when patient registers)
function addNewPatient(patientData) {
    patients.push(patientData);
    updateStats();
    
    // Save to localStorage (replace with your backend save)
    localStorage.setItem('dentalPatients', JSON.stringify(patients));
}

