<!-- Professional Header with Badges -->
<p align="center">
  <img src="./mobile/assets/logo.png" width="160" height="160" alt="Drop Logo">
</p>

<h1 align="center">Drop - Modern College Management System</h1>

<p align="center">
  <i>A unified, real-time ecosystem connecting students, teachers, and administrators.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-production-success?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-orange?style=for-the-badge" alt="PRs Welcome">
</p>

<p align="center">
  <a href="https://transformers-nu.vercel.app/"><strong>Live Web App</strong></a> |
  <a href="#mobile-app"><strong>Mobile Expo</strong></a> |
  <a href="https://github.com/aryansondharva/College-Sys/issues"><strong>Report Bug</strong></a>
</p>

---

## Overview

**Drop** is a high-fidelity, minimalist educational management platform conceptualized for modern digital-native institutions. It transforms standard academic administrative tasks into streamlined digital workflows, integrating high-performance real-time features across Web and Mobile platforms.

Our mission is to replace legacy, fragmented systems with a **unified, real-time portal** where attendance, academic tracking, and administrative oversight live in harmony.

### Why Drop?
- **Seamless Portability**: Mobile-first approach for student notifications and dashboard access.
- **Data Integrity**: Powered by **Supabase PostgreSQL** for robust, secure, and scalable storage.
- **Instant Awareness**: Leveraging **Socket.io** for real-time attendance alerts and task status.
- **Enterprise-ready UI**: A minimalist "Signature Dark" aesthetic designed for focus and utility.

---

## Features by Role

### Student Experience
- **Smart Tracker**: Real-time attendance monitoring with visual target indicators (75% threshold).
- **Core Portal**: Centralized access to syllabus, timetables, and digital course resources.
- **Instant Sync**: Real-time push notifications for attendance marks and deadline reminders.
- **Mobile Companion**: Full-featured React Native app for on-the-go academic management.

### Faculty Suite
- **Dynamic Roll-Call**: Optimized attendance marking with enrollment-sorted lists.
- **Performance Grading**: Unified interface to manage student marks and academic records.
- **Task Orchestrator**: Simple assignment creation, collection tracking, and digital evaluations.
- **Faculty Dashboard**: Overview of class performance and upcoming schedules.

### Admin Control Center
- **Institutional Scale**: Full management of sessions, courses, classes, sections, and subjects.
- **User Lifecycle**: Complete control over student/teacher enrollment and permission levels.
- **Analytics Engine**: Real-time visual summaries for attendance patterns and institutional activity.
- **System Integrity**: Backend health-check monitoring and granular database synchronization.

---

## Technology Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend/Web** | ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-Modern-646CFF?logo=vite) | High-performance SPA with modern React patterns |
| **Mobile** | ![React Native](https://img.shields.io/badge/React_Native-Expo-61DAFB?logo=react&logoColor=white) | Cross-platform student application through Expo |
| **Backend** | ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-Fastify-000000?logo=express&logoColor=white) | RESTful API architecture with secure authentication |
| **Realtime** | ![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?logo=socket.io) | Low-latency event driven communication system |
| **Database** | ![PostgreSQL](https://img.shields.io/badge/Supabase-PostgreSQL-336791?logo=supabase) | Cloud-native, pooled database with Supavisor |
| **Styling** | ![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&logoColor=white) | Clean, responsive and professional layout system |

---

## Project Structure

```text
college-management/
├── client/                 # React + Vite Web Application
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── pages/          # Page Views
│   │   ├── context/        # State Management
│   │   └── api/            # API Client Configuration
├── server/                 # Node.js + Express API
│   ├── src/
│   │   ├── routes/         # API Route Definitions
│   │   ├── controllers/    # Request Handlers
│   │   ├── models/         # DB Schemas/Helpers
│   │   └── middleware/     # Auth & Security Logic
├── mobile/                 # React Native + Expo Application
│   ├── src/
│   │   ├── screen/         # Mobile Screens
│   │   ├── navigation/     # App Routing
│   │   └── api/            # Mobile API Configuration
└── config/                 # Shared Deployment & Environment Config
```

---

## System Architecture

The following diagram illustrates the data flow and communication between the system components:

```mermaid
graph LR
    %% Define Styles
    classDef client fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#01579b;
    classDef server fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#e65100;
    classDef database fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#1b5e20;
    classDef realtime fill:#fce4ec,stroke:#880e4f,stroke-width:2px,color:#880e4f;

    subgraph "Frontend Layer"
        A[React Mobile App]:::client
        C[React Web Dashboard]:::client
    end

    subgraph "Logic Layer"
        B(Node.js Express API):::server
        E[Socket.io Server]:::realtime
    end

    subgraph "Persistence Layer"
        D[(Supabase PostgreSQL)]:::database
    end

    %% Connections
    A <-->|REST / WebSocket| B
    C <-->|REST API| B
    B <-->|PostgreSQL Protocol| D
    B ---|Internal Events| E
    E -.->|Real-time Push| A
    E -.->|Live Updates| C

    %% Layout Tuning
    style Clients fill:none,stroke:#333,stroke-dasharray: 5 5
    style Logic fill:none,stroke:#333,stroke-dasharray: 5 5
    style Persistence fill:none,stroke:#333,stroke-dasharray: 5 5
```

---

## Deployment Status

| Environment | Status | URL |
| :--- | :--- | :--- |
| **Web Production** | ![Online](https://img.shields.io/badge/Live-Online-success) | [transformers-nu.vercel.app](https://transformers-nu.vercel.app/) |
| **API Backend** | ![Responsive](https://img.shields.io/badge/Render-Active-blue) | https://college-management-mjul.onrender.com/ |
| **Database** | ![Connected](https://img.shields.io/badge/Supabase-Ready-green) | [PostgreSQL Server] |

---

## Setting Up Locally

### Prerequisites
- **Node.js** (v18.x or higher)
- **Git**
- **Supabase Account** (for cloud DB configuration)
- **Expo Go** (for mobile debugging on physical devices)

### Installation
```bash
# Clone the repository
git clone https://github.com/aryansondharva/College-Sys.git
cd College-Sys

# Install dependencies for all modules
cd client && npm install
cd ../server && npm install
cd ../mobile && npm install
```

### Environment Variables
Create .env files in respective directories:

**📂 /server/.env**
```ini
DATABASE_URL=postgresql://postgres.[ID]:[PASS]@pooler.supabase.com:5432/postgres
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
```

**📂 /client/.env**
```ini
VITE_API_URL=http://localhost:5000/api
```

### Execution
```bash
# Run Server (from /server)
npm run dev

# Run Client (from /client)
npm run dev

# Run Mobile (from /mobile)
npx expo start
```

---

## Admin Tools & Synchronization
We've included specialized automation scripts for institutional data management in the /server directory:

- `npm run sync:supabase`: Full database schema and data migration to production.
- `npm run sync:auth`: Dynamic sync between internal user tables and Supabase Auth.
- `node reset_supabase_passwords.js`: Global password reset for test deployments (student123, teacher123, admin123).

---

## Mobile App (Expo)
The mobile app is built using React Native and Expo. 
- **Scan QR Code**: Open Expo Go and scan the QR code from the terminal after running `npx expo start`.
- **Login**: Use default institutional credentials for instant access.

---

## License & Contributing
Licensed under the **MIT License**. We welcome contributions to help make educational management more efficient.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git checkout origin feature/AmazingFeature`)
5. Open a Pull Request

---

<p align="center">
  <i>Developed by <a href="https://github.com/aryansondharva">Aryan Sondharva</a></i>
</p>
