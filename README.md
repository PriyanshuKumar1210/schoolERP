# School Management System - Multi-School MERN Stack

A comprehensive, enterprise-grade School Management System built with the MERN Stack (MongoDB, Express.js, React.js, Node.js) with support for multi-school environments, role-based access control, real-time notifications, and extensive management features.

## 🌟 Features

### Multi-School Support
- **Separate Admin for Each School**: Each school has its own dedicated admin
- **School Isolation**: Complete data isolation between schools
- **Unique School Codes**: Schools identified by unique codes for login

### Authentication & Authorization
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Role-Based Access Control (RBAC)**:
  - Admin: Full system control
  - Teacher: Class and content management
  - Student: Learning and submission access
- **Password Management**: Hashing with bcrypt, change password, forgot password
- **Session Management**: Automatic token refresh and logout

### Admin Module

#### Dashboard
- Real-time statistics (students, teachers, classes, subjects)
- Attendance overview
- Pending complaints
- Recent notices
- Upcoming events
- Fee collection summary
- Student performance analytics

#### Student Management
- Add/Edit/Delete students
- Assign roll numbers and classes
- Upload student photos and documents
- Promote students to next standard
- View student details
- Bulk import students from Excel

#### Teacher Management
- Add/Edit/Delete teachers
- Assign subjects to teachers
- Assign classes to teachers
- Make class teachers
- View teacher details and assignments

#### Class & Division Management
- Create standards (Std 1-10)
- Create divisions (A, B, C, D, E)
- Assign class teachers
- View class strength

#### Subject Management
- Create/Edit/Delete subjects
- Assign teachers to subjects
- Subject code management

#### Timetable Management
- Create and manage timetables
- Assign subjects and teachers to time slots
- Prevent teacher schedule conflicts
- View timetables by class

#### Attendance Management
- Mark daily attendance
- Mark class attendance in bulk
- View attendance reports
- Generate attendance statistics
- Export to PDF/Excel

#### Marks & Examination Management
- Create exams (Unit Test, Mid Term, Final)
- Enter marks for students
- Bulk mark entry
- View exam results
- Generate toppers list
- Track failed students
- Generate report cards

#### Notice Board
- Create notices with multiple target options
- Pin important notices
- Target: All, Students, Teachers, Specific Class, Individual
- View notice read statistics

#### Complaint Management
- View all complaints
- Assign complaints to handlers
- Track complaint status (Pending, In Progress, Resolved)
- Add comments and resolution notes

#### Event Management
- Create school events
- Categorize events (Academic, Sports, Cultural, Holiday, Exam)
- Calendar view
- Holiday management

#### Homework Management
- Monitor assigned homework
- View submission status
- Check completion rates

#### Fee Management
- Generate fee receipts
- Record payments
- View defaulters
- Generate fee reports

#### Reports & Analytics
- Attendance reports
- Result analysis
- Teacher performance reports
- Student performance trends
- Export to PDF/Excel

### Teacher Module

#### Dashboard
- Today's classes
- Timetable view
- Pending homework
- Attendance statistics
- Notices
- Complaints

#### Attendance
- Mark daily attendance
- Edit attendance records
- View attendance history
- Class attendance report

#### Marks Management
- Enter marks for assigned subjects
- Bulk mark entry
- View class-wise performance

#### Homework Management
- Assign homework
- Upload files/PDFs
- Set deadlines
- Review submissions
- Grade homework
- Provide feedback

#### Complaint Handling
- Raise complaints
- View complaints
- Reply to student grievances
- Track resolution status

#### Communication
- Send notices to students
- Answer student questions
- Send subject-related updates
- Real-time messaging

#### Attendance Tracking
- Mark daily attendance
- View attendance history

### Student Module

#### Dashboard
- Attendance percentage
- Marks summary
- Pending homework
- Latest notices
- Timetable
- Upcoming exams

#### Notices
- View latest notices
- Filter notices
- Mark notices as read

#### Homework
- View assigned homework
- Submit homework
- Upload PDF/Images
- View submission status
- See grades and feedback

#### Attendance
- View personal attendance
- Subject-wise attendance
- Monthly attendance statistics

#### Marks
- View exam results
- Subject-wise marks
- Download report card
- View performance trends

#### Complaints & Grievances
- Raise complaints
- Raise subject-related queries
- Ask questions to teachers
- Track complaint status

#### Communication
- Real-time chat with teachers
- Subject-specific discussions
- Attach files in messages

### Notification System
- **Real-time Notifications** via Socket.io
- **Push Notifications** for:
  - New notices
  - New homework
  - New marks published
  - Complaint updates
  - Timetable changes
- **Email Notifications** (configured)

### Advanced Features
- **Multi-tenancy**: Complete isolation between schools
- **Real-time Updates**: Using Socket.io
- **Bulk Operations**: Bulk import/export
- **PDF Generation**: Report cards, certificates
- **Excel Export**: Reports and data
- **Search & Filters**: Across all modules
- **Pagination**: For large datasets
- **Responsive Design**: Mobile, tablet, desktop
- **Dark Mode**: (Optional enhancement)
- **Audit Logs**: User activity tracking

## 🏗️ Project Structure

```
school/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── School.js
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Teacher.js
│   │   ├── Class.js
│   │   ├── Subject.js
│   │   ├── Timetable.js
│   │   ├── Attendance.js
│   │   ├── Exam.js
│   │   ├── Marks.js
│   │   ├── Homework.js
│   │   ├── Notice.js
│   │   ├── Complaint.js
│   │   ├── Event.js
│   │   └── Message.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── teacherController.js
│   │   ├── classController.js
│   │   ├── subjectController.js
│   │   ├── attendanceController.js
│   │   ├── marksController.js
│   │   ├── noticeController.js
│   │   ├── homeworkController.js
│   │   ├── complaintController.js
│   │   ├── eventController.js
│   │   └── messageController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── teacherRoutes.js
│   │   ├── classRoutes.js
│   │   ├── subjectRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── marksRoutes.js
│   │   ├── noticeRoutes.js
│   │   ├── homeworkRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── eventRoutes.js
│   │   └── messageRoutes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── password.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── admin/
│   │   │   │   └── Dashboard.jsx
│   │   │   ├── teacher/
│   │   │   │   └── Dashboard.jsx
│   │   │   └── student/
│   │   │       └── Dashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── store/
│   │   │   ├── authSlice.js
│   │   │   └── index.js
│   │   ├── utils/
│   │   │   └── apiClient.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env.example
├── .github/
│   └── copilot-instructions.md
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js v16+
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for image storage)

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/school_management?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_REFRESH_SECRET=your_jwt_refresh_secret_change_this_in_production
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

5. **Start the server**
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

5. **Start the development server**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔐 Demo Credentials

### Super Admin
- **School Code**: `SCHOOL001`
- **Email**: `admin@school.com`
- **Password**: `password123`

### Teacher
- **School Code**: `SCHOOL001`
- **Email**: `teacher@school.com`
- **Password**: `password123`

### Student
- **School Code**: `SCHOOL001`
- **Email**: `student@school.com`
- **Password**: `password123`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `POST /api/students/:id/promote` - Promote student
- `GET /api/students/:id/attendance` - Get student attendance

### Teachers
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/:id` - Get teacher by ID
- `POST /api/teachers` - Create teacher
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher
- `POST /api/teachers/:id/assign-subject` - Assign subject
- `POST /api/teachers/:id/assign-class` - Assign class

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get class by ID
- `POST /api/classes` - Create class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class
- `GET /api/classes/:id/students` - Get class students

### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject by ID
- `POST /api/subjects` - Create subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `POST /api/attendance/mark-class` - Mark class attendance
- `GET /api/attendance/user/:userId` - Get user attendance
- `GET /api/attendance/class/report` - Get class attendance report

### Marks
- `POST /api/marks/exams` - Create exam
- `GET /api/marks/exams` - Get all exams
- `POST /api/marks/enter` - Enter marks
- `POST /api/marks/bulk` - Bulk enter marks
- `GET /api/marks/student/:studentId` - Get student marks
- `GET /api/marks/exam/:examId` - Get exam result
- `GET /api/marks/toppers` - Get toppers list

### Notices
- `POST /api/notices` - Create notice
- `GET /api/notices` - Get all notices
- `GET /api/notices/user/notices` - Get user notices
- `PUT /api/notices/:id` - Update notice
- `DELETE /api/notices/:id` - Delete notice
- `POST /api/notices/:id/read` - Mark as read

### Homework
- `POST /api/homework` - Create homework
- `GET /api/homework` - Get all homework
- `GET /api/homework/student` - Get student homework
- `POST /api/homework/:id/submit` - Submit homework
- `POST /api/homework/:id/grade` - Grade homework
- `PUT /api/homework/:id` - Update homework
- `DELETE /api/homework/:id` - Delete homework

### Complaints
- `POST /api/complaints` - Create complaint
- `GET /api/complaints` - Get all complaints
- `GET /api/complaints/my` - Get my complaints
- `POST /api/complaints/:id/assign` - Assign complaint
- `POST /api/complaints/:id/resolve` - Resolve complaint
- `POST /api/complaints/:id/comment` - Add comment

### Events
- `POST /api/events` - Create event
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/calendar` - Get calendar events

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/inbox` - Get inbox
- `GET /api/messages/sent` - Get sent messages
- `GET /api/messages/conversation/:userId` - Get conversation
- `POST /api/messages/:id/read` - Mark as read
- `DELETE /api/messages/:id` - Delete message
- `GET /api/messages/unread-count` - Get unread count

## 🔌 Socket.io Events

### Client to Server
- `user-connected` - Connect user
- `notify-all` - Send notification to all users
- `notify-user` - Send notification to specific user
- `send-message` - Send real-time message

### Server to Client
- `user-online` - User came online
- `user-offline` - User went offline
- `notification` - Receive notification
- `receive-message` - Receive message

## 🛠️ Technologies Used

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: MongoDB ODM
- **JWT**: Token-based authentication
- **bcryptjs**: Password hashing
- **Socket.io**: Real-time communication
- **Multer**: File upload handling
- **Cloudinary**: Cloud storage for images
- **PDFKit**: PDF generation
- **ExcelJS**: Excel generation

### Frontend
- **React 18**: UI library
- **Vite**: Build tool
- **React Router**: Navigation
- **Redux Toolkit**: State management
- **Tailwind CSS**: Styling
- **Axios**: HTTP client
- **Socket.io Client**: Real-time updates
- **Recharts**: Data visualization
- **React Hook Form**: Form handling
- **Lucide React**: Icons
- **React Toastify**: Notifications

## 📋 Development Checklist

- [x] Backend folder structure
- [x] Frontend folder structure
- [x] Database models and schemas
- [x] Authentication system (JWT)
- [x] API endpoints (RESTful)
- [x] Role-Based Access Control
- [x] Frontend components
- [x] Redux state management
- [ ] Admin dashboard UI
- [ ] Teacher dashboard UI
- [ ] Student dashboard UI
- [ ] Complete component pages
- [ ] Socket.io integration
- [ ] Error handling and validation
- [ ] Testing
- [ ] Documentation
- [ ] Deployment

## 📝 Best Practices

- **Security**: All passwords hashed, JWT tokens, CORS enabled, Helmet for security headers
- **Scalability**: Modular code structure, separate concerns, reusable components
- **Performance**: Pagination, indexing, query optimization
- **Code Quality**: Clean code, proper naming conventions, error handling
- **Documentation**: Comprehensive README, API documentation

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request


## 🎯 Future Enhancements

- Parent portal login
- QR Code attendance
- Face recognition attendance
- Mobile app
- WhatsApp integration
- Email notifications
- Online examinations
- Plagiarism detection
- AI chatbot for student queries
- Performance prediction using ML
- Audit logs
