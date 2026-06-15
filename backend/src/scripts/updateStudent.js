const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const updateToAditya = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    console.log('Connected to MongoDB');

    // Find the user first to make sure it exists
    const existingUser = await db.collection('users').findOne({ email: 'student@university.edu' });
    let targetEmail = 'student@university.edu';
    
    if (!existingUser) {
      // maybe it's already aditya@university.edu
      const adityaUser = await db.collection('users').findOne({ email: 'aditya@university.edu' });
      if (adityaUser) {
        targetEmail = 'aditya@university.edu';
      } else {
        console.log('Student user not found!');
        process.exit(1);
      }
    }

    // update User
    await db.collection('users').updateOne(
      { email: targetEmail },
      { $set: { email: 'aditya@university.edu' } }
    );
    
    const user = await db.collection('users').findOne({ email: 'aditya@university.edu' });
    
    if (user) {
      // update Student
      await db.collection('students').updateOne(
        { userId: user._id },
        { $set: { firstName: 'Aditya', lastName: 'Kumar' } }
      );
      console.log('Successfully updated student to Aditya Kumar (aditya@university.edu)');
    }
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

updateToAditya();
