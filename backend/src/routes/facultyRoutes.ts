import express from 'express';
import Faculty from '../models/Faculty';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Get all faculty
router.get('/', async (req, res) => {
  try {
    const faculty = await Faculty.find().sort({ firstName: 1 });
    res.json(faculty);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AI Search Faculty
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Search query is required' });

    // Get all faculty data for context
    const allFaculty = await Faculty.find().select('_id firstName lastName department designation researchInterests bio');
    
    // Create prompt for Groq
    const systemPrompt = `You are an intelligent faculty search assistant for EduSphere University.
Your task is to find the best matching professors for the student's query.
Here is the JSON list of all faculty members:
${JSON.stringify(allFaculty)}

The student is searching for: "${query}"

Based on the researchInterests, department, and bio, return ONLY a valid JSON array of the "_id" strings of the top matching faculty members. Do not include any other text, markdown formatting, or explanation. Just the JSON array. Example: ["60d5ecb8b392d700153c3d5a", "60d5ecb8b392d700153c3d5b"]`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Return the JSON array now.' }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.2,
      max_tokens: 1000,
    });

    let resultIds = [];
    try {
      let rawContent = completion.choices[0]?.message?.content || '[]';
      // Clean up potential markdown formatting (e.g. ```json [...] ```)
      rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
      resultIds = JSON.parse(rawContent);
    } catch (parseError) {
      console.error("AI Search Parse Error:", parseError);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    // Fetch the full faculty profiles for the matched IDs
    const matchedFaculty = await Faculty.find({ _id: { $in: resultIds } });
    
    // Sort them to match the order returned by AI (most relevant first)
    const sortedFaculty = resultIds.map(id => matchedFaculty.find(f => f._id.toString() === id)).filter(Boolean);

    res.json(sortedFaculty);
  } catch (err: any) {
    console.error("AI Faculty Search error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get a single faculty by id
router.get('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ error: 'Faculty not found' });
    res.json(faculty);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AI Chat with Faculty Persona
router.post('/:id/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ error: 'Faculty not found' });

    const systemPrompt = `
You are ${faculty.firstName} ${faculty.lastName}, a ${faculty.designation} in the ${faculty.department} department at EduSphere University.
Your research interests are: ${faculty.researchInterests.join(', ')}.
Your bio: ${faculty.bio}

Instructions:
1. Act exclusively as this professor. Do not break character.
2. Answer the student's questions politely, professionally, and academically.
3. Keep answers concise but highly informative, drawing upon your research interests.
4. If a question is entirely unrelated to academia, your field, or university matters, politely guide the conversation back to your expertise.
    `.trim();

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 500,
    });

    res.json({ response: completion.choices[0]?.message?.content || "I'm currently away from my desk." });
  } catch (err: any) {
    console.error("Faculty Chat error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Draft AI Intro Email
router.post('/:id/draft-intro', async (req, res) => {
  try {
    const { studentDept } = req.body;
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ error: 'Faculty not found' });

    const systemPrompt = `You are an expert professional academic email writer.
Write a 3-paragraph introductory email from a student in the ${studentDept || 'University'} department to Professor ${faculty.firstName} ${faculty.lastName}.
The professor's research interests are: ${faculty.researchInterests.join(', ')}.
The goal of the email is to express interest in their research and ask for a 15-minute introductory meeting.
Do not include placeholders like [Your Name] at the end, just end with "Best regards,".
Make it sound professional, polite, and enthusiastic.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Please draft the email now.' }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      max_tokens: 500,
    });

    res.json({ email: completion.choices[0]?.message?.content || "Error generating email." });
  } catch (err: any) {
    console.error("Draft Intro error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endorse Faculty
router.post('/:id/endorse', async (req, res) => {
  try {
    const { trait } = req.body;
    if (!trait) return res.status(400).json({ error: 'Trait is required' });

    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ error: 'Faculty not found' });

    const endorsementIndex = faculty.endorsements.findIndex(e => e.trait === trait);
    if (endorsementIndex > -1) {
      faculty.endorsements[endorsementIndex].count += 1;
    } else {
      faculty.endorsements.push({ trait, count: 1 });
    }

    await faculty.save();
    res.json(faculty);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Book Office Hours
router.post('/:id/book-office-hours', async (req, res) => {
  try {
    const { day, startTime } = req.body;
    // In a real app, this would create an Appointment document.
    // For now, we simulate success.
    res.json({ message: `Successfully booked office hours on ${day} at ${startTime}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
