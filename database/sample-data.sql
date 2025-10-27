-- Sample data for testing
-- Run this AFTER creating the tables with database-schema.sql

-- Insert sample users (patients and dentists)
-- Note: These will be linked to actual auth users when they register

-- Sample dentist
INSERT INTO users (id, name, email, phone, user_type) VALUES
('11111111-1111-1111-1111-111111111111', 'Dr. Maria Santos', 'dr.santos@delasalas.com', '+63-912-345-6789', 'dentist');

-- Sample patients
INSERT INTO users (id, name, email, phone, user_type) VALUES
('22222222-2222-2222-2222-222222222222', 'Juan Dela Cruz', 'juan.delacruz@email.com', '+63-917-123-4567', 'patient'),
('33333333-3333-3333-3333-333333333333', 'Maria Garcia', 'maria.garcia@email.com', '+63-918-234-5678', 'patient'),
('44444444-4444-4444-4444-444444444444', 'Pedro Rodriguez', 'pedro.rodriguez@email.com', '+63-919-345-6789', 'patient');

-- Sample appointments
INSERT INTO appointments (patient_id, dentist_id, service_type, appointment_date, appointment_time, duration, notes, patient_name, patient_email, patient_phone, status) VALUES
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'general', '2024-01-15', '09:00:00', 60, 'Regular checkup and cleaning', 'Juan Dela Cruz', 'juan.delacruz@email.com', '+63-917-123-4567', 'confirmed'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'cosmetic', '2024-01-16', '14:00:00', 90, 'Teeth whitening consultation', 'Maria Garcia', 'maria.garcia@email.com', '+63-918-234-5678', 'pending'),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'restorative', '2024-01-17', '10:30:00', 120, 'Dental filling procedure', 'Pedro Rodriguez', 'pedro.rodriguez@email.com', '+63-919-345-6789', 'confirmed');

-- Sample treatments
INSERT INTO treatments (patient_id, dentist_id, appointment_id, treatment_type, description, teeth_involved, cost, status) VALUES
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 
 (SELECT id FROM appointments WHERE patient_id = '22222222-2222-2222-2222-222222222222' LIMIT 1),
 'cleaning', 'Professional dental cleaning and examination', 
 '{"teeth": ["11", "12", "13", "14", "15", "16", "17", "18"]}', 1500.00, 'completed'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
 (SELECT id FROM appointments WHERE patient_id = '33333333-3333-3333-3333-333333333333' LIMIT 1),
 'whitening', 'Teeth whitening treatment', 
 '{"teeth": ["11", "12", "13", "14", "15", "16", "17", "18", "21", "22", "23", "24", "25", "26", "27", "28"]}', 5000.00, 'planned'),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111',
 (SELECT id FROM appointments WHERE patient_id = '44444444-4444-4444-4444-444444444444' LIMIT 1),
 'filling', 'Composite filling for tooth decay', 
 '{"teeth": ["16"], "material": "composite", "size": "medium"}', 2500.00, 'in_progress');

-- Sample messages
INSERT INTO messages (sender_id, receiver_id, subject, message, is_read) VALUES
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 
 'Appointment Reminder', 'Your appointment is scheduled for tomorrow at 9:00 AM. Please arrive 15 minutes early.', false),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 
 'Question about Treatment', 'Hi Dr. Santos, I have a question about the cleaning procedure. Will it be painful?', false),
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 
 'Treatment Plan', 'Based on your consultation, I recommend the whitening treatment. Please let me know if you have any questions.', true);


