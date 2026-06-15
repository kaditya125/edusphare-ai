import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Faculty from './src/models/Faculty';

dotenv.config();

const facultyData = [
  {
    employeeId: 'f1',
    firstName: 'Sarah',
    lastName: 'Chen',
    designation: 'Professor',
    department: 'Computer Science',
    researchInterests: ['Artificial Intelligence', 'Machine Learning', 'Neural Networks'],
    email: 'sarah.chen@edusphere.edu',
    location: 'Tech Hub, Room 402',
    status: 'available',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=b6e3f4',
    bio: 'Dr. Sarah Chen is a leading researcher in Artificial Intelligence, focusing on deep learning architectures and their applications in natural language processing. She has published over 50 papers in top-tier AI conferences and is passionate about mentoring students in AI research.'
  },
  {
    employeeId: 'f2',
    firstName: 'Marcus',
    lastName: 'Johnson',
    designation: 'Associate Professor',
    department: 'Data Science',
    researchInterests: ['Big Data', 'Database Systems', 'Cloud Computing'],
    email: 'marcus.j@edusphere.edu',
    location: 'Innovation Center, Room 215',
    status: 'busy',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Marcus&backgroundColor=c0aede',
    bio: 'Prof. Marcus Johnson specializes in scalable database systems and cloud-native architectures. With 10 years of industry experience before joining academia, he brings a practical perspective to his Data Science and Big Data courses. He is currently researching distributed consensus algorithms.'
  },
  {
    employeeId: 'f3',
    firstName: 'Elena',
    lastName: 'Rodriguez',
    designation: 'Assistant Professor',
    department: 'Cybersecurity',
    researchInterests: ['Network Security', 'Cryptography', 'Ethical Hacking'],
    email: 'elena.r@edusphere.edu',
    location: 'Tech Hub, Room 310',
    status: 'offline',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Elena&backgroundColor=ffd8b4',
    bio: 'Dr. Elena Rodriguez is an expert in network security and cryptography. She leads the university cyber defense team and organizes the annual capture-the-flag (CTF) competition. Her research focuses on post-quantum cryptography and securing IoT devices against sophisticated cyber attacks.'
  },
  {
    employeeId: 'f4',
    firstName: 'Anil',
    lastName: 'Kumar',
    designation: 'Professor',
    department: 'Computer Science',
    researchInterests: ['Algorithms', 'Computational Complexity', 'Graph Theory'],
    email: 'anil.kumar@edusphere.edu',
    location: 'Tech Hub, Room 405',
    status: 'available',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Anil&backgroundColor=ffdfba',
    bio: 'Prof. Anil Kumar is a distinguished professor of Computer Science with over two decades of teaching experience. His research revolves around advanced graph algorithms and computational complexity. He is well known for his clear, rigorous teaching style and his dedication to fundamental computer science.'
  },
  {
    employeeId: 'f5',
    firstName: 'Priya',
    lastName: 'Sharma',
    designation: 'Associate Professor',
    department: 'Data Science',
    researchInterests: ['Natural Language Processing', 'Data Mining', 'Predictive Analytics'],
    email: 'priya.sharma@edusphere.edu',
    location: 'Innovation Center, Room 312',
    status: 'busy',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Priya&backgroundColor=ffffba',
    bio: 'Dr. Priya Sharma bridges the gap between raw data and actionable insights. Her pioneering work in NLP specifically targets low-resource languages, aiming to make AI more inclusive. She frequently collaborates with industry partners on data-driven predictive modeling.'
  },
  {
    employeeId: 'f6',
    firstName: 'Rajesh',
    lastName: 'Iyer',
    designation: 'Assistant Professor',
    department: 'Cybersecurity',
    researchInterests: ['Blockchain', 'Distributed Ledger Technology', 'Smart Contracts'],
    email: 'rajesh.iyer@edusphere.edu',
    location: 'Tech Hub, Room 320',
    status: 'available',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Rajesh&backgroundColor=baffc9',
    bio: 'Dr. Rajesh Iyer is deeply passionate about decentralized systems and blockchain technology. He teaches courses on smart contract development and security auditing. His current research investigates the scalability and privacy trade-offs of next-generation distributed ledgers.'
  },
  {
    employeeId: 'f7',
    firstName: 'Meera',
    lastName: 'Desai',
    designation: 'Professor',
    department: 'Computer Science',
    researchInterests: ['Human-Computer Interaction', 'UX Design', 'Accessibility'],
    email: 'meera.desai@edusphere.edu',
    location: 'Design Studio, Room 101',
    status: 'offline',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Meera&backgroundColor=ffb3ba',
    bio: 'Prof. Meera Desai leads the Human-Computer Interaction lab. She is a strong advocate for inclusive design and digital accessibility. Her research explores how diverse user groups interact with emerging technologies like AR/VR and how to design interfaces that empower everyone.'
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI is not defined');
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    try {
      await Faculty.collection.drop();
      console.log('Dropped existing faculties collection');
    } catch (e) {
      console.log('Collection did not exist yet');
    }

    await Faculty.insertMany(facultyData);
    console.log('Seeded faculty data successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
