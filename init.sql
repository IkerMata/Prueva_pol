CREATE DATABASE IF NOT EXISTS room_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
 
USE room_booking;
 
CREATE TABLE IF NOT EXISTS rooms ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    name VARCHAR(100) NOT NULL, 
    capacity INT NOT NULL, 
    location VARCHAR(100) NOT NULL 
) ENGINE=InnoDB;
 
CREATE TABLE IF NOT EXISTS bookings ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    room_id INT NOT NULL, 
    reserved_by VARCHAR(100) NOT NULL, 
    start_time VARCHAR(100) NOT NULL, 
    end_time VARCHAR(100) NOT NULL, 
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE 
) ENGINE=InnoDB;

-- SEED DATA
INSERT INTO rooms (name, capacity, location) VALUES 
('Sala 101', 20, 'Planta 1'),
('Sala Informàtica', 30, 'Planta 2');

INSERT INTO bookings (room_id, reserved_by, start_time, end_time) VALUES 
(1, 'Professor X', '2025-11-30 09:00:00', '2025-11-30 11:00:00'),
(2, 'Pol Prats', '2025-12-01 10:00:00', '2025-12-01 12:00:00');
