# EOS Task Management System

A modern task management application for the EOS company. This system allows users to create and manage their own tasks, while administrators can monitor team progress across the organization.

## 📋 Key Features

### ✅ Authentication & Authorization
- Login system dengan userId & password (MSSQL database)
- Role-based access control (Admin & User)
- Admin user management (add/edit/delete users)
- Secure logout functionality

### ✅ Task Management
- Create, edit, and delete personal tasks
- Kanban board with drag & drop functionality
- Task status: Plan → In Progress → Completed
- Priority levels: High, Medium, Low
- Task categories and due dates
- Task assignment tracking

### ✅ User Dashboard
- Personal task overview with statistics
- Interactive analytics charts (Recharts)
- Task distribution visualization
- Completion rate tracking
- Category breakdown

### ✅ Admin Dashboard
- Monitor all team tasks
- Filter tasks by user
- Team analytics and performance metrics
- User management panel
- Team member performance overview

### ✅ UI/UX
- Responsive design dengan Tailwind CSS
- Modern typography (Poppins font)
- Smooth drag & drop animations
- Lucide React icons
- Collapsible sidebar
- Interactive data visualization

---

## 🚀 Tech Stack

```
Frontend:
- React 19.1.1
- Tailwind CSS 3.3.6
- @dnd-kit (drag & drop)
- Recharts (data visualization)
- Lucide React (icons)
- Vite (bundler)

Backend & Database:
- Node.js + Express.js
- MSSQL Server
```

---

## 📦 Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| User | sarah | user123 |
| User | mike | user123 |

---

## 💻 Installation & Setup

### Prerequisites
- Node.js v16+
- MSSQL Server
- npm or yarn

### Frontend Setup
```bash
cd eos-task-list
npm install --legacy-peer-deps
npm run dev
```

Frontend akan jalan di `http://localhost:5173`

### Backend Setup
```bash
cd eos-api
npm install
node scripts/initDb.js
npm start
```

Backend akan jalan di `http://localhost:3000`

---

## 📁 Project Structure

```
eos-task-list/          # Frontend React application
├── src/
│   ├── components/     # React components
│   ├── context/        # Context API (Auth, Tasks)
│   ├── pages/          # Page components
│   └── App.jsx

eos-api/                # Backend Node.js/Express
├── routes/             # API endpoints
├── middleware/         # Authentication middleware
├── config/             # Database configuration
└── scripts/            # Database initialization
```

---

## 🎯 Usage

### For Users
1. Login dengan credentials
2. Create tasks di Dashboard
3. Drag & drop tasks di Board view untuk update status
4. Track progress di Analytics

### For Admin
1. Login sebagai admin
2. Access User Management untuk manage team
3. Monitor semua tasks di Dashboard
4. View team analytics dan performance

---

## 🔄 Data Flow

```
Login →
  ├─ Admin → Admin Dashboard (monitor all, manage users)
  └─ User → User Dashboard (manage own tasks)
```

---

## 📊 Current Status

- **Version**: 1.2
- **Status**: Fully functional with all core features implemented
- **Database**: MSSQL Server integration complete
- **API**: Express.js REST API fully operational
- **UI/UX**: Modern and responsive design

---

## 🚀 Getting Started

1. Clone the repository
2. Follow the Installation & Setup section
3. Ensure MSSQL Server is running
4. Initialize the database: `node eos-api/scripts/initDb.js`
5. Start both frontend and backend
6. Login dengan demo credentials

---

## 📝 License

This project is proprietary to EOS Company.

---

## 👥 Support

For issues or questions, please contact the development team.

---

**Last Updated**: October 2025
