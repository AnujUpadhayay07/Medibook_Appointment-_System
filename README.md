<div align="center">

# 🏥 MediBook — Doctor Patient Appointment System

**Smart Healthcare Platform · Role-Based Access Control · Secure Booking System · Scalable Full-Stack Architecture**

![MIT License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-orange?style=flat-square)
![Express](https://img.shields.io/badge/Express.js-API-000000?style=flat-square&logo=express)

[🌐 Live Demo](https://medibook-appointment.netlify.app/) · [📖 API Reference](#-api-endpoints) · [🚀 Getting Started](#-getting-started)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Secure login/register using JWT tokens |
| 🧑‍⚕️ **Role-Based System** | Separate dashboards for Admin, Doctor, Patient |
| 📅 **Appointment Booking** | Patients can book doctor appointments |
| 🩺 **Doctor Panel** | Manage availability and schedules |
| 🛠️ **Admin Panel** | Manage users and full system control |
| 🔄 **REST API Integration** | Clean frontend–backend communication |
| 📊 **Dashboard System** | Role-based UI experience |
| 📱 **Responsive Design** | Works across all screen sizes |

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────┐
│          Frontend  (React.js · Netlify)       │
│   Components → Pages → Context → App.js      │
└─────────────────────┬────────────────────────┘
                      │  HTTP Requests
                      ▼
┌──────────────────────────────────────────────┐
│       REST API Layer  (Node.js · Express)     │
│   Routes → Controllers → Business Logic      │
└─────────────────────┬────────────────────────┘
                      │  Token Verification
                      ▼
┌──────────────────────────────────────────────┐
│      Auth Middleware  (JWT · RBAC)            │
│   Verify Token → Decode Role → Guard Route   │
└─────────────────────┬────────────────────────┘
                      │  Queries
                      ▼
┌──────────────────────────────────────────────┐
│        Database  (MongoDB Atlas)              │
│   Users · Appointments · Schedules           │
└──────────────────────────────────────────────┘
```

**How it works:**
- React sends HTTP requests to Express API endpoints
- JWT middleware validates every protected route before processing
- RBAC determines what each role (Admin / Doctor / Patient) can read or modify
- MongoDB Atlas stores all users, appointments, and schedule data
- Fully modular — each layer is independently testable and horizontally scalable

---

## 📸 Screenshots

| Page | Preview |
|---|---|
| 🏠 Home page | <img width="1919" height="968" alt="image" src="https://github.com/user-attachments/assets/8a83b6c4-accf-4e6d-82b5-a37e41bac1a5" />|
| 🔑 Login page | <img width="1865" height="968" alt="image" src="https://github.com/user-attachments/assets/cf9089fc-a3ef-4b0c-88ae-7f09c72a3d1d" />|
| 👤 Patient dashboard | <img width="1850" height="968" alt="image" src="https://github.com/user-attachments/assets/8871f958-d42d-46c8-bd5c-86111a2716ea" />|
| 👨‍⚕️ Doctor dashboard | <img width="1858" height="965" alt="image" src="https://github.com/user-attachments/assets/54df63f3-af08-4d33-93f3-d3743b0b3c61" />|
| 🛠️ Admin dashboard | <img width="1918" height="976" alt="image" src="https://github.com/user-attachments/assets/5ccda8f2-fdf2-461b-ab2e-66763bc8d82e" />|

---

## 🗂️ Project Structure

```
MediBook/
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level page components
│   │   ├── context/          # Auth & global state
│   │   └── App.js
│   └── package.json
│
├── backend/
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express route handlers
│   ├── controllers/          # Business logic
│   ├── middleware/           # JWT auth middleware
│   └── server.js
│
├── config/
├── .env.example
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology | Role |
|---|---|---|
| **Frontend** | React.js | Client UI |
| **Backend** | Node.js + Express.js | API & routing |
| **Database** | MongoDB Atlas |
| **Authentication** | JWT | Stateless auth |
| **Access Control** | RBAC | Role enforcement |
| **Deployment** | Netlify Render| Frontend Backend hosting |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- MongoDB Atlas account
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/medibook.git
cd medibook

# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd ../frontend && npm install
```

### Environment Variables

Create a `.env` file in `/backend`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret_key
```

### Run the App

```bash
# Start backend (from /backend)
npm run dev

# Start frontend (from /frontend)
npm start
```

---

## 🔌 API Endpoints

### Auth

```
POST   /api/auth/register     →  Create new account
POST   /api/auth/login        →  Get JWT token
```

### Appointments

```
GET    /api/appointments       →  List all appointments
POST   /api/appointments       →  Book a new appointment
PUT    /api/appointments/:id   →  Update an appointment
DELETE /api/appointments/:id   →  Cancel an appointment
```

---

## 🚀 Key Highlights

- ✅ Secure authentication using JWT tokens
- ✅ Role-based dashboards — Admin / Doctor / Patient
- ✅ Modular REST API architecture
- ✅ Horizontally scalable full-stack design
- ✅ Real-world healthcare workflow simulation
- ✅ Production-ready deployment setup

---

## 🤝 Contributing

Contributions are welcome! Open an issue first to discuss your change.

```bash
git checkout -b feature/your-feature-name
# make changes → commit → push → open PR
```

---

## 👨‍💻 Author

**Anuj Upadhayay**

- 🐙 GitHub: [@AnujUpadhayay07](https://github.com/AnujUpadhayay07)
- 💼 LinkedIn: [Anuj Upadhayay](https://www.linkedin.com/in/anuj-upadhayay-832695312/)

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

Built with care · Full-stack healthcare system · Production-ready architecture

⭐ **Star this repo if you found it useful!**

</div>
