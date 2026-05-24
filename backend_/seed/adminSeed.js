const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const exists = await User.findOne({ role: 'admin' });
  if (exists) { console.log('Admin already exists!'); process.exit(); }

  const hashed = await bcrypt.hash('admin@123', 10);
  await User.create({
    name: 'Admin',
    email: 'admin@medibook.com',
    password: hashed,
    role: 'admin',
    isApproved: true,
  });
  console.log('Admin created!');
  console.log('Email: admin@medibook.com');
  console.log('Password: admin@123');
  process.exit();
});