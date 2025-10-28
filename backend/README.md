# Adaptive Care Backend API

A comprehensive backend API for the Adaptive Care mobile application, designed to support Alzheimer's patients and their caregivers.

## Features

- **JWT Authentication** with access and refresh tokens
- **Role-based Access Control** (Patient/Caregiver)
- **Patient-Caregiver Linking** system
- **Medication Management** with adherence tracking
- **Task Management** with completion tracking
- **Journal System** with mood tracking
- **Game Statistics** for cognitive assessment
- **RESTful API** with comprehensive validation
- **Docker Support** for easy deployment
- **MongoDB** with optimized indexes

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing
- Express Validator for input validation
- Winston for logging
- Docker for containerization

## Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB 6.0+
- Docker (optional)

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup:**
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

3. **Start MongoDB:**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6.0
   
   # Or install MongoDB locally
   ```

4. **Seed the database:**
   ```bash
   npm run seed
   ```

5. **Start the server:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

### Using Docker

1. **Start with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Seed the database:**
   ```bash
   docker-compose exec backend npm run seed
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/link-patient` - Link caregiver to patient

### Patients
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

## Sample Data

After running the seed script, you'll have:

**Patient:**
- Email: `patient@example.com`
- Password: `password123`
- Username: `pat_1234`

**Caregiver:**
- Email: `caregiver@example.com`
- Password: `password123`

## Authentication Flow

1. **Patient Registration:**
   - Creates patient account
   - Generates unique username (e.g., `pat_1234`)
   - Returns username for sharing with caregiver

2. **Caregiver Registration:**
   - Requires patient username for linking
   - Links caregiver to patient account
   - Enables caregiver to manage patient data

3. **Login:**
   - Returns access token (15min) and refresh token (7 days)
   - Access token used for API requests
   - Refresh token used to get new access tokens

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation with express-validator
- Role-based access control
- Patient-caregiver relationship validation

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

### Project Structure
```
backend/
├── src/
│   ├── config/          # Database and logger configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication and validation middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions and seed script
│   └── server.js        # Main server file
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose setup
└── package.json
```

## Production Deployment

1. **Environment Variables:**
   - Set strong JWT secrets
   - Configure production MongoDB URI
   - Set NODE_ENV=production

2. **Docker Deployment:**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

3. **Health Check:**
   - Endpoint: `GET /health`
   - Returns server status and timestamp

## API Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": {
    // Response data
  }
}
```

Error responses include additional error details in development mode.

## Contributing

1. Follow the existing code structure
2. Add proper validation for new endpoints
3. Include error handling
4. Update documentation
5. Test with sample data

## License

MIT License - see LICENSE file for details.
