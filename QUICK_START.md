# Quick Start Guide - School Management System

## 🚀 Get Started in 5 Minutes

### Step 1: Clone/Download the Project
```bash
cd school
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file with your configuration
# Copy from .env.example and fill in your details:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: Any random string for JWT encoding
# - CLOUDINARY credentials (optional for image storage)

# Start the backend server
npm run dev
```

Backend will start on: **http://localhost:5000**

### Step 3: Frontend Setup (In a new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
# Copy from .env.example

# Start the frontend development server
npm run dev
```

Frontend will start on: **http://localhost:5173**

### Step 4: Access the Application

Open your browser and go to: **http://localhost:5173**

## 📝 First Time Setup - Create a School

1. **Create MongoDB Database**:
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a cluster and database named `school_management`
   - Copy your connection URI

2. **Set Environment Variables** in `backend/.env`:
   ```
   MONGODB_URI=your_connection_uri_here
   JWT_SECRET=your_secret_key_here
   PORT=5000
   ```

3. **Create a School** (using Postman or cURL):
   ```bash
   POST http://localhost:5000/api/schools
   Content-Type: application/json

   {
     "name": "ABC School",
     "code": "SCHOOL001",
     "email": "admin@abcschool.com",
     "phone": "1234567890",
     "address": {
       "street": "123 Main St",
       "city": "City",
       "state": "State",
       "zipCode": "12345"
     },
     "principalName": "Mr. Principal",
     "principalEmail": "principal@abcschool.com",
     "adminName": "Admin User",
     "adminEmail": "admin@school.com",
     "adminPassword": "password123"
   }
   ```

4. **Login to the Application**:
   - School Code: `SCHOOL001`
   - Email: `admin@school.com`
   - Password: `password123`

## 🔐 Default Demo Credentials

If you use the demo data:
- **School Code**: `SCHOOL001`
- **Email**: `admin@school.com`
- **Password**: `password123`

## 📁 Project Structure Overview

```
school/
├── backend/          (Express.js + MongoDB)
│   ├── models/       (Database schemas)
│   ├── controllers/  (Business logic)
│   ├── routes/       (API endpoints)
│   ├── middleware/   (Auth, error handling)
│   ├── utils/        (JWT, password hashing)
│   └── server.js     (Main server file)
│
├── frontend/         (React + Vite)
│   ├── src/
│   │   ├── pages/    (Login, Dashboards)
│   │   ├── components/ (Reusable UI components)
│   │   ├── store/    (Redux state management)
│   │   ├── services/ (API calls)
│   │   └── utils/    (Helper functions)
│   └── index.html    (Entry point)
│
└── README.md         (Full documentation)
```

## 🧪 API Testing

Use **Postman** or any REST client to test endpoints.

### Example: Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@school.com",
  "password": "password123",
  "schoolCode": "SCHOOL001"
}
```

## ✨ Key Features Ready to Use

✅ Multi-school support with separate admins  
✅ Role-Based Access Control (Admin, Teacher, Student)  
✅ JWT Authentication with refresh tokens  
✅ Student management (Add, Edit, Delete, Promote)  
✅ Teacher management (Add, Edit, Delete, Assign subjects)  
✅ Class management  
✅ Subject management  
✅ Attendance tracking  
✅ Marks and examinations  
✅ Homework management  
✅ Notices and complaints  
✅ Events calendar  
✅ Real-time messaging (Socket.io ready)  

## 🔧 Troubleshooting

### MongoDB Connection Error
- Check your MongoDB URI in `.env`
- Ensure your IP is whitelisted in MongoDB Atlas
- Make sure your password doesn't have special characters that need encoding

### Port Already in Use
```bash
# Change port in .env or use different port
PORT=5001
```

### Dependencies Missing
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

1. **Customize Theme**: Edit `frontend/tailwind.config.js`
2. **Add More Features**: Extend controllers and models
3. **Deploy**: Follow deployment guide in main README
4. **Database Seeding**: Create seed script for demo data

## 🎯 Development Workflow

1. Start backend: `npm run dev` (in backend folder)
2. Start frontend: `npm run dev` (in frontend folder)
3. Make API calls to test endpoints
4. Build components to consume the APIs
5. Test authentication and RBAC

## 🆘 Need Help?

- Check [main README.md](../README.md) for complete documentation
- Review API endpoints in README.md
- Check model schemas in `backend/models/`
- Review controller logic in `backend/controllers/`

## 🎉 You're All Set!

Your School Management System is now ready to develop and deploy!

Happy Coding! 🚀
