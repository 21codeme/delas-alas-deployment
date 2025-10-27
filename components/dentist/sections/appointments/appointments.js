// Appointments JavaScript
let appointments = [];
let filteredAppointments = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadAppointments();
});

// Load appointments data
function loadAppointments() {
    // Initialize empty array - data will be populated from real-time sources
    appointments = [];
    filteredAppointments = [];

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
        
        if (storedAppointments) {
            appointments = JSON.parse(storedAppointments);
            filteredAppointments = [...appointments];
        }
    } catch (error) {
        console.log('No existing appointments found or error loading from storage');
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
    //     filteredAppointments = [...appointments];
    //     displayAppointments();
    // });
    
    console.log('Appointments section initialized - ready for real-time data');
}

// Display appointments in table
function displayAppointments() {
    const tbody = document.getElementById('appointmentsTableBody');
    
    if (filteredAppointments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div style="padding: 40px; color: #666;">
                        <i class="fas fa-calendar-check" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                        <h3 style="margin: 0 0 10px 0;">No appointments yet</h3>
                        <p style="margin: 0;">Appointments will appear here when patients book online</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredAppointments.map(apt => `
        <tr>
            <td>
                <div class="datetime-cell">
                    <strong>${formatDate(apt.date)}</strong>
                    <span class="time">${apt.time}</span>
                </div>
            </td>
            <td>
                <div class="patient-cell">
                    <div class="patient-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="patient-details">
                        <strong>${apt.patient.name}</strong>
                        <p>ID: ${apt.patient.id}</p>
                    </div>
                </div>
            </td>
            <td>
                <span class="service-name">${apt.service}</span>
                <small class="notes">${apt.notes}</small>
            </td>
            <td>
                <div class="contact-info">
                    <div>${apt.patient.email}</div>
                    <div>${apt.patient.phone}</div>
                </div>
            </td>
            <td>
                <span class="status ${apt.status}">${apt.status}</span>
            </td>
            <td>
                <button class="btn btn-sm btn-info" onclick="showQRCode(${apt.id})">
                    <i class="fas fa-qrcode"></i> View QR
                </button>
            </td>
            <td>
                <div class="action-buttons">
                    ${apt.status === 'pending' ? `
                        <button class="btn btn-sm btn-success" onclick="confirmAppointment(${apt.id})">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-info" onclick="rescheduleAppointment(${apt.id})">
                        <i class="fas fa-calendar-alt"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="cancelAppointment(${apt.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Filter appointments
function filterAppointments() {
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    const searchInput = document.getElementById('searchInput').value.toLowerCase();

    filteredAppointments = appointments.filter(apt => {
        const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
        const matchesDate = !dateFilter || apt.date === dateFilter;
        const matchesSearch = !searchInput || apt.patient.name.toLowerCase().includes(searchInput);

        return matchesStatus && matchesDate && matchesSearch;
    });

    displayAppointments();
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

// Action functions
function newAppointment() {
    alert('Opening new appointment form...');
    // Implement your new appointment form logic here
}

function exportAppointments() {
    alert('Exporting appointments...');
    // Implement your export logic here
}

function showQRCode(id) {
    const apt = appointments.find(a => a.id === id);
    if (apt) {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2>Appointment QR Code</h2>
            <div style="text-align: center; padding: 20px;">
                <div style="width: 200px; height: 200px; margin: 0 auto; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 10px;">
                    <i class="fas fa-qrcode" style="font-size: 150px; color: #667eea;"></i>
                </div>
                <p style="margin-top: 20px; font-weight: 600;">QR Code: ${apt.qrCode}</p>
                <p>Patient: ${apt.patient.name}</p>
                <p>Date: ${formatDate(apt.date)} at ${apt.time}</p>
            </div>
        `;
        document.getElementById('appointmentModal').style.display = 'block';
    }
}

function confirmAppointment(id) {
    const apt = appointments.find(a => a.id === id);
    if (apt && confirm(`Confirm appointment for ${apt.patient.name}?`)) {
        apt.status = 'confirmed';
        displayAppointments();
        alert('Appointment confirmed successfully!');
    }
}

function rescheduleAppointment(id) {
    const apt = appointments.find(a => a.id === id);
    if (apt) {
        alert(`Rescheduling appointment for ${apt.patient.name}...`);
        // Implement your reschedule logic here
    }
}

function cancelAppointment(id) {
    const apt = appointments.find(a => a.id === id);
    if (apt && confirm(`Cancel appointment for ${apt.patient.name}?`)) {
        apt.status = 'cancelled';
        displayAppointments();
        alert('Appointment cancelled.');
    }
}

function closeModal() {
    document.getElementById('appointmentModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('appointmentModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Real-time updates (replace with your actual real-time implementation)
// This function will be called when new appointments arrive from your backend
function updateAppointmentsData(newAppointments) {
    appointments = newAppointments;
    filteredAppointments = [...appointments];
    displayAppointments();
}

// Example function to add new appointment (called when patient books)
function addNewAppointment(appointmentData) {
    const newAppointment = {
        id: Date.now(), // Generate unique ID
        ...appointmentData,
        status: 'pending', // Default status
        qrCode: 'QR-' + Date.now() // Generate QR code
    };
    
    appointments.push(newAppointment);
    filteredAppointments = [...appointments];
    displayAppointments();
    
    // Save to localStorage (replace with your backend save)
    localStorage.setItem('dentalAppointments', JSON.stringify(appointments));
    
    return newAppointment;
}

// Example function to update appointment status
function updateAppointmentStatus(appointmentId, newStatus) {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
        appointment.status = newStatus;
        filteredAppointments = [...appointments];
        displayAppointments();
        
        // Save to localStorage (replace with your backend save)
        localStorage.setItem('dentalAppointments', JSON.stringify(appointments));
    }
}

