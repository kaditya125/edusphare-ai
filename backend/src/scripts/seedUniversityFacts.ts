import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { generateEmbedding } from '../ai/embeddingService';
import { upsertKnowledgeVectors, KnowledgeMetadata } from '../services/pineconeService';

dotenv.config();

const facts = [
  "Tuition Fees: Undergraduate programs cost $15,000 per semester. Postgraduate programs cost $18,000 per semester. International students have an additional $5,000 international fee per semester.",
  "Library: The Central Library is open 24/7 during exam weeks. Normally, it opens from 7 AM to 11 PM. It contains over 2 million physical volumes and provides access to 500,000 e-journals.",
  "Housing: On-campus dormitories cost $4,000 per semester, which includes a meal plan. Off-campus housing typically ranges from $600 to $1,200 per month.",
  "Scholarships: The Presidential Scholarship offers a 100% tuition waiver for students with a CGPA above 3.9. The Merit Scholarship offers a 50% waiver for CGPA above 3.7.",
  "Health Center: The Student Health Center provides free basic medical checkups, counseling, and mental health support. It is open Monday to Friday from 8 AM to 6 PM.",
  "Sports Facilities: The campus features an Olympic-sized swimming pool, an indoor basketball arena, a fully equipped gym, and a full-size football stadium. Access is free for all enrolled students.",
  "Career Services: The Career Development Center holds bi-annual career fairs featuring over 200 top tech companies including Google, Microsoft, and Amazon. They also offer free resume reviews.",
  "Clubs & Societies: There are over 150 student-run clubs, including the Robotics Club, Debate Society, AI Research Group, and the Cultural Arts Association.",
  "Course Registration: The deadline to drop a course without a 'W' (withdrawal) grade is the end of the second week of the semester. Adding courses is permitted only in the first week.",
  "Transportation: A free campus shuttle runs every 15 minutes connecting the main campus, student dorms, and the downtown train station.",
  "Dining: The Main Dining Hall serves buffet-style meals. There are also 5 cafes across campus, including a fully vegan cafe in the Science building.",
  "IT Services: The campus provides free high-speed Wi-Fi (Eduroam) in all buildings. Students also get a free Microsoft Office 365 subscription and unlimited Google Drive storage.",
  "Study Rooms: Private study rooms in the library can be booked up to 48 hours in advance using the EduSphere app. Maximum booking duration is 3 hours per group.",
  "Graduation: To be eligible for graduation, an undergraduate student must complete at least 120 credit hours with a minimum CGPA of 2.0.",
  "Plagiarism Policy: The university maintains a strict zero-tolerance policy for academic dishonesty. Plagiarized assignments result in an automatic 'F' grade for the course."
];

async function seedFacts() {
  console.log("Generating embeddings for university facts...");
  const vectors = [];
  
  for (const fact of facts) {
    const id = new mongoose.Types.ObjectId().toHexString();
    const embedding = await generateEmbedding(fact);
    
    vectors.push({
      id: id,
      values: embedding,
      metadata: {
        mongoId: id,
        sourceType: 'policy',
        content: fact,
        accessLevel: 'public',
        lastUpdated: new Date().toISOString()
      } as KnowledgeMetadata
    });
    console.log(`Generated embedding for fact: ${fact.substring(0, 50)}...`);
  }
  
  console.log(`Upserting ${vectors.length} facts to Pinecone...`);
  await upsertKnowledgeVectors(vectors);
  console.log("Successfully seeded university facts to Pinecone.");
  process.exit(0);
}

seedFacts().catch(console.error);
