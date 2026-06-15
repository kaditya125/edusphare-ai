import { ChatMessage, Faculty, Notice, Document } from '../types';

export const initialChatMessages: ChatMessage[] = [];

export const facultyData: Faculty[] = [
  {
    id: 'f1',
    name: 'Dr. Sarah Chen',
    designation: 'Professor',
    department: 'Computer Science',
    researchInterests: ['Artificial Intelligence', 'Machine Learning', 'Neural Networks'],
    email: 'sarah.chen@edusphere.edu',
    location: 'Tech Hub, Room 402',
    status: 'available',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=b6e3f4'
  },
  {
    id: 'f2',
    name: 'Prof. Marcus Johnson',
    designation: 'Associate Professor',
    department: 'Data Science',
    researchInterests: ['Big Data', 'Database Systems', 'Cloud Computing'],
    email: 'marcus.j@edusphere.edu',
    location: 'Innovation Center, Room 215',
    status: 'busy',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Marcus&backgroundColor=c0aede'
  },
  {
    id: 'f3',
    name: 'Dr. Elena Rodriguez',
    designation: 'Assistant Professor',
    department: 'Cybersecurity',
    researchInterests: ['Network Security', 'Cryptography', 'Ethical Hacking'],
    email: 'elena.r@edusphere.edu',
    location: 'Tech Hub, Room 310',
    status: 'offline',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Elena&backgroundColor=ffd8b4'
  }
];

export const noticesData: Notice[] = [
  {
    id: 'n1',
    title: 'Fall Semester MCA Examination Schedule',
    category: 'Examinations',
    date: 'Oct 24, 2024',
    description: 'The final examination schedule for all MCA batches has been published. Please review your respective timetables.',
    priority: 'high',
    pinned: true
  },
  {
    id: 'n2',
    title: 'Global Tech Scholarship 2025 Applications Open',
    category: 'Scholarships',
    date: 'Oct 22, 2024',
    description: 'Applications for the Global Tech Scholarship are now open. Eligible students from Computer Science and IT departments can apply.',
    priority: 'medium',
    pinned: false
  },
  {
    id: 'n3',
    title: 'Campus Placement Drive: Top Tier Companies',
    category: 'Placements',
    date: 'Oct 20, 2024',
    description: 'Registration for Phase 1 of campus placements begins next week. Mandatory briefing session on Friday in the main auditorium.',
    priority: 'high',
    pinned: false
  }
];

export const documentsData: Document[] = [
  {
    id: 'd1',
    name: 'MCA_Syllabus_2024_2025.pdf',
    uploadDate: 'Oct 15, 2024',
    size: '2.4 MB',
    pages: 45,
    status: 'ready'
  },
  {
    id: 'd2',
    name: 'Student_Code_of_Conduct_v2.pdf',
    uploadDate: 'Oct 12, 2024',
    size: '1.1 MB',
    pages: 18,
    status: 'ready'
  },
  {
    id: 'd3',
    name: 'Research_Guidelines_PhD_CS.pdf',
    uploadDate: 'Today',
    size: '4.8 MB',
    pages: 62,
    status: 'processing'
  }
];
