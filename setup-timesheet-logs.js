const { query } = require('./src/config/database');

async function setupTimesheetLogsTable() {
  try {
    console.log('🔧 Setting up timesheet_logs table...');
    
    const createTableSQL = `
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
      )
    `;
    
    await query(createTableSQL);
    console.log('✅ timesheet_logs table created successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up timesheet_logs table:', error);
    process.exit(1);
  }
}

setupTimesheetLogsTable();