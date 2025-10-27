// Services JavaScript
let services = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadServices();
});

// Load services data
function loadServices() {
    // Sample services data - dentists can add more
    services = [
        {
            id: 1,
            name: 'Dental Cleaning',
            description: 'Professional teeth cleaning and polishing to remove plaque and tartar',
            price: 1500,
            duration: '30-45 minutes',
            icon: 'fa-tooth'
        },
        {
            id: 2,
            name: 'Teeth Whitening',
            description: 'Professional teeth whitening treatment for a brighter smile',
            price: 5000,
            duration: '60 minutes',
            icon: 'fa-star'
        },
        {
            id: 3,
            name: 'Dental Filling',
            description: 'Treatment for cavities using composite or amalgam fillings',
            price: 2000,
            duration: '45-60 minutes',
            icon: 'fa-fill-drip'
        },
        {
            id: 4,
            name: 'Root Canal Treatment',
            description: 'Treatment for infected tooth pulp to save the natural tooth',
            price: 8000,
            duration: '90-120 minutes',
            icon: 'fa-syringe'
        },
        {
            id: 5,
            name: 'Tooth Extraction',
            description: 'Safe removal of damaged or problematic teeth',
            price: 3000,
            duration: '30-60 minutes',
            icon: 'fa-teeth'
        },
        {
            id: 6,
            name: 'Dental Checkup',
            description: 'Comprehensive oral examination and consultation',
            price: 500,
            duration: '20-30 minutes',
            icon: 'fa-stethoscope'
        }
    ];

    // Try to load additional services from localStorage
    loadFromLocalStorage();
    
    displayServices();
}

// Load additional services from localStorage (services added by dentist)
function loadFromLocalStorage() {
    try {
        const storedServices = localStorage.getItem('dentalCustomServices');
        
        if (storedServices) {
            const customServices = JSON.parse(storedServices);
            // Add custom services to the existing services
            services = [...services, ...customServices];
        }
    } catch (error) {
        console.log('No custom services found or error loading from storage');
    }
}

// Display services
function displayServices() {
    const grid = document.getElementById('servicesGrid');
    
    if (services.length === 0) {
        grid.innerHTML = `
            <div style="padding: 40px; color: #666; text-align: center; grid-column: 1 / -1;">
                <i class="fas fa-tools" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                <h3 style="margin: 0 0 10px 0;">No services added yet</h3>
                <p style="margin: 0;">Add your clinic services to get started</p>
                <button class="btn btn-primary" onclick="addNewService()" style="margin-top: 20px;">
                    <i class="fas fa-plus"></i> Add First Service
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = services.map(service => `
        <div class="service-card" onclick="viewService(${service.id})">
            <div class="service-icon">
                <i class="fas ${service.icon}"></i>
            </div>
            <div class="service-name">${service.name}</div>
            <div class="service-description">${service.description}</div>
            <div class="service-price">₱${service.price.toLocaleString()}</div>
            <div class="service-duration">
                <i class="fas fa-clock"></i>
                ${service.duration}
            </div>
            <div class="service-actions" onclick="event.stopPropagation()">
                <button class="btn btn-sm btn-info" onclick="viewService(${service.id})">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-sm btn-warning" onclick="editService(${service.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteService(${service.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Action functions
function addNewService() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>Add New Service</h2>
        <form id="serviceForm" style="padding: 20px 0;">
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Service Name:</label>
                <input type="text" id="serviceName" required style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Description:</label>
                <textarea id="serviceDescription" rows="3" required style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px;"></textarea>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Price (₱):</label>
                <input type="number" id="servicePrice" required style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Duration:</label>
                <input type="text" id="serviceDuration" placeholder="e.g., 30-45 minutes" required style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Icon:</label>
                <select id="serviceIcon" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px;">
                    <option value="fa-tooth">🦷 Tooth</option>
                    <option value="fa-star">⭐ Star</option>
                    <option value="fa-fill-drip">💧 Fill</option>
                    <option value="fa-syringe">💉 Syringe</option>
                    <option value="fa-teeth">🦷 Teeth</option>
                    <option value="fa-stethoscope">🩺 Stethoscope</option>
                    <option value="fa-heart">❤️ Heart</option>
                    <option value="fa-shield">🛡️ Shield</option>
                </select>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Add Service</button>
            </div>
        </form>
    `;
    
    document.getElementById('serviceForm').onsubmit = function(e) {
        e.preventDefault();
        
        const serviceData = {
            name: document.getElementById('serviceName').value,
            description: document.getElementById('serviceDescription').value,
            price: parseInt(document.getElementById('servicePrice').value),
            duration: document.getElementById('serviceDuration').value,
            icon: document.getElementById('serviceIcon').value
        };
        
        if (serviceData.name && serviceData.description && serviceData.price && serviceData.duration) {
            addService(serviceData);
            alert('Service added successfully!');
            closeModal();
        } else {
            alert('Please fill in all required fields.');
        }
    };
    
    document.getElementById('serviceModal').style.display = 'block';
}

// Add service function
function addService(serviceData) {
    const newService = {
        id: Date.now(), // Generate unique ID
        ...serviceData
    };
    
    services.push(newService);
    displayServices();
    
    // Save custom services to localStorage
    const customServices = services.filter(s => s.id > 6); // Only save custom services (id > 6)
    localStorage.setItem('dentalCustomServices', JSON.stringify(customServices));
    
    return newService;
}

function viewService(id) {
    const service = services.find(s => s.id === id);
    if (service) {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2>Service Details</h2>
            <div style="padding: 20px 0;">
                <div class="service-icon" style="margin: 0 auto 20px;">
                    <i class="fas ${service.icon}"></i>
                </div>
                <h3 style="text-align: center; margin-bottom: 10px;">${service.name}</h3>
                <p style="text-align: center; color: #666; margin-bottom: 20px;">${service.description}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                    <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                        <strong style="display: block; color: #666; margin-bottom: 5px;">Price</strong>
                        <span style="font-size: 24px; font-weight: 700; color: #667eea;">₱${service.price.toLocaleString()}</span>
                    </div>
                    <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                        <strong style="display: block; color: #666; margin-bottom: 5px;">Duration</strong>
                        <span style="font-size: 16px; font-weight: 600; color: #2c3e50;">${service.duration}</span>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('serviceModal').style.display = 'block';
    }
}

function editService(id) {
    const service = services.find(s => s.id === id);
    if (service) {
        // Only allow editing of custom services (id > 6)
        if (id > 6) {
            const modalBody = document.getElementById('modalBody');
            modalBody.innerHTML = `
                <h2>Edit Service</h2>
                <form id="editServiceForm" style="padding: 20px 0;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Service Name:</label>
                        <input type="text" id="editServiceName" value="${service.name}" required style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Description:</label>
                        <textarea id="editServiceDescription" rows="3" required style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px;">${service.description}</textarea>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Price (₱):</label>
                        <input type="number" id="editServicePrice" value="${service.price}" required style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Duration:</label>
                        <input type="text" id="editServiceDuration" value="${service.duration}" required style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px;">
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Update Service</button>
                    </div>
                </form>
            `;
            
            document.getElementById('editServiceForm').onsubmit = function(e) {
                e.preventDefault();
                
                service.name = document.getElementById('editServiceName').value;
                service.description = document.getElementById('editServiceDescription').value;
                service.price = parseInt(document.getElementById('editServicePrice').value);
                service.duration = document.getElementById('editServiceDuration').value;
                
                displayServices();
                
                // Update localStorage
                const customServices = services.filter(s => s.id > 6);
                localStorage.setItem('dentalCustomServices', JSON.stringify(customServices));
                
                alert('Service updated successfully!');
                closeModal();
            };
            
            document.getElementById('serviceModal').style.display = 'block';
        } else {
            alert('Cannot edit default services. You can only edit services you added.');
        }
    }
}

function deleteService(id) {
    const service = services.find(s => s.id === id);
    if (service && confirm(`Delete service "${service.name}"?`)) {
        // Only allow deletion of custom services (id > 6)
        if (id > 6) {
            services = services.filter(s => s.id !== id);
            displayServices();
            
            // Update localStorage
            const customServices = services.filter(s => s.id > 6);
            localStorage.setItem('dentalCustomServices', JSON.stringify(customServices));
            
            alert('Service deleted successfully.');
        } else {
            alert('Cannot delete default services. You can only delete services you added.');
        }
    }
}

function closeModal() {
    document.getElementById('serviceModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('serviceModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Real-time updates (replace with your actual real-time implementation)
// This function will be called when service updates arrive from your backend
function updateServicesData(newServices) {
    services = newServices;
    displayServices();
}

// Example function to add new service
function addNewService(serviceData) {
    const newService = {
        id: Date.now(), // Generate unique ID
        ...serviceData,
        icon: serviceData.icon || 'fa-tooth' // Default icon
    };
    
    services.push(newService);
    displayServices();
    
    // Save to localStorage (replace with your backend save)
    localStorage.setItem('dentalServices', JSON.stringify(services));
    
    return newService;
}

// Example function to update service
function updateService(serviceId, updatedData) {
    const service = services.find(s => s.id === serviceId);
    if (service) {
        Object.assign(service, updatedData);
        displayServices();
        
        // Save to localStorage (replace with your backend save)
        localStorage.setItem('dentalServices', JSON.stringify(services));
    }
}

