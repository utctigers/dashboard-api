-- Create timesheet_logs table for employee login/logout tracking
CREATE TABLE IF NOT EXISTS timesheet_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  login_time DATETIME NOT NULL,
  logout_time DATETIME NULL,
  login_latitude DECIMAL(10, 8) NULL,
  login_longitude DECIMAL(11, 8) NULL,
  logout_latitude DECIMAL(10, 8) NULL,
  logout_longitude DECIMAL(11, 8) NULL,
  phone_type VARCHAR(50) NULL,
  phone_number VARCHAR(20) NULL,
  status ENUM('logged_in', 'logged_out') DEFAULT 'logged_in',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);