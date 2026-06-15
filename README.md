<div align="center">
  <a href="https://github.com/kaditya125/edusphare-ai">
    <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200&h=400" alt="EduSphere AI Hero Banner" style="border-radius: 15px; margin-bottom: 20px; object-fit: cover;" />
  </a>

  <h1 align="center">✨ EduSphere AI ✨</h1>

  <p align="center">
    <strong>A Next-Generation, AI-Powered Academic Ecosystem Built for the Future.</strong>
    <br />
    <em>Redefining the intersection of education, schedule management, and artificial intelligence through a stunning glassmorphic UI.</em>
  </p>

  <p align="center">
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-0f172a?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-0f172a?style=for-the-badge&logo=tailwind-css&logoColor=38B2AC" alt="Tailwind" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-Express-0f172a?style=for-the-badge&logo=node.js&logoColor=339933" alt="Node" /></a>
    <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-Mongoose-0f172a?style=for-the-badge&logo=mongodb&logoColor=47A248" alt="MongoDB" /></a>
    <a href="https://groq.com/"><img src="https://img.shields.io/badge/AI-Groq_API-0f172a?style=for-the-badge&logo=openai&logoColor=white" alt="AI" /></a>
    <a href="https://www.framer.com/motion/"><img src="https://img.shields.io/badge/Framer_Motion-12-0f172a?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" /></a>
  </p>
  
  <p align="center">
    <a href="#-about-the-project">About</a> •
    <a href="#-key-features">Features</a> •
    <a href="#-tech-stack--architecture">Tech Stack</a> •
    <a href="#-getting-started">Installation</a> •
    <a href="#-api-overview">API</a> •
    <a href="#-roadmap">Roadmap</a>
  </p>
</div>

---

## 🌟 About The Project

Traditional academic portals are often clunky, outdated, and lack intelligent insights. **EduSphere AI** shatters the mold by offering a premium, hyper-responsive platform that actively learns from the student's habits. 

By integrating **Llama-based LLMs** via the **Groq API**, EduSphere acts as a 24/7 academic advisor. It automatically resolves schedule conflicts, curates professional student bios, recommends optimal study hours based on cognitive load, and visually maps out faculty expertise.

> *"EduSphere doesn't just display your schedule—it actively optimizes your entire academic life."*

<br />

## 🚀 Key Features

<table>
  <tr>
    <td width="50%">
      <h3>📅 Dynamic Academic Calendar</h3>
      <p>A full-scale calendar with Day, Week, and Month views. Color-coded event categorization, dynamic overlapping collision detection, and beautiful gradient cards for classes, labs, and exams.</p>
    </td>
    <td width="50%">
      <h3>🧠 AI Auto-Optimizer</h3>
      <p>Click a single button to have the AI scan your upcoming week. It intelligently identifies free gaps and slots in "Deep Work" study sessions while respecting your sleep schedule and custom preferences.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🧑‍🏫 Faculty Intelligence Directory</h3>
      <p>Browse faculty members through stunning glassmorphic cards. View AI-generated trait badges (e.g. <em>"Strict Grader", "Industry Expert"</em>), office hours, and deep-dive profiles.</p>
    </td>
    <td width="50%">
      <h3>⚙️ Smart Settings & Profiles</h3>
      <p>Manage your entire student persona. Use the <strong>AI Profile Assistant</strong> to instantly generate a highly professional bio and extract your top technical skills based on your academic goals.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🌓 Ultra-Premium Aesthetics</h3>
      <p>Dark/Light mode toggles with seamless transitions, custom mesh gradients, backdrop blur effects, and extensive micro-animations powered by <strong>Framer Motion</strong>.</p>
    </td>
    <td width="50%">
      <h3>💬 Knowledge Hub & Dashboard</h3>
      <p>A central command center for your academics. View actionable alerts, ongoing assignments, graphical CGPA tracking, and quick-access links to syllabus documents.</p>
    </td>
  </tr>
</table>

<br />

## 💻 Tech Stack & Architecture

EduSphere AI is built on a highly scalable, modern MERN architecture, decoupled perfectly for maximum performance.

### 🎨 Frontend Architecture
*   **Core:** React 19, Vite (Lightning-fast HMR)
*   **Styling Engine:** Tailwind CSS v4 (with custom typography and aspect-ratio plugins)
*   **Animation System:** `motion/react` for complex spring physics and layout transitions.
*   **State Management:** Zustand (for lightweight global state) + TanStack React Query v5 (for server-state caching).
*   **Icons & UI Elements:** Lucide React, Recharts (for data visualization).

### ⚙️ Backend Architecture
*   **Core:** Node.js, Express.js (TypeScript compiled)
*   **Database:** MongoDB Atlas + Mongoose ODM (Complex relationships between Users, Students, Faculties, Enrollments, and Schedules).
*   **Authentication:** JWT (JSON Web Tokens) with strictly enforced Role-Based Access Control (RBAC).
*   **AI Integration:** Groq SDK utilizing high-speed Llama-3 models for real-time JSON generation and academic advice.

<br />

## 📸 Platform Previews

*(Add your screenshots here! Replace the placeholders below with actual images of your app)*

| Student Dashboard | Academic Calendar |
| :---: | :---: |
| <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600&h=400" alt="Dashboard Preview" style="border-radius:8px"/> | <img src="https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&q=80&w=600&h=400" alt="Calendar Preview" style="border-radius:8px"/> |
| **Faculty Directory** | **AI Profile Settings** |
| <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600&h=400" alt="Faculty Preview" style="border-radius:8px"/> | <img src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=600&h=400" alt="Settings Preview" style="border-radius:8px"/> |

<br />

## 🚀 Getting Started

Follow these instructions to get a local copy up and running in your development environment.

### Prerequisites
*   Node.js (v18 or higher recommended)
*   MongoDB Instance (Local or Atlas)
*   A Groq API Key (Free tier available at [groq.com](https://groq.com/))

### 1. Clone the repository
```bash
git clone https://github.com/kaditya125/edusphare-ai.git
cd edusphare-ai
```

### 2. Install Dependencies
This project uses `concurrently` to run both client and server from the root.
```bash
# Install root package (concurrently)
npm install

# Install frontend and backend dependencies
npm run install:all
```

### 3. Environment Setup
Navigate to the `backend/` folder and create a `.env` file based on the provided example.
```bash
cd backend
touch .env
```
Inside `.env`, populate your secrets:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/edusphere
JWT_SECRET=your_super_secret_jwt_key_here
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### 4. Database Seeding (Optional but Recommended)
To populate the database with mock students, faculty, and schedules for testing:
```bash
npx tsx src/scripts/seedData.ts
```

### 5. Run the Application
Go back to the root folder and launch both servers simultaneously:
```bash
cd ..
npm run dev
```
*   **Frontend Client:** runs on `http://localhost:3000`
*   **Backend API:** runs on `http://localhost:5000`

<br />

## 📡 API Overview

The backend follows RESTful principles and responds with standard JSON payloads.

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | ❌ |
| `GET` | `/api/students/me` | Fetch active student profile data | ✅ |
| `PUT` | `/api/students/me` | Update personal/academic details | ✅ |
| `POST` | `/api/students/me/ai/optimize-profile`| AI-generates bio & technical skills | ✅ |
| `GET` | `/api/calendar/events` | Fetch all schedules & exams within range | ✅ |
| `POST` | `/api/calendar/ai-optimize` | AI parses calendar to generate study slots | ✅ |
| `GET` | `/api/faculty` | Fetch faculty directory & analytics | ✅ |

<br />

## 🗺️ Roadmap

- [x] Initial UI/UX Design & Architecture Setup
- [x] JWT Authentication & Role-Based Middleware
- [x] Student Dashboard & Knowledge Hub
- [x] Premium Faculty Directory with AI Badges
- [x] Dynamic Academic Calendar implementation
- [x] Integration with Groq AI for schedule optimization
- [ ] Implement Real-time Chat functionality using Socket.io
- [ ] Advanced Graph Database integration for knowledge mapping
- [ ] Push Notifications via Service Workers

<br />

## 🤝 Contributing

We welcome contributions from the community! 
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">
  <p>Crafted with unparalleled focus on aesthetics and intelligence.</p>
  <p><strong>EduSphere AI</strong> — Elevating the academic experience.</p>
</div>
