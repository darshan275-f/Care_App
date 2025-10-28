// MongoDB initialization script
db = db.getSiblingDB('adaptive-care');

// Create user for the application
db.createUser({
  user: 'adaptive-care-user',
  pwd: 'adaptive-care-password',
  roles: [
    {
      role: 'readWrite',
      db: 'adaptive-care'
    }
  ]
});

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'passwordHash', 'role'],
      properties: {
        name: {
          bsonType: 'string',
          maxLength: 50
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        },
        role: {
          enum: ['patient', 'caregiver']
        }
      }
    }
  }
});

db.createCollection('medications');
db.createCollection('tasks');
db.createCollection('journalentries');
db.createCollection('gamestats');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true, sparse: true });
db.users.createIndex({ role: 1 });

db.medications.createIndex({ patientId: 1, isActive: 1 });
db.medications.createIndex({ 'takenDates.date': 1 });

db.tasks.createIndex({ patientId: 1, isActive: 1 });
db.tasks.createIndex({ dueDate: 1 });
db.tasks.createIndex({ completed: 1 });

db.journalentries.createIndex({ patientId: 1, createdAt: -1 });
db.journalentries.createIndex({ authorId: 1 });
db.journalentries.createIndex({ mood: 1 });

db.gamestats.createIndex({ patientId: 1, date: -1 });
db.gamestats.createIndex({ gameType: 1 });
db.gamestats.createIndex({ score: -1 });

print('Database initialization completed successfully!');
