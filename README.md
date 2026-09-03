# ⚡ EventPulse — Event Registration System
> **CodeAlpha Internship — Task 2: Event Registration System**

A modern full-stack web application for discovering events, booking registrations with real-time seat tracking, and providing an organizer dashboard for event management. Built with **Node.js**, **Express.js**, **MongoDB (Mongoose)**, and a modern glassmorphic responsive front-end.

---

## 🌟 Key Features

### 👤 Authentication & Role-Based Access Control
- **JWT & HTTP-Only Cookie Authentication**: Secure sign-up and sign-in.
- **Dual User Roles**:
  - `user` (Attendee): Browse events, register for events, view ticket details, and cancel bookings.
  - `organizer` (or `admin`): Publish new events, manage existing events, and view attendee lists.

### 🎫 Event Discovery & Browsing
- **Live Search & Category Filtering**: Filter events by category (*Technology, Design, Business, Music, Sports, Workshop*) or search by title and location.
- **Dynamic Sorting**: Sort by upcoming dates or ticket prices (Free / Paid).
- **Seat Capacity Tracking**: Visual progress bars displaying real-time booking percentages and remaining seats.
- **Sold Out Safeguards**: Automatically prevents overbooking when total capacity is reached.

### 🎟 Registration & Ticket Management
- **One-Click Registration**: Attendees can register with optional notes/dietary requirements.
- **Unique Ticket Code Generation**: Automatically generates a unique ticket ID (e.g. `TKT-8F3A29`) for every confirmed registration.
- **Duplicate Prevention**: Compound database index ensures users cannot register twice for the same event.
- **Ticket Cancellation & Seat Release**: Attendees can cancel registrations from their dashboard; the system instantly frees up the seat back to the pool.

### 📊 Organizer Hub
- Dedicated dashboard for event organizers to create, publish, and delete events.
- Real-time display of registered attendees count vs. total capacity.

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM (v9)
- **Security & Utilities**: `bcryptjs` (password hashing), `jsonwebtoken` (JWT auth), `cookie-parser`, `cors`, `dotenv`
- **Frontend**: Vanilla JavaScript (SPA architecture), Modern CSS (Dark Theme, Glassmorphism, CSS Variables, Responsive Grid), Google Fonts (*Plus Jakarta Sans*)

---

## 📁 Project Structure

```text
CodeAlpha_Event-Registration-System/
├── public/                       # Static Frontend Assets
│   ├── css/
│   │   └── styles.css            # Dark glassmorphic design system
│   ├── js/
│   │   └── app.js                # Client logic, state & API fetch calls
│   └── index.html                # Single-page interface (Catalog, Tickets, Organizer)
├── src/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection logic
│   │   └── seeder.js             # Initial database seeding script
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, logout, me
│   │   ├── eventController.js    # Event CRUD, search & filtering
│   │   └── regController.js      # Booking, cancellation, attendee lists
│   ├── middlewares/
│   │   ├── authMiddleware.js     # JWT token verification & role check
│   │   └── errorHandler.js       # Centralized error handler
│   ├── models/
│   │   ├── User.js               # User schema & password hashing
│   │   ├── Event.js              # Event schema, capacity & virtuals
│   │   └── Registration.js       # Ticket schema & unique ticket code
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   ├── eventRoutes.js        # /api/events endpoints
│   │   └── regRoutes.js          # /api/registrations endpoints
│   └── app.js                    # Express application setup
├── .env.example                  # Template for environment variables
├── .gitignore                    # Git ignore file
├── package.json                  # Dependencies & npm scripts
├── server.js                     # Server entry point
└── README.md                     # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) installed locally or a [MongoDB Atlas](https://www.mongodb.com/atlas) cloud database URI.

### 2. Clone the Repository
```bash
git clone https://github.com/Elcanzxc/CodeAlpha_Event-Registration-System.git
cd CodeAlpha_Event-Registration-System
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/event_registration_db
JWT_SECRET=your_super_secret_jwt_key_here_2026
NODE_ENV=development
```

### 5. Seed the Database (Demo Data)
Populate the database with sample users and realistic events:
```bash
npm run seed
```
*(To wipe the database later, you can run `npm run seed:destroy`)*

### 6. Start the Server
For development with automatic restarts:
```bash
npm run dev
```
For standard production start:
```bash
npm start
```

Open your browser and navigate to:
👉 **`http://localhost:5000`**

---

## 🔑 Demo Accounts

Use these pre-configured credentials created by the seed script:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Organizer** | `organizer@eventpulse.com` | `password123` | Create events, view organizer dashboard, delete events |
| **Attendee** | `user@eventpulse.com` | `password123` | Register for events, view tickets, cancel bookings |

*(You can also register a new account anytime via the **Sign Up** button on the UI).*

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user (`user` or `organizer`) |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT cookie/token |
| `GET` | `/api/auth/me` | Private | Get currently logged-in user details |
| `GET` | `/api/auth/logout` | Public | Clear authentication cookie |

### Events (`/api/events`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Public | List all events (supports `?category=`, `?search=`, `?sort=`) |
| `GET` | `/api/events/:id` | Public | Get single event details by ID |
| `GET` | `/api/events/my/created` | Private (Organizer) | Get events created by logged-in organizer |
| `POST` | `/api/events` | Private (Organizer) | Create a new event |
| `PUT` | `/api/events/:id` | Private (Organizer) | Update existing event |
| `DELETE` | `/api/events/:id` | Private (Organizer) | Delete event & cancel its registrations |

### Registrations (`/api/registrations`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/registrations` | Private | Register for an event (verifies capacity & duplicates) |
| `GET` | `/api/registrations/my` | Private | Get all registrations for logged-in user |
| `PUT` | `/api/registrations/:id/cancel` | Private | Cancel ticket & release seat back to event |
| `GET` | `/api/registrations/event/:eventId`| Private (Organizer)| View list of confirmed attendees for an event |

---

## 📝 License
This project was developed as part of the **CodeAlpha Internship Program (Task 2: Event Registration System)**.
