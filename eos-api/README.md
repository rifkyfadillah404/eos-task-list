# EOS Task Management - Backend API

Express.js backend API untuk EOS Task Management System dengan SQL Server database.

## 📋 Fitur

### Backend
- ✅ JWT Authentication
- ✅ User Management (Add/Edit/Delete)
- ✅ Task CRUD Operations
- ✅ Role-based Access Control (Admin/User)
- ✅ SQL Server Integration
- ✅ CORS Support
- ✅ Error Handling

### Frontend (React)
- ✅ Smooth Drag & Drop Animations with @dnd-kit
- ✅ Enhanced User & Admin Dashboards with Gradient UI
- ✅ Professional Icon System (Lucide React)
- ✅ Responsive Grid-based Task Lists
- ✅ Real-time Task Status Management
- ✅ Interactive Charts & Analytics (Recharts)
- ✅ Modern Form Components with Validation
- ✅ Accessibility & Performance Optimized

---

## 🚀 Prerequisites

Sebelum setup, pastikan sudah install:

1. **Node.js** (v14+) - [Download](https://nodejs.org/)
2. **SQL Server Express** - [Download](https://www.microsoft.com/en-us/sql-server/sql-server-express)
3. **SQL Server Management Studio (SSMS)** - [Download](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms)

---

## 🎨 Frontend Improvements (Latest)

### Smooth Drag & Drop Animations
- **Implementation**: @dnd-kit with PointerSensor and closestCorners collision detection
- **Animation System**: Optimized Framer Motion + CSS transitions for smooth dragging
- **Performance**: Removed conflicting transform animations, allowing @dnd-kit to handle positioning exclusively
- **Files**: `src/components/board/DraggableTaskCard.jsx`, `src/components/board/DroppableColumn.jsx`, `src/components/board/BoardView.jsx`
- **Features**:
  - Smooth card dragging without stuttering or choppy motion
  - 200ms PointerSensor delay for better UX
  - Hover lift effect (4px) with pure CSS transitions
  - DragOverlay with scale animation (1 → 1.08) for visual feedback

### Enhanced Dashboard Design
- **User Dashboard** (`src/pages/UserDashboard.jsx`):
  - Gradient metric cards with Lucide React icon badges
  - Color-coded status indicators (indigo, blue, green, red)
  - Interactive charts: Task Distribution (pie), Priority Breakdown (bar)
  - Completion rate visualization with animated progress bar
  - Category breakdown with visual indicators
  - Analytics section with detailed metrics

- **Admin Dashboard** (`src/pages/AdminDashboard.jsx`):
  - Overview dashboard showing team statistics
  - 5 metric cards: Total Tasks, Planning, In Progress, Completed, High Priority
  - Task Status Overview pie chart
  - Team Workload bar chart (total vs completed)
  - Team Completion Rate with progress indicator
  - Priority Distribution chart
  - User Task Count analytics
  - All Tasks view with horizontal grid layout for better space utilization
  - User filtering for task management

### Professional Icon System
- **Migration**: Replaced 10+ emoji characters with Lucide React icons
- **Updated Components**:
  - `TaskForm.jsx`: Edit2 and Plus icons for headers, removed emoji from options
  - `Login.jsx`: AlertTriangle icon for error messages
  - All dashboard metric cards: Consistent icon badges with color-coded styling
  - Navigation and feature icons throughout the UI
- **Benefits**: Professional appearance, better accessibility, consistent styling

### Date Formatting Enhancement
- **Format**: ISO dates (2025-01-15) → Readable format (2025 January 15)
- **Implementation**: `formatDate()` function in `src/components/tasks/TaskCard.jsx`
- **Features**:
  - Handles invalid dates gracefully with try-catch
  - Displays "No due date" for missing dates
  - Used in both task list views and task cards

### Task List Layout Improvements
- **User Dashboard - All Tasks**:
  - Grid layout: 12-column Tailwind CSS Grid
  - Column breakdown:
    - Cols 1-5: Task title + description (50% width)
    - Cols 6-8: Priority + Status badges (25% width)
    - Cols 9-12: Due date right-aligned (25% width)
  - Compact spacing with `space-y-2` for better readability
  - Hover effects with shadow and border color transitions
  - Clickable for task editing

- **Admin Dashboard - All Tasks**:
  - Grid layout: 12-column Tailwind CSS Grid
  - Column breakdown:
    - Cols 1-4: Task title + description (33% width)
    - Cols 5-6: User name badge (17% width)
    - Cols 7-9: Priority + Status (25% width)
    - Cols 10-12: Due date right-aligned (25% width)
  - User filtering with button toggles
  - Real-time updates on task changes

### Visual & Styling Enhancements
- **Gradient Backgrounds**: Consistent use of gradient backgrounds (indigo→purple, blue→cyan, green→emerald, etc.)
- **Color Coding**:
  - High Priority: Red (#EF4444)
  - Medium Priority: Yellow (#FBBF24)
  - Low Priority: Green (#10B981)
  - In Progress: Blue (#3B82F6)
  - Completed: Green (#10B981)
  - Planning: Gray (#6B7280)
- **Cards**: Rounded corners, shadow effects, hover transitions
- **Typography**: Bold headers, hierarchical sizing for better visual flow
- **Responsive Design**: Mobile-first approach with breakpoints (md, lg)

### Frontend Technology Stack
- **React 18+**: Modern UI library with hooks and context API
- **@dnd-kit**: Advanced drag & drop library with collision detection
- **Framer Motion**: Smooth animations for UI transitions
- **Recharts**: Interactive charts and data visualization
- **Lucide React**: Professional icon library (100+ icons)
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing (if applicable)

---

## 🔧 Installation & Setup

### 1. Install Dependencies

```bash
cd C:\EOS\Project\react\eos-api
npm install
```

### 2. Configure SQL Server

**Option A: Menggunakan default settings**

```sql
-- Login dengan Windows Authentication
-- Server: localhost
-- Username: sa
-- Password: (setup saat install)
```

**Option B: Buat login baru (recommended)**

Buka SQL Server Management Studio (SSMS):

```sql
-- Buat login baru
CREATE LOGIN eosadmin WITH PASSWORD = 'YourPassword123';

-- Beri permission
ALTER SERVER ROLE sysadmin ADD MEMBER eosadmin;
```

### 3. Setup Environment Variables

Edit `.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# SQL Server Configuration
DB_SERVER=localhost
DB_USER=sa              # Ganti dengan username SQL Server
DB_PASSWORD=YourPassword123  # Ganti dengan password
DB_NAME=eos_task_db
DB_PORT=1433

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 4. Initialize Database

```bash
node scripts/initDb.js
```

Ini akan:
- ✅ Membuat database `eos_task_db`
- ✅ Membuat tabel `users` dan `tasks`
- ✅ Insert demo data

---

## 🏃 Running the Server

### Development (dengan auto-reload)

```bash
npm run dev
```

### Production

```bash
npm start
```

Server akan berjalan di: **http://localhost:5000**

---

## 📚 API Endpoints

### Authentication

**POST** `/api/auth/login`
```json
{
  "email": "admin@eos.com",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Admin",
    "email": "admin@eos.com",
    "role": "admin"
  }
}
```

**GET** `/api/auth/me` (Protected)
- Headers: `Authorization: Bearer {token}`

---

### Users Management (Admin Only)

**GET** `/api/users` (Protected, Admin)
- Get semua users

**POST** `/api/users` (Protected, Admin)
```json
{
  "name": "New User",
  "email": "newuser@eos.com",
  "password": "password123",
  "role": "user"
}
```

**PUT** `/api/users/:id` (Protected, Admin)
- Update user data

**DELETE** `/api/users/:id` (Protected, Admin)
- Delete user

---

### Tasks Management

**GET** `/api/tasks` (Protected)
- User: Get own tasks
- Admin: Get all tasks

**GET** `/api/tasks/:id` (Protected)
- Get single task

**POST** `/api/tasks` (Protected)
```json
{
  "title": "Task Title",
  "description": "Task Description",
  "priority": "high",
  "category": "Design",
  "due_date": "2025-11-05",
  "status": "todo"
}
```

**PUT** `/api/tasks/:id` (Protected)
- Update task

**DELETE** `/api/tasks/:id` (Protected)
- Delete task

**GET** `/api/tasks/stats/overview` (Protected, Admin)
- Get task statistics

---

## 🧪 Testing API

### Menggunakan Postman

1. Import requests dan setup base URL: `http://localhost:5000/api`
2. Login dulu untuk dapat token
3. Add token ke Authorization header: `Bearer {token}`

### Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@eos.com | admin123 | Admin |
| sarah@eos.com | user123 | User |
| mike@eos.com | user123 | User |

---

## 🔐 Security Notes

⚠️ **Important untuk Production:**

1. **Change JWT Secret** - Edit `.env` dan set `JWT_SECRET` dengan nilai random
2. **Hash Passwords** - Passwords di demo sudah menggunakan bcrypt, tapi perlu di-update
3. **Use HTTPS** - Always use HTTPS di production
4. **Environment Variables** - Jangan expose `.env` ke version control
5. **CORS** - Configure CORS untuk domain specific
6. **SQL Injection Prevention** - Semua queries sudah menggunakan parameterized queries

---

## 📁 Project Structure

```
eos-task-list/
├── eos-api/
│   ├── config/
│   │   └── database.js          # Database connection config
│   ├── middleware/
│   │   └── auth.js              # JWT & Role middleware
│   ├── routes/
│   │   ├── auth.js              # Auth endpoints
│   │   ├── users.js             # User management endpoints
│   │   └── tasks.js             # Task CRUD endpoints
│   ├── scripts/
│   │   └── initDb.js            # Database initialization script
│   ├── .env                      # Environment variables
│   ├── .env.example              # Example env file
│   ├── .gitignore               # Git ignore rules
│   ├── package.json             # Dependencies
│   └── server.js                # Main server file
│
└── eos-task-list/ (React Frontend)
    ├── src/
    │   ├── components/
    │   │   ├── admin/
    │   │   │   └── UserManagement.jsx
    │   │   ├── board/
    │   │   │   ├── BoardView.jsx           # Drag & drop board with smooth animations
    │   │   │   ├── DraggableTaskCard.jsx   # Draggable task with optimized animations
    │   │   │   ├── DroppableColumn.jsx     # Drop target column with feedback
    │   │   │   └── TaskCard.jsx            # Task card with formatted date display
    │   │   ├── layout/
    │   │   │   ├── Sidebar.jsx
    │   │   │   └── Header.jsx
    │   │   └── tasks/
    │   │       └── TaskForm.jsx            # Form with Lucide icons (no emoji)
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── TaskContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx                   # Login with AlertTriangle icon
    │   │   ├── UserDashboard.jsx           # Enhanced user dashboard with charts
    │   │   └── AdminDashboard.jsx          # Admin dashboard with team analytics
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.css                           # Tailwind CSS + custom styles
    ├── package.json
    └── vite.config.js
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to SQL Server"

**Solution:**
1. Pastikan SQL Server running
2. Check DB_SERVER, DB_USER, DB_PASSWORD di `.env`
3. Verify port 1433 tidak diblokir firewall

### Error: "Database does not exist"

**Solution:**
```bash
node scripts/initDb.js
```

### Error: "Invalid token"

**Solution:**
- Token expired, login ulang
- JWT_SECRET mungkin berbeda, check `.env`

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY IDENTITY,
  name NVARCHAR(255) NOT NULL,
  email NVARCHAR(255) UNIQUE NOT NULL,
  password NVARCHAR(MAX) NOT NULL,
  role NVARCHAR(50) DEFAULT 'user',
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE()
)
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id INT PRIMARY KEY IDENTITY,
  user_id INT NOT NULL,
  title NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX),
  priority NVARCHAR(50) DEFAULT 'medium',
  category NVARCHAR(100),
  due_date DATE,
  status NVARCHAR(50) DEFAULT 'todo',
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

---

## 🚀 Deploy ke Production

### Option 1: Azure App Service
1. Build project: `npm run build`
2. Deploy ke Azure
3. Configure environment variables

### Option 2: Self-hosted VPS
1. SSH ke server
2. Install Node.js & SQL Server
3. Clone repository
4. Setup `.env` dan run `npm install`
5. Use PM2 untuk process management

---

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## 📞 Support

Untuk troubleshooting:
1. Check console logs
2. Verify `.env` configuration
3. Check SQL Server connection
4. Review API documentation di atas

---

## 📅 Last Updated
**2025-10-29** - Initial backend setup
**2025-10-29** - Frontend UI/UX Improvements
  - ✨ Smooth drag & drop animations with @dnd-kit
  - 🎨 Enhanced dashboards with gradient UI and Lucide icons
  - 📅 Date formatting improvements
  - 📊 Grid-based responsive task list layouts
  - 🎯 Professional icon system (emoji → Lucide React)

---

**Happy coding! 🚀**
