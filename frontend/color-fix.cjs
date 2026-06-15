const fs = require('fs');

const files = [
  'src/components/KnowledgeHub.tsx',
  'src/components/NoticeBoard.tsx',
  'src/components/FacultyDirectory.tsx',
  'src/components/LandingPage.tsx',
  'src/components/AdminDashboard.tsx',
  'src/components/StudentDashboard.tsx',
  'src/components/ChatInterface.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Fix primary
  content = content.replace(/\btext-primary-400\b/g, 'text-primary-600 dark:text-primary-400');
  
  // Fix emerald
  content = content.replace(/\btext-emerald-400\b/g, 'text-emerald-600 dark:text-emerald-400');

  // Fix amber
  content = content.replace(/\btext-amber-400\b/g, 'text-amber-600 dark:text-amber-400');

  // Fix blue
  content = content.replace(/\btext-blue-400\b/g, 'text-blue-600 dark:text-blue-400');

  // Fix red
  content = content.replace(/\btext-red-400\b/g, 'text-red-600 dark:text-red-400');

  // Fix indigo
  content = content.replace(/\btext-indigo-400\b/g, 'text-indigo-600 dark:text-indigo-400');

  fs.writeFileSync(file, content);
});

console.log('Fixed accent colors');
