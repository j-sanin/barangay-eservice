# Barangay E-Service System

A full-stack web application that lets barangay residents request official documents online — and gives administrators a complete dashboard to manage, approve, reject, and track every request. No more lines at the barangay hall.

---

## Live Demo

| | Link |

|  Frontend    | [https://barangay-eservice.onrender.com](https://barangay-eservice.onrender.com)         |
|  Backend API | [https://barangay-eservice-api.onrender.com](https://barangay-eservice-api.onrender.com) |

---

## Features

**For Residents**
- Register and log in securely with JWT authentication
- Submit requests for 12 types of barangay documents
- Real-time dashboard with Pending, Approved, and Completed status cards
- Track full request history and pickup dates
- View and update profile information

**For Admins**
- Secure admin login with role-based access control
- View all resident requests in one dashboard
- Approve, reject (with reason), or mark requests as completed
- Delete closed records to keep the dashboard clean
- Live stats: total pending, approved, completed, and rejected counts

**System**
- JWT authentication with protected routes
- Role-based access: resident vs admin
- In-memory caching for fast admin data loading
- Responsive layout for mobile and desktop
- Custom confirmation modals and toast notifications

---

## Tech Stack

| Layer     | Technology                                   |

| Frontend  | HTML5, CSS3, Bootstrap 5, Vanilla JavaScript |
| Backend   | Node.js, Express.js                          |
| Database  | MongoDB Atlas (Mongoose)                     |
| Auth      | JSON Web Tokens (JWT), bcryptjs              |
| Caching   | node-cache                                   |
| Hosting   | Render (API + Static)                        |
| Dev Tools | Nodemon, dotenv, VS Code                     |

---

## Project Structure

```
Barangay E-Service/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register & login
│   │   ├── userController.js      # Profile management
│   │   └── requestController.js   # Full CRUD for requests
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT protect + adminOnly
│   │   ├── errorMiddleware.js     # Global error handler
│   │   └── logger.js              # Request timer logging
│   ├── models/
│   │   ├── User.js                # User schema
│   │   └── Request.js             # Request schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── requestRoutes.js
│   ├── utils/
│   │   └── cache.js               # node-cache instance
│   ├── .env                       # Environment variables (not committed)
│   ├── package.json
│   ├── render.yaml
│   └── server.js
│
└── frontend/
    ├── css/                       # Page-specific stylesheets
    ├── img/                       # Images and logo
    ├── js/
    │   ├── auth.js                # Auth helpers + session check
    │   ├── dashboard.js           # All dashboard + admin logic
    │   ├── profile.js             # Profile editor
    │   └── register.js            # Registration form
    ├── index.html                 # Public landing page
    ├── login.html
    ├── register.html
    ├── homepage.html              # Logged-in home
    ├── dashboard.html             # Resident dashboard
    ├── track.html                 # Request tracking
    ├── documents.html             # Document request form
    ├── profile.html               # Profile editor
    ├── admin-login.html
    └── admin-dashboard.html       # Admin control panel
```

---

## Local Setup

### Prerequisites
- Node.js v18 or higher
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

### 1 — Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/barangay-eservice.git
cd barangay-eservice
```

### 2 — Set up the backend
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret_key
```


Start the backend:
```bash
npm run dev
```

Expected output:
```
Server running on port 5000
MongoDB Connected: cluster0.xxxxx.mongodb.net
```

### 3 — Run the frontend
```bash
cd ../frontend
npx serve .
```

Open [http://localhost:3000](http://localhost:3000) in your browser.


## Creating an Admin Account

Open your browser console on any page and run this **once**:

```javascript
fetch('https://barangay-eservice-api.onrender.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Admin',
    email: 'admin@barangay.com',
    password: 'Admin@1234',
    role: 'admin'
  })
}).then(r => r.json()).then(console.log);
```


## API Reference

| Method | Endpoint              | Access   | Description                  |

| POST | `/api/auth/register`    | Public   | Register a new user          |
| POST | `/api/auth/login`       | Public   | Login and receive token      |
| GET | `/api/users/profile`     | Resident | Get own profile              |
| PUT | `/api/users/profile`     | Resident | Update own profile           |
| POST | `/api/requests`         | Resident | Submit a document request    |
| GET | `/api/requests/mine`     | Resident | View own requests            |
| GET | `/api/requests`          | Admin    | View all requests            |
| PUT | `/api/requests/:id`      |Admin     | Approve, reject, or complete |
| DELETE | `/api/requests/:id`   | Admin    | Permanently delete a request |

---

## Supported Document Types

1. Barangay Clearance
2. Certificate of Residency
3. Certificate of Indigency
4. Business Permit
5. Barangay ID
6. Community Tax Certificate (Cedula)
7. Certificate of Good Moral Character
8. Facade Permit
9. Blotter Clearance
10. Certificate of Death
11. Marriage Contract Verification
12. Transfer of Residency

---

## Deployment (Render)


| Key | Value |

| `MONGO_URI` |MONGO_URI=mongodb://mongo:tglEcMMNeUiyryfVKgDsbUMsJOSlXNVE@trolley.proxy.rlwy.net:59050  |
| `JWT_SECRET` | |


---

## Contributors

| Name                   | Role                          |

| Harvae Alecks Roperez  | Project Lead/Database Manager |
| Klarizze C. Ballaran   | Frontend Developer            |
| Janin Sanin            | Database Manager              |
| Ana Joy B. Matias      | GitHub Manager                |
| Jacinth D. Caigas      | Backend Developer             |

---

## Screenshots



---

## License


