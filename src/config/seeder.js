require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const connectDB = require('./db');
const seedData = async () => {
  try {
    await connectDB();

    await Registration.deleteMany();
    await Event.deleteMany();
    await User.deleteMany();
    console.log('🗑  Old database records cleared...');
    
    const organizer = await User.create({
      name: 'Alex Johnson (Organizer)',
      email: 'organizer@eventpulse.com',
      password: 'password123',
      role: 'organizer'
    });
    const attendee = await User.create({
      name: 'Sarah Miller (Attendee)',
      email: 'user@eventpulse.com',
      password: 'password123',
      role: 'user'
    });
    console.log('👤 Demo users created...');
    
    const events = [
      {
        title: 'Global AI & Neural Tech Summit 2026',
        description: 'Join leading minds from OpenAI, Google DeepMind, and Stanford to explore autonomous agents, multimodal architectures, and real-world AI deployment.',
        category: 'Technology',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
        location: 'Silicon Hub Center, San Francisco & Online',
        capacity: 120,
        registeredCount: 45,
        price: 49,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
        organizer: organizer._id
      },
      {
        title: 'Modern UI/UX Design Mastery Workshop',
        description: 'An interactive hands-on workshop covering design systems, micro-interactions, accessibility, and dynamic prototyping for modern web apps.',
        category: 'Design',
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        location: 'Online / Zoom Live Session',
        capacity: 80,
        registeredCount: 78,
        price: 0,
        image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80',
        organizer: organizer._id
      },
      {
        title: 'Indie Rock & Electronic Lights Night',
        description: 'An open-air evening with electrifying live bands, acoustic performances, and visual light projections under the stars.',
        category: 'Music',
        date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        location: 'Riverside Amphitheater, Austin TX',
        capacity: 350,
        registeredCount: 190,
        price: 25,
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
        organizer: organizer._id
      },
      {
        title: 'Venture Capital & Seed Funding Pitch Day',
        description: 'Connect with top angel investors and venture funds. 15 selected startups will pitch live with Q&A and networking lounge.',
        category: 'Business',
        date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        location: 'Grand Ballroom, Financial District, New York',
        capacity: 50,
        registeredCount: 32,
        price: 99,
        image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1000&q=80',
        organizer: organizer._id
      },
      {
        title: 'Node.js & Cloud Architecture Intensive',
        description: 'Deep dive into microservices, containerization, Redis caching, and resilient database clustering with Express & Mongo.',
        category: 'Workshop',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        location: 'Tech Hub Floor 4, Seattle',
        capacity: 30,
        registeredCount: 30, 
        price: 15,
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
        organizer: organizer._id
      }
    ];
    await Event.insertMany(events);
    console.log('🎉 5 Demo events successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};
const destroyData = async () => {
  try {
    await connectDB();
    await Registration.deleteMany();
    await Event.deleteMany();
    await User.deleteMany();
    console.log('🗑 Database completely cleared!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error destroying data:', error);
    process.exit(1);
  }
};
if (process.argv[2] === '-d') {
  destroyData();
} else {
  seedData();
}