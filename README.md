# CouplesCash

The debit card & app for couples - helping partners manage money together.

## Overview

CouplesCash is a financial platform designed specifically for couples to manage their finances together. It provides joint accounts, dual approval features, and spending insights to help couples build healthy financial habits.

## Features

- 💳 **Two Debit Cards**: Each partner gets their own card linked to the joint account
- ✅ **Dual Approval**: Set spending limits that require both partners to approve
- 🎯 **Savings Goals**: Set and track financial goals together
- 📊 **Spending Insights**: Automatic categorization and monthly reports
- 💰 **4.5% APY**: Competitive interest rate on savings
- 🔒 **FDIC Insured**: Funds protected up to $500,000

## Project Structure

```
couplescash.org/
├── public/                 # Frontend files
│   ├── index.html         # Main landing page
│   └── couplescash-thanks.html  # Thank you page after signup
├── backend/               # Node.js backend
│   ├── server.js         # Express server
│   ├── package.json      # Dependencies
│   └── .env             # Environment variables (not in git)
└── README.md
```

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express
- **Database**: MySQL
- **Server**: Apache2 with mod_proxy
- **Process Manager**: PM2

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- MySQL Server
- Apache2 with mod_proxy enabled
- PM2 (for process management)

### Database Setup

1. Create MySQL database and user:
```sql
CREATE DATABASE couplescash;
CREATE USER 'couplescash'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON couplescash.* TO 'couplescash'@'localhost';
```

2. Create waitlist table:
```sql
CREATE TABLE waitlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    your_name VARCHAR(255) NOT NULL,
    your_phone VARCHAR(20) NOT NULL,
    partner_name VARCHAR(255) NOT NULL,
    partner_phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    INDEX idx_created (created_at),
    INDEX idx_phones (your_phone, partner_phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Backend Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file:
```
PORT=3001
DB_HOST=localhost
DB_USER=couplescash
DB_PASSWORD=your_password
DB_NAME=couplescash
```

3. Start server with PM2:
```bash
pm2 start server.js --name couplescash-api
```

### Apache Configuration

Configure Apache to proxy API requests:

```apache
ProxyPreserveHost On
ProxyPass /api http://localhost:3001/api
ProxyPassReverse /api http://localhost:3001/api
```

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /api/waitlist` - Submit waitlist signup
  - Body: `{ yourName, yourPhone, partnerName, partnerPhone }`
- `GET /api/waitlist/stats` - Get waitlist statistics (admin)

## Deployment

The application is deployed at:
- Main site: https://couplescash.org
- Mirror: https://khorigome.cloudhost.com/couplescash.html

## Security

- All API requests use HTTPS in production
- Input validation on both frontend and backend
- SQL injection prevention through parameterized queries
- CORS configured for production domains only

## License

© 2024 CouplesCash Inc. All rights reserved.