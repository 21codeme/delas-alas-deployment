// Treatments JavaScript
(function() {
    let treatments = [];
    let treatmentsCurrentFilter = 'all';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Treatments section loaded');
    
    // Load treatments
    loadTreatments();
    
    // Set up real-time updates
    setInterval(updateTreatments, 60000); // Update every minute
});

// Load treatments data from Supabase database
async function loadTreatments() {
    console.log('Loading treatments from database...');
    
    try {
        if (!window.supabase) {
            console.log('Supabase not initialized yet');
            treatments = [];
            updateTreatmentStats();
            displayTreatments();
            return;
        }

        // Get current user
        const { data: { user } } = await window.supabase.auth.getUser();
        if (!user) {
            console.log('No authenticated user');
            treatments = [];
            updateTreatmentStats();
            displayTreatments();
            return;
        }

        // Load treatments from database
        const { data, error } = await window.supabase
            .from('treatments')
            .select('*')
            .eq('patient_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading treatments from database:', error);
            treatments = [];
        } else {
            treatments = data || [];
            console.log('Treatments loaded from database:', treatments.length);
        }
    } catch (error) {
        console.error('Error loading treatments:', error);
        treatments = [];
    }
    
    updateTreatmentStats();
    displayTreatments();
}

// Update treatment statistics
function updateTreatmentStats() {
    const total = treatments.length;
    const completed = treatments.filter(t => t.status === 'completed').length;
    const inProgress = treatments.filter(t => t.status === 'in-progress').length;
    const nextFollowup = getNextFollowupDate();
    
    document.getElementById('totalTreatments').textContent = total;
    document.getElementById('completedTreatments').textContent = completed;
    document.getElementById('inProgressTreatments').textContent = inProgress;
    document.getElementById('nextFollowup').textContent = nextFollowup;
}

// Get next follow-up date
function getNextFollowupDate() {
    const upcomingFollowups = treatments
        .filter(t => t.followUpDate && new Date(t.followUpDate) > new Date())
        .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate));
    
    if (upcomingFollowups.length > 0) {
        return new Date(upcomingFollowups[0].followUpDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }
    
    return '-';
}

// Display treatments based on current filter
function displayTreatments() {
    const container = document.getElementById('treatmentsList');
    const emptyState = document.getElementById('emptyState');
    
    // Filter treatments
    let filteredTreatments = treatments;
    if (treatmentsCurrentFilter !== 'all') {
        filteredTreatments = treatments.filter(t => t.status === treatmentsCurrentFilter);
    }
    
    // Clear container
    container.innerHTML = '';
    
    if (filteredTreatments.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        container.style.display = 'grid';
        emptyState.style.display = 'none';
        
        // Sort treatments by date (most recent first)
        filteredTreatments.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Create treatment cards
        filteredTreatments.forEach(treatment => {
            const card = createTreatmentCard(treatment);
            container.appendChild(card);
        });
    }
}

// Create treatment card element
function createTreatmentCard(treatment) {
    const card = document.createElement('div');
    card.className = 'treatment-card';
    
    const statusClass = treatment.status;
    const statusText = treatment.status.charAt(0).toUpperCase() + treatment.status.slice(1);
    
    card.innerHTML = `
        <div class="treatment-header">
            <div class="treatment-info">
                <h3>${treatment.name}</h3>
                <p><i class="fas fa-user-md"></i> ${treatment.dentist}</p>
                <p><i class="fas fa-calendar"></i> ${formatDate(treatment.date)}</p>
                <p><i class="fas fa-dollar-sign"></i> $${treatment.cost}</p>
            </div>
            <div class="treatment-status ${statusClass}">${statusText}</div>
        </div>
        <div class="treatment-details">
            <p><strong>Description:</strong> ${treatment.description}</p>
            ${treatment.notes ? `<p><strong>Notes:</strong> ${treatment.notes}</p>` : ''}
            ${treatment.followUpDate ? `<p><strong>Follow-up:</strong> ${formatDate(treatment.followUpDate)}</p>` : ''}
        </div>
        <div class="treatment-actions">
            <button class="btn-secondary" onclick="viewTreatmentDetails(${treatment.id})">
                <i class="fas fa-eye"></i> View Details
            </button>
        </div>
    `;
    
    return card;
}

// Filter treatments
function filterTreatments(filter) {
    console.log('Filtering treatments:', filter);
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    // Find the button that was clicked and add active class
    const clickedButton = document.querySelector(`[onclick="filterTreatments('${filter}')"]`);
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
    
    treatmentsCurrentFilter = filter;
    displayTreatments();
}

// View treatment details
function viewTreatmentDetails(treatmentId) {
    console.log('Viewing treatment details:', treatmentId);
    
    const treatment = treatments.find(t => t.id === treatmentId);
    if (!treatment) return;
    
    const modal = document.getElementById('treatmentDetailsModal');
    const content = document.getElementById('treatmentDetailsContent');
    
    content.innerHTML = `
        <div style="padding: 25px;">
            <div class="treatment-details">
                <h4>${treatment.name}</h4>
                <p><strong>Dentist:</strong> ${treatment.dentist}</p>
                <p><strong>Date:</strong> ${formatDate(treatment.date)}</p>
                <p><strong>Status:</strong> <span class="treatment-status ${treatment.status}">${treatment.status.charAt(0).toUpperCase() + treatment.status.slice(1)}</span></p>
                <p><strong>Cost:</strong> $${treatment.cost}</p>
                <p><strong>Description:</strong> ${treatment.description}</p>
                ${treatment.notes ? `<p><strong>Notes:</strong> ${treatment.notes}</p>` : ''}
                ${treatment.followUpDate ? `<p><strong>Follow-up Date:</strong> ${formatDate(treatment.followUpDate)}</p>` : ''}
                <p><strong>Created:</strong> ${formatDateTime(treatment.createdAt)}</p>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Close modal
function closeModal(modalId) {
    console.log('Closing modal:', modalId);
    document.getElementById(modalId).style.display = 'none';
}

// Update treatments (real-time simulation)
function updateTreatments() {
    console.log('Updating treatments...');
    
    // Simulate real-time updates
    treatments.forEach(treatment => {
        if (treatment.status === 'scheduled') {
            const treatmentDate = new Date(treatment.date);
            const now = new Date();
            
            // Mark as in-progress if treatment date has passed
            if (treatmentDate < now) {
                treatment.status = 'in-progress';
            }
        }
    });
    
    updateTreatmentStats();
    displayTreatments();
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
    console.log('Treatments navigateToSection called with:', sectionId);
    
    // Dispatch a custom event to the main window
    const event = new CustomEvent('navigateToSection', { 
        detail: { sectionId: sectionId } 
    });
    window.dispatchEvent(event);
}

// Export functions for global access
window.viewTreatmentDetails = viewTreatmentDetails;
window.closeModal = closeModal;
window.filterTreatments = filterTreatments;
window.navigateToSection = navigateToSection;
})();
