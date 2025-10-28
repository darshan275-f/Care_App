const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Medication = require('../models/Medication');
const Task = require('../models/Task');
const JournalEntry = require('../models/JournalEntry');
const GameStats = require('../models/GameStats');

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Medication.deleteMany({});
    await Task.deleteMany({});
    await JournalEntry.deleteMany({});
    await GameStats.deleteMany({});

    console.log('Cleared existing data...');

    // Create sample patient
    const patient = await User.create({
      name: 'John Smith',
      email: 'patient@example.com',
      passwordHash: 'password123', // This will be hashed by the pre-save middleware
      role: 'patient',
      username: 'pat_1234'
    });

    console.log('Created patient:', patient.email);

    // Create sample caregiver
    const caregiver = await User.create({
      name: 'Jane Doe',
      email: 'caregiver@example.com',
      passwordHash: 'password123', // This will be hashed by the pre-save middleware
      role: 'caregiver'
    });

    // Link caregiver to patient
    await caregiver.linkPatient(patient._id);
    await patient.linkCaregiver(caregiver._id);

    console.log('Created caregiver:', caregiver.email);
    console.log('Linked caregiver to patient');

    // Create sample medications
    const medications = await Medication.create([
      {
        patientId: patient._id,
        name: 'Donepezil',
        dosage: '5mg',
        schedule: {
          type: 'daily',
          times: [{ hour: 8, minute: 0 }]
        },
        notes: 'Take with breakfast',
        createdBy: caregiver._id
      },
      {
        patientId: patient._id,
        name: 'Memantine',
        dosage: '10mg',
        schedule: {
          type: 'daily',
          times: [{ hour: 20, minute: 0 }]
        },
        notes: 'Take with dinner',
        createdBy: caregiver._id
      },
      {
        patientId: patient._id,
        name: 'Vitamin D',
        dosage: '1000 IU',
        schedule: {
          type: 'daily',
          times: [{ hour: 12, minute: 0 }]
        },
        notes: 'Take with lunch',
        createdBy: caregiver._id
      }
    ]);

    console.log('Created medications:', medications.length);

    // Mark some medications as taken
    const today = new Date();
    await medications[0].markTaken(today, 'Taken with breakfast');
    await medications[2].markTaken(today, 'Taken with lunch');

    // Create sample tasks
    const tasks = await Task.create([
      {
        patientId: patient._id,
        title: 'Take morning medications',
        description: 'Take Donepezil and Vitamin D with breakfast',
        dueDate: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        priority: 'high',
        category: 'medication',
        createdBy: caregiver._id
      },
      {
        patientId: patient._id,
        title: 'Doctor appointment',
        description: 'Annual checkup with Dr. Johnson',
        dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        priority: 'high',
        category: 'appointment',
        createdBy: caregiver._id
      },
      {
        patientId: patient._id,
        title: 'Light exercise',
        description: '15-minute walk around the neighborhood',
        dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        priority: 'medium',
        category: 'exercise',
        createdBy: caregiver._id
      },
      {
        patientId: patient._id,
        title: 'Call family',
        description: 'Call daughter Sarah',
        dueDate: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        priority: 'low',
        category: 'social',
        createdBy: caregiver._id
      }
    ]);

    console.log('Created tasks:', tasks.length);

    // Mark one task as completed
    await tasks[0].markCompleted('Completed successfully');

    // Create sample journal entries
    const journalEntries = await JournalEntry.create([
      {
        patientId: patient._id,
        authorId: patient._id,
        text: 'Had a good day today. Took my medications on time and went for a short walk. Feeling positive about the week ahead.',
        mood: 'happy',
        tags: ['medication', 'exercise', 'positive'],
        isPrivate: false
      },
      {
        patientId: patient._id,
        authorId: caregiver._id,
        text: 'John is doing well with his medication routine. He seems more alert and engaged in conversations. Will continue to monitor his progress.',
        mood: 'neutral',
        tags: ['medication', 'progress', 'monitoring'],
        isPrivate: true
      },
      {
        patientId: patient._id,
        authorId: patient._id,
        text: 'Feeling a bit confused today. Had trouble remembering where I put my keys. But I did remember to take my evening medication.',
        mood: 'sad',
        tags: ['confusion', 'memory', 'medication'],
        isPrivate: false
      }
    ]);

    console.log('Created journal entries:', journalEntries.length);

    // Create sample game statistics
    const gameStats = await GameStats.create([
      {
        patientId: patient._id,
        gameType: 'memory-match',
        score: 8,
        maxScore: 10,
        duration: 120,
        level: 1,
        difficulty: 'easy',
        accuracy: 80,
        attempts: 1,
        hintsUsed: 0,
        notes: 'Good performance on first try'
      },
      {
        patientId: patient._id,
        gameType: 'sequence-recall',
        score: 6,
        maxScore: 8,
        duration: 90,
        level: 1,
        difficulty: 'medium',
        accuracy: 75,
        attempts: 2,
        hintsUsed: 1,
        notes: 'Improved on second attempt'
      },
      {
        patientId: patient._id,
        gameType: 'word-association',
        score: 12,
        maxScore: 15,
        duration: 180,
        level: 2,
        difficulty: 'easy',
        accuracy: 80,
        attempts: 1,
        hintsUsed: 0,
        notes: 'Excellent word recall'
      }
    ]);

    console.log('Created game statistics:', gameStats.length);

    console.log('\n=== SEED DATA SUMMARY ===');
    console.log('Patient:', patient.email, '(Username:', patient.username, ')');
    console.log('Caregiver:', caregiver.email);
    console.log('Medications:', medications.length);
    console.log('Tasks:', tasks.length);
    console.log('Journal Entries:', journalEntries.length);
    console.log('Game Statistics:', gameStats.length);
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Patient: patient@example.com / password123');
    console.log('Caregiver: caregiver@example.com / password123');
    console.log('Patient Username: pat_1234');

  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
  await mongoose.connection.close();
  console.log('Seeding completed. Database connection closed.');
  process.exit(0);
};

// Run the seed function
runSeed();
