import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./src/models/User').default;
  const u = await User.findOne({role: 'student'});
  
  // Create a token
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET || 'fallback_secret');
  
  const d1 = new Date(2026, 4, 1).toISOString();
  const d2 = new Date(2026, 7, 0).toISOString();
  
  console.log(`Fetching from /api/calendar/events?start=${d1}&end=${d2}`);
  const res = await fetch(`http://localhost:5000/api/calendar/events?start=${d1}&end=${d2}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await res.text();
  console.log('Status:', res.status);
  try {
    console.log('Data:', JSON.parse(data).length, 'events');
    if (JSON.parse(data).length > 0) {
      console.log('First event:', JSON.parse(data)[0]);
    }
  } catch (e) {
    console.log('Raw data:', data);
  }
  process.exit(0);
});
