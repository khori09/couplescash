const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://khorigome.cloudhost.com', 'https://couplescash.org', 'http://couplescash.org']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'couplescash',
  password: 'cc_secure_2024',
  database: 'couplescash',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CouplesCash API is running' });
});

// Submit waitlist entry
app.post('/api/waitlist', async (req, res) => {
  const { yourName, yourPhone, partnerName, partnerPhone } = req.body;
  
  // Basic validation
  if (!yourName || !yourPhone || !partnerName || !partnerPhone) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required' 
    });
  }
  
  // Phone number validation (basic)
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phoneRegex.test(yourPhone) || !phoneRegex.test(partnerPhone)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid phone number format' 
    });
  }
  
  try {
    // Get client IP
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    
    // Insert into database
    const [result] = await pool.execute(
      'INSERT INTO waitlist (your_name, your_phone, partner_name, partner_phone, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
      [yourName, yourPhone, partnerName, partnerPhone, ip, userAgent]
    );
    
    console.log(`New waitlist entry: ${yourName} & ${partnerName} (ID: ${result.insertId})`);
    
    res.json({ 
      success: true, 
      message: 'Successfully added to waitlist',
      position: result.insertId // Can use this to show their position in line
    });
  } catch (error) {
    console.error('Database error:', error);
    
    // Check for duplicate entry (if we add unique constraints later)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: 'This phone number is already on the waitlist' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred. Please try again.' 
    });
  }
});

// Get waitlist stats (admin endpoint - should be protected in production)
app.get('/api/waitlist/stats', async (req, res) => {
  try {
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM waitlist');
    const [recentResult] = await pool.execute(
      'SELECT your_name, partner_name, created_at FROM waitlist ORDER BY created_at DESC LIMIT 5'
    );
    
    res.json({
      total: countResult[0].total,
      recent: recentResult
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred fetching stats' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`CouplesCash backend server running on port ${PORT}`);
  console.log(`CORS enabled for production domains`);
});