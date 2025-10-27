// Appointments JavaScript
(function() {
    let appointments = [];
    let appointmentsCurrentFilter = 'all';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Appointments section loaded');
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;
    
    // Load appointments
    loadAppointments();
    
    // Set up real-time updates
    setInterval(updateAppointments, 60000); // Update every minute
});

// Load appointments data from Supabase database
async function loadAppointments() {
    console.log('Loading appointments from database...');
    
    try {
        if (!window.supabase) {
            console.log('Supabase not initialized yet');
            appointments = [];
            displayAppointments();
            return;
        }

        // Get current user
        const { data: { user } } = await window.supabase.auth.getUser();
        if (!user) {
            console.log('No authenticated user');
            appointments = [];
            displayAppointments();
            return;
        }

        // Load appointments from database
        const { data, error } = await window.supabase
            .from('appointments')
            .select('*')
            .eq('patient_id', user.id)
            .order('appointment_date', { ascending: false });

        if (error) {
            console.error('Error loading appointments from database:', error);
            appointments = [];
        } else {
            appointments = data || [];
            console.log('Appointments loaded from database:', appointments.length);
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
        appointments = [];
    }
    
    displayAppointments();
}

// Display appointments based on current filter
function displayAppointments() {
    const container = document.getElementById('appointmentsList');
    const emptyState = document.getElementById('emptyState');
    
    // Filter appointments
    let filteredAppointments = appointments;
    if (appointmentsCurrentFilter !== 'all') {
        filteredAppointments = appointments.filter(apt => apt.status === appointmentsCurrentFilter);
    }
    
    // Clear container
    container.innerHTML = '';
    
    if (filteredAppointments.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        container.style.display = 'grid';
        emptyState.style.display = 'none';
        
        // Sort appointments by date (upcoming first)
        filteredAppointments.sort((a, b) => {
            if (a.status === 'scheduled' && b.status !== 'scheduled') return -1;
            if (b.status === 'scheduled' && a.status !== 'scheduled') return 1;
            return new Date(b.date) - new Date(a.date);
        });
        
        // Create appointment cards
        filteredAppointments.forEach(appointment => {
            const card = createAppointmentCard(appointment);
            container.appendChild(card);
        });
    }
}

// Create appointment card element
function createAppointmentCard(appointment) {
    const card = document.createElement('div');
    card.className = 'appointment-card';
    
    const statusClass = appointment.status;
    const statusText = appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1);
    
    card.innerHTML = `
        <div class="appointment-header">
            <div class="appointment-info">
                <h3>${appointment.service}</h3>
                <p><i class="fas fa-user-md"></i> ${appointment.dentist}</p>
                <p><i class="fas fa-calendar"></i> ${formatDate(appointment.date)}</p>
                <p><i class="fas fa-clock"></i> ${formatTime(appointment.time)}</p>
                ${appointment.notes ? `<p><i class="fas fa-sticky-note"></i> ${appointment.notes}</p>` : ''}
            </div>
            <div class="appointment-status ${statusClass}">${statusText}</div>
        </div>
        <div class="appointment-actions">
            <button class="btn-secondary" onclick="viewAppointmentDetails(${appointment.id})">
                <i class="fas fa-eye"></i> View Details
            </button>
            ${appointment.status === 'scheduled' ? `
                <button class="btn-secondary" onclick="rescheduleAppointment(${appointment.id})">
                    <i class="fas fa-calendar-alt"></i> Reschedule
                </button>
                <button class="btn-danger" onclick="cancelAppointment(${appointment.id})">
                    <i class="fas fa-times"></i> Cancel
                </button>
            ` : ''}
        </div>
    `;
    
    return card;
}

// Filter appointments
function filterAppointments(filter) {
    console.log('Filtering appointments:', filter);
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    appointmentsCurrentFilter = filter;
    displayAppointments();
}

// Show book appointment modal
function showBookAppointmentModal() {
    console.log('Opening book appointment modal');
    document.getElementById('bookAppointmentModal').style.display = 'block';
}

// Close modal
function closeModal(modalId) {
    console.log('Closing modal:', modalId);
    document.getElementById(modalId).style.display = 'none';
}

// Book new appointment
function bookAppointment(event) {
    event.preventDefault();
    console.log('Booking new appointment...');
    
    const formData = {
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('appointmentTime').value,
        service: document.getElementById('appointmentService').value,
        dentist: document.getElementById('appointmentDentist').value,
        notes: document.getElementById('appointmentNotes').value
    };
    
    // Create new appointment
    const newAppointment = {
        id: Date.now(),
        ...formData,
        status: 'scheduled',
        createdAt: new Date().toISOString()
    };
    
    // Add to appointments array
    appointments.unshift(newAppointment);
    
    // Update display
    displayAppointments();
    
    // Close modal and reset form
    closeModal('bookAppointmentModal');
    document.getElementById('bookAppointmentForm').reset();
    
    // Show success message
    showToast('Appointment booked successfully!', 'success');
    
    console.log('Appointment booked:', newAppointment);
}

// View appointment details
function viewAppointmentDetails(appointmentId) {
    console.log('Viewing appointment details:', appointmentId);
    
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
    
    const modal = document.getElementById('appointmentDetailsModal');
    const content = document.getElementById('appointmentDetailsContent');
    
    content.innerHTML = `
        <div style="padding: 25px;">
            <div class="appointment-details">
                <h4>${appointment.service}</h4>
                <p><strong>Dentist:</strong> ${appointment.dentist}</p>
                <p><strong>Date:</strong> ${formatDate(appointment.date)}</p>
                <p><strong>Time:</strong> ${formatTime(appointment.time)}</p>
                <p><strong>Status:</strong> <span class="appointment-status ${appointment.status}">${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span></p>
                ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
                <p><strong>Created:</strong> ${formatDateTime(appointment.createdAt)}</p>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Reschedule appointment
function rescheduleAppointment(appointmentId) {
    console.log('Rescheduling appointment:', appointmentId);
    
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
    
    const newDate = prompt('Enter new date (YYYY-MM-DD):', appointment.date);
    const newTime = prompt('Enter new time (HH:MM):', appointment.time);
    
    if (newDate && newTime) {
        appointment.date = newDate;
        appointment.time = newTime;
        appointment.status = 'scheduled';
        
        displayAppointments();
        showToast('Appointment rescheduled successfully!', 'success');
    }
}

// Cancel appointment
function cancelAppointment(appointmentId) {
    console.log('Cancelling appointment:', appointmentId);
    
    if (confirm('Are you sure you want to cancel this appointment?')) {
        const appointment = appointments.find(apt => apt.id === appointmentId);
        if (appointment) {
            appointment.status = 'cancelled';
            displayAppointments();
            showToast('Appointment cancelled successfully!', 'success');
        }
    }
}

// Update appointments (real-time simulation)
function updateAppointments() {
    console.log('Updating appointments...');
    
    // Simulate real-time updates
    appointments.forEach(appointment => {
        if (appointment.status === 'scheduled') {
            const appointmentDate = new Date(appointment.date);
            const now = new Date();
            
            // Mark as completed if appointment time has passed
            if (appointmentDate < now) {
                appointment.status = 'completed';
            }
        }
    });
    
    displayAppointments();
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
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
    console.log('Appointments navigateToSection called with:', sectionId);
    
    // Dispatch a custom event to the main window
    const event = new CustomEvent('navigateToSection', { 
        detail: { sectionId: sectionId } 
    });
    window.dispatchEvent(event);
}

// Export functions for global access
window.showBookAppointmentModal = showBookAppointmentModal;
window.closeModal = closeModal;
window.bookAppointment = bookAppointment;
window.viewAppointmentDetails = viewAppointmentDetails;
window.rescheduleAppointment = rescheduleAppointment;
window.cancelAppointment = cancelAppointment;
window.filterAppointments = filterAppointments;
window.navigateToSection = navigateToSection;
})();
