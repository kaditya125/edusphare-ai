<div align="center">
  <img src="https://api.dicebear.com/7.x/shapes/svg?seed=edusphere&backgroundColor=0f172a" alt="EduSphere AI Logo" width="100" />
  
  <h1>🎓 EduSphere AI</h1>
  <p><strong>A Next-Generation, AI-Powered Academic Ecosystem</strong></p>

  <p>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-0f172a?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-0f172a?style=for-the-badge&logo=tailwind-css&logoColor=38B2AC" alt="Tailwind" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-Express-0f172a?style=for-the-badge&logo=node.js&logoColor=339933" alt="Node" /></a>
    <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-Mongoose-0f172a?style=for-the-badge&logo=mongodb&logoColor=47A248" alt="MongoDB" /></a>
    <a href="https://groq.com/"><img src="https://img.shields.io/badge/AI-Groq_API-0f172a?style=for-the-badge&logo=openai&logoColor=white" alt="AI" /></a>
  </p>
</div>

<br />

## ✨ Overview

**EduSphere AI** is a state-of-the-art academic management platform designed to bridge the gap between students and faculty through beautiful design and artificial intelligence. Whether it's managing complex course schedules, finding the right faculty advisor, or optimizing your study habits with AI, EduSphere handles it all with an ultra-premium, glassmorphic UI.

## 🚀 Key Features

*   📅 **Dynamic Academic Calendar:** View schedules in Day, Week, or Month modes. Features robust conflict resolution, department filtering, and detailed event modals.
*   🧠 **AI Schedule Auto-Optimizer:** Click a button to have our AI analyze your classes, exams, and habits, then intelligently insert optimal study blocks into your calendar.
*   🧑‍🏫 **Interactive Faculty Directory:** Browse professors through a stunning, animated grid. View AI-generated trait badges, office hours, endorsements, and deep profiles.
*   ⚙️ **Smart Settings & Profile:** Manage your personal information, upload documents, and use AI to automatically craft a professional bio and pinpoint your top technical skills.
*   🌓 **Beautiful UI/UX:** Built with Tailwind CSS v4 and Framer Motion. Features dark/light mode toggling, dynamic mesh gradients, smooth micro-animations, and responsive layouts.

## 🛠️ Tech Stack

### Frontend
*   **Framework:** React 19 + Vite
*   **Styling:** Tailwind CSS v4, Lucide React (Icons)
*   **Animation:** Framer Motion (`motion/react`)
*   **State & Data:** Zustand, TanStack React Query v5
*   **Routing:** React Router DOM (or conditional view state routing)

### Backend
*   **Server:** Node.js + Express
*   **Database:** MongoDB + Mongoose ODM
*   **Authentication:** JWT (JSON Web Tokens) & bcrypt
*   **AI Integration:** Groq SDK (Llama models)

---

## 💻 Local Setup & Installation

Follow these steps to run EduSphere AI locally on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/kaditya125/edusphare-ai.git
cd edusphare-ai
```

### 2. Install Dependencies
This project uses a monorepo structure with concurrently.
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

### 3. Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Run the Application
You can start both the frontend and backend simultaneously from the root directory:
```bash
npm run dev
```
*   **Frontend:** `http://localhost:3000`
*   **Backend:** `http://localhost:5000`

---

## 📂 Project Structure

```text
edusphere-ai/
├── backend/
│   ├── src/
│   │   ├── controllers/   # API Request handlers
│   │   ├── middlewares/   # Auth & Role guards
│   │   ├── models/        # Mongoose Database Schemas
│   │   ├── routes/        # Express Route definitions
│   │   └── server.ts      # Backend entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # React UI Components
│   │   ├── lib/           # Utility functions & API hooks
│   │   ├── store/         # Zustand global state
│   │   └── App.tsx        # Main application layout
│   └── package.json
└── package.json           # Root package.json (Concurrently setup)
```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/kaditya125/edusphare-ai/issues).

<div align="center">
  <p>Built with ❤️ for better education.</p>
</div>
