-- Add sample dentist data and services
-- This script adds sample dentists and their services to the database

-- Insert sample dentists into users table
INSERT INTO users (id, name, email, phone, user_type, created_at, updated_at) VALUES
('dentist-001', 'Dr. Maria Santos', 'maria.santos@delasalas.com', '+63 912 345 6789', 'dentist', NOW(), NOW()),
('dentist-002', 'Dr. Juan Dela Cruz', 'juan.delacruz@delasalas.com', '+63 917 890 1234', 'dentist', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample services
INSERT INTO services (id, name, description, price, duration, icon, dentist_id, created_at, updated_at) VALUES
('service-001', 'Dental Cleaning', 'Professional teeth cleaning and polishing to remove plaque and tartar', 1500, '30-45 minutes', 'fa-tooth', 'dentist-001', NOW(), NOW()),
('service-002', 'Teeth Whitening', 'Professional teeth whitening treatment for a brighter smile', 5000, '60 minutes', 'fa-star', 'dentist-001', NOW(), NOW()),
('service-003', 'Dental Filling', 'Treatment for cavities using composite or amalgam fillings', 2000, '45-60 minutes', 'fa-fill-drip', 'dentist-001', NOW(), NOW()),
('service-004', 'Root Canal Treatment', 'Treatment for infected tooth pulp to save the natural tooth', 8000, '90-120 minutes', 'fa-syringe', 'dentist-001', NOW(), NOW()),
('service-005', 'Tooth Extraction', 'Safe removal of damaged or problematic teeth', 3000, '30-60 minutes', 'fa-teeth', 'dentist-001', NOW(), NOW()),
('service-006', 'Dental Checkup', 'Comprehensive oral examination and consultation', 500, '20-30 minutes', 'fa-stethoscope', 'dentist-001', NOW(), NOW()),
('service-007', 'Orthodontic Consultation', 'Evaluation for braces and teeth alignment treatment', 2000, '45 minutes', 'fa-smile', 'dentist-002', NOW(), NOW()),
('service-008', 'Dental Crown', 'Custom-made cap to restore damaged teeth', 12000, '90 minutes', 'fa-crown', 'dentist-002', NOW(), NOW()),
('service-009', 'Dental Bridge', 'Fixed replacement for missing teeth', 15000, '120 minutes', 'fa-link', 'dentist-002', NOW(), NOW()),
('service-010', 'Dental Implant', 'Permanent tooth replacement solution', 25000, '180 minutes', 'fa-anchor', 'dentist-002', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Verify the data was inserted
SELECT 'Dentists added:' as info, COUNT(*) as count FROM users WHERE user_type = 'dentist';
SELECT 'Services added:' as info, COUNT(*) as count FROM services;
