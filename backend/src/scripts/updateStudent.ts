import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Student from '../models/Student';

dotenv.config();

const updateToAditya = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    const user = await User.findOneAndUpdate(
      { email: 'student@university.edu' }, 
      { email: 'aditya@university.edu' },
      { new: true }
    );

    if (user) {
      await Student.findOneAndUpdate(
        { userId: user._id }, 
        { firstName: 'Aditya', lastName: 'Kumar' },
        { new: true }
      );
      console.log('Successfully updated student to Aditya Kumar (aditya@university.edu)');
    } else {
      console.log('Student user not found! Please run npm run seed first.');
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

updateToAditya();
