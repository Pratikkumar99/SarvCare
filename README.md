# SarvCare - Healthcare Management System

A full-stack healthcare web application with AI-powered prior authorization for managing patient records, prescriptions, insurance claims, and doctor summary reports.

## 🚀 Features

- **Unified Patient Records** - Centralized patient information and medical history
- **AI-based Prior Authorization** - Mock AI logic for automated claim approval/rejection
- **Doctor Summary Reports** - Generate and view comprehensive patient summaries
- **Role-based Dashboards** - Separate views for Patients, Doctors, Insurance, and Admin

## 🛠 Tech Stack

**Frontend:**
- React.js with functional components and hooks
- React Router for navigation
- Axios for API calls
- Bootstrap 5 for styling

**Backend:**
- Node.js with Express.js
- PostgreSQL database
- RESTful API architecture
- CORS enabled

**Database:**
- PostgreSQL with relational schema
- Tables: users, patients, prescriptions, claims, summaries

## 📁 Project Structure

```
SarvCare/
├── backend/
│   ├── controllers/
│   │   ├── patientController.js
│   │   ├── doctorController.js
│   │   └── insuranceController.js
│   ├── models/
│   │   └── db.js
│   ├── routes/
│   │   ├── patientRoutes.js
│   │   ├── doctorRoutes.js
│   │   └── insuranceRoutes.js
│   ├── scripts/
│   │   └── initDb.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Sidebar.js
│   │   │   ├── PatientCard.js
│   │   │   ├── ClaimCard.js
│   │   │   └── SummaryCard.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── PatientDashboard.js
│   │   │   ├── DoctorDashboard.js
│   │   │   ├── InsuranceDashboard.js
│   │   │   ├── AdminDashboard.js
│   │   │   └── SummaryPage.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd SarvCare/backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure database connection in `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sarvcare
DB_USER=postgres
DB_PASSWORD=your_password
```

4. Initialize the database:
```bash
npm run init-db
```

5. Start the server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd SarvCare/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## 🔐 Demo Accounts

Use these credentials to test different roles:

| Email | Password | Role |
|-------|----------|------|
| john@example.com | password | Patient |
| sarah@example.com | password | Doctor |
| mike@insurance.com | password | Insurance |
| admin@sarvcare.com | password | Admin |

## 🔌 API Endpoints

### Patient APIs
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `GET /api/patients/summary/:patientId` - Get patient summary

### Doctor APIs
- `GET /api/doctor/patients` - Get all patients
- `POST /api/doctor/prescriptions` - Create prescription
- `GET /api/doctor/prescriptions/:doctorId` - Get doctor's prescriptions
- `POST /api/doctor/summaries` - Create patient summary

### Insurance APIs
- `GET /api/insurance/claims` - Get all claims
- `GET /api/insurance/claims/status/:status` - Get claims by status
- `POST /api/insurance/claims` - Create new claim (with AI analysis)
- `PUT /api/insurance/claims/:id` - Update claim status
- `GET /api/insurance/claims/:id/analysis` - Get AI analysis for claim
- `GET /api/insurance/stats/claims` - Get claim statistics

## 🤖 AI Prior Authorization Logic

The mock AI uses rule-based logic:

1. **Auto-Approve** - Chronic condition + preventive care routine
2. **Flag** - High-cost procedures without chronic condition history
3. **Auto-Approve** - Low-cost (<$500) preventive care
4. **Manual Review** - Insufficient data or cost > $1000

## 📊 Database Schema

### Users Table
- id (PK), name, email, password, role, created_at

### Patients Table
- id (PK), user_id (FK), age, gender, history, created_at

### Prescriptions Table
- id (PK), patient_id (FK), doctor_id (FK), medication, dosage, notes, created_at

### Claims Table
- id (PK), patient_id (FK), treatment, description, cost, status, ai_recommendation, created_at, updated_at

### Summaries Table
- id (PK), patient_id (FK), summary_text, generated_by (FK), created_at

## 📝 License

MIT License - feel free to use for your hackathon or learning purposes!

## 🏆 Hackathon Tips

- Focus on the core features: Patient records, Claims approval, Summary screen
- The AI logic is simplified for demo purposes
- All passwords are "password" for easy testing
- Sample data is auto-inserted when initializing the database
