const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const multer=require("multer")
const fs=require("fs");
const axios=require("axios");

// Load environment variables
dotenv.config();

// Import configurations
const connectDB = require('./config/database');
const logger = require('./config/logger');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const medicationRoutes = require('./routes/medications');
const taskRoutes = require('./routes/tasks');
const journalRoutes = require('./routes/journal');
const gameRoutes = require('./routes/games');
const notificationRoutes = require('./routes/notifications');
const messageRoutes = require('./routes/messages');
const healthRoutes = require('./routes/health');
const tipRoutes = require('./routes/tips');

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:19006', // Expo dev server
      'http://localhost:3000',  // React dev server
      'exp://localhost:19000',  // Expo tunnel
      'exp://192.168.1.100:19000' // Expo LAN
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Adaptive Care API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Temp folder to store uploaded images
const upload = multer({ dest: 'uploads/' });

// POST /ocr - upload image and get text
app.post('/ocr', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Read file as base64
    const filePath = path.join(process.cwd(), req.file.path);
    const imageBase64 = fs.readFileSync(filePath, { encoding: 'base64' });

    // Call Google Vision API
    const body = {
      requests: [
        {
          image: { content: imageBase64 },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 10 }],
        },
      ],
    };

    const visionRes = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.VISION_API_KEY}`,
      body,
      { headers: { 'Content-Type': 'application/json' } }
    );

    fs.unlinkSync(filePath); // delete temp file

    const text = visionRes.data.responses?.[0]?.fullTextAnnotation?.text || '';
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    res.json({ lines });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process image' });
  }
});
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

app.post('/extract-medicine', async (req, res) => {
  const { ocrText } = req.body;
  console.log(ocrText);
  console.log(process.env.GEMINI_API_KEY);
  console.log(process.env.GEMINI_API_URL);

  if (!ocrText) return res.status(400).json({ error: 'OCR text is required' });

  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [
          {
            parts: [
              {
                text: `
You are a medicine information extractor.
Given this text from a medicine label (it may contain multiple lines or multiple medicines), extract information for **one medicine only** — pick the most relevant one., extract the following info in JSON ONLY:
- name
- dosageForm
- strength
- instructions
- manufacturer
- warnings
Text: "${ocrText}"
Return valid JSON only.
                `,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'x-goog-api-key': process.env.GEMINI_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(response);
    const reply = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) return res.status(500).json({ error: 'No reply from Gemini' });
    console.log(reply)
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Failed to parse JSON' });

    const medicineInfo = JSON.parse(jsonMatch[0]);

    res.json({ medicineInfo });
  } catch (err) {
    console.error('Gemini backend error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Gemini API call failed' });
  }
});


// API routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', messageRoutes);
app.use('/api', healthRoutes);
app.use('/api', tipRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0',() => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
