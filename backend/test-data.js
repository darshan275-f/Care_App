const mongoose = require('mongoose');
const User = require('./src/models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/adaptive-care', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const testData = async () => {
  await connectDB();
  
  try {
    // Find the caregiver
    const caregiver = await User.findOne({ email: 'satvik@gmail.com' })
      .populate('linkedPatients', 'name username email');
    
    console.log('Caregiver found:', caregiver);
    console.log('Linked patients:', caregiver?.linkedPatients);
    
    // Find the patient
    const patient = await User.findOne({ email: 'darshan@gmail.com' })
      .populate('linkedCaregivers', 'name email');
    
    console.log('Patient found:', patient);
    console.log('Linked caregivers:', patient?.linkedCaregivers);
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    mongoose.connection.close();
  }
};

testData();
