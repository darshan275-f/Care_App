# Adaptive Care - Alzheimer's Patient & Caregiver Management App

A comprehensive mobile application designed to support Alzheimer's patients and their caregivers through medication management, task tracking, journaling, and cognitive games.

## 🧩 Core Concept

The system features two distinct user roles:

- **Patient**: Alzheimer's patients who can manage their medications, tasks, and journal entries
- **Caregiver**: Family members or healthcare providers who can manage multiple patients' care plans

### Key Features

- **Patient-Caregiver Linking**: Patients get unique usernames (e.g., `pat_1234`) that caregivers use to link accounts
- **Medication Management**: Track medication schedules, adherence, and missed doses
- **Task Management**: Create and track daily tasks with completion monitoring
- **Journal System**: Mood tracking and care notes for both patients and caregivers
- **Cognitive Games**: Memory and brain training exercises with progress tracking
- **Real-time Dashboard**: Comprehensive overview of care status and progress

## 🏗 Architecture

### Backend (Node.js + Express + MongoDB)
- **Authentication**: JWT with access/refresh tokens
- **Database**: MongoDB with Mongoose ODM
- **Security**: bcrypt password hashing, CORS, Helmet, rate limiting
- **API**: RESTful endpoints with comprehensive validation
- **Docker**: Containerized deployment with MongoDB

### Frontend (React Native + Expo)
- **Framework**: React Native with Expo CLI
- **Navigation**: React Navigation with role-based routing
- **UI**: React Native Paper with custom theme
- **State Management**: Context API for authentication
- **Storage**: Secure token storage with Expo SecureStore

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6.0+ (or Docker)
- Expo CLI (`npm install -g @expo/cli`)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   MONGO_URI=mongodb://localhost:27017/adaptive-care
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:19006
   ```

4. **Start MongoDB:**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6.0
   
   # Or install MongoDB locally
   ```

5. **Seed the database:**
   ```bash
   npm run seed
   ```

6. **Start the server:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env`:
   ```env
   API_URL=http://localhost:5000
   API_TIMEOUT=10000
   ```

4. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

### Using Docker (Backend)

1. **Start with Docker Compose:**
   ```bash
   cd backend
   docker-compose up --build
   ```

2. **Seed the database:**
   ```bash
   docker-compose exec backend npm run seed
   ```

## 📱 Demo Credentials

After running the seed script, you can use these credentials:

**Patient:**
- Email: `patient@example.com`
- Password: `password123`
- Username: `pat_1234`

**Caregiver:**
- Email: `caregiver@example.com`
- Password: `password123`

## 🔐 Authentication Flow

### Patient Registration
1. Patient creates account with name, email, password
2. System generates unique username (e.g., `pat_1234`)
3. Patient shares username with caregiver

### Caregiver Registration
1. Caregiver creates account with patient's username
2. System links caregiver to patient account
3. Caregiver can now manage patient's data

### Login
- Returns access token (15 minutes) and refresh token (7 days)
- Automatic token refresh on API calls
- Secure token storage with Expo SecureStore

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/link-patient` - Link caregiver to patient

### Patient Management
- `GET /api/patients/:id/dashboard` - Get patient dashboard
- `GET /api/patients/:id/medications` - Get patient medications
- `POST /api/patients/:id/medications/:medId/taken` - Mark medication as taken
- `POST /api/patients/:id/medications/:medId/skipped` - Mark medication as skipped
- `GET /api/patients/:id/tasks` - Get patient tasks
- `POST /api/patients/:id/tasks/:taskId/complete` - Mark task as completed
- `GET /api/patients/:id/journal` - Get patient journal entries
- `GET /api/patients/:id/games/stats` - Get patient game statistics

### Medications
- `POST /api/medications` - Create medication (Caregiver only)
- `GET /api/medications/patient/:patientId` - Get medications by patient
- `GET /api/medications/:id` - Get single medication
- `PUT /api/medications/:id` - Update medication (Caregiver only)
- `DELETE /api/medications/:id` - Delete medication (Caregiver only)
- `GET /api/medications/:id/stats` - Get medication statistics

### Tasks
- `POST /api/tasks` - Create task (Caregiver only)
- `GET /api/tasks/patient/:patientId` - Get tasks by patient
- `GET /api/tasks/patient/:patientId/stats` - Get task statistics
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task (Caregiver only)
- `DELETE /api/tasks/:id` - Delete task (Caregiver only)
- `POST /api/tasks/:id/complete` - Mark task as completed
- `POST /api/tasks/:id/incomplete` - Mark task as incomplete

### Journal
- `POST /api/journal` - Create journal entry
- `GET /api/journal/patient/:patientId` - Get journal entries by patient
- `GET /api/journal/patient/:patientId/mood-stats` - Get mood statistics
- `GET /api/journal/:id` - Get single journal entry
- `PUT /api/journal/:id` - Update journal entry
- `DELETE /api/journal/:id` - Delete journal entry
- `POST /api/journal/:id/tags` - Add tag to journal entry
- `DELETE /api/journal/:id/tags/:tag` - Remove tag from journal entry

### Games
- `GET /api/games/types` - Get available game types
- `POST /api/games/stats` - Save game statistics
- `GET /api/games/patient/:patientId/stats` - Get game statistics by patient
- `GET /api/games/patient/:patientId/average-scores` - Get average scores
- `GET /api/games/patient/:patientId/progress/:gameType` - Get progress over time
- `GET /api/games/stats/:id` - Get single game statistics
- `GET /api/games/leaderboard/:gameType` - Get leaderboard

## 🎨 UI/UX Features

### Design Principles
- **Accessibility First**: Large buttons, high contrast, readable fonts
- **Role-based Theming**: Different color schemes for patients vs caregivers
- **Soft Pastels**: Calming color palette for Alzheimer's patients
- **Minimal Transitions**: Smooth, non-distracting animations
- **Bottom Navigation**: Easy thumb access for all users

### Patient Interface
- **Dashboard**: Today's medications, tasks, mood, and progress
- **Medications**: Simple "Taken/Skipped" buttons with clear status
- **Tasks**: Checkbox-based completion with due date tracking
- **Journal**: Text and image entries with mood selection
- **Games**: Memory and cognitive exercises with progress tracking

### Caregiver Interface
- **Dashboard**: Patient statistics and care insights
- **Patient Management**: View and manage multiple patients
- **Medication Management**: Add/edit patient medications
- **Task Management**: Create and assign tasks to patients
- **Journal Access**: Read and add supportive entries

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configured for specific origins
- **Helmet Security**: Security headers and protection
- **Input Validation**: Comprehensive validation with express-validator
- **Role-based Access**: Patients can only access their own data
- **Patient-Caregiver Validation**: Caregivers can only access linked patients

## 📁 Project Structure

```
adaptive-care/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and logger configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Authentication and validation middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions and seed script
│   │   └── server.js        # Main server file
│   ├── Dockerfile           # Docker configuration
│   ├── docker-compose.yml   # Docker Compose setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── screens/         # Screen components
│   │   │   ├── Auth/        # Authentication screens
│   │   │   ├── Patient/     # Patient-specific screens
│   │   │   ├── Caregiver/   # Caregiver-specific screens
│   │   │   └── Shared/      # Shared screens
│   │   ├── navigation/      # Navigation configuration
│   │   ├── context/         # React Context providers
│   │   ├── services/        # API service functions
│   │   ├── config/          # Theme and API configuration
│   │   └── utils/           # Utility functions
│   ├── App.js               # Main app component
│   └── package.json
└── README.md
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build Docker image: `docker build -t adaptive-care-backend .`
3. Deploy with Docker Compose or container orchestration

### Frontend Deployment
1. Build for production: `expo build`
2. Deploy to app stores or distribute as standalone app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🔮 Future Enhancements

- **Voice Commands**: Voice-activated medication reminders
- **Wearable Integration**: Smartwatch notifications and tracking
- **AI Insights**: Machine learning for care pattern analysis
- **Telemedicine**: Video calls between patients and caregivers
- **Medication Dispenser**: IoT integration with smart pill dispensers
- **Emergency Features**: Panic buttons and emergency contacts
- **Multi-language Support**: Internationalization for global use
- **Offline Mode**: Local data storage for unreliable connections

---

**Adaptive Care** - Empowering Alzheimer's patients and caregivers through technology. 🧠💙
