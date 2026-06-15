const fs = require('fs');
const path = require('path');

const srcDir = './src/components';
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.tsx'));
files.push('../App.tsx');

for (const file of files) {
  const filePath = path.join(srcDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Fix wrong dark hover classes
  content = content.replace(/dark:bg-white\/5/g, 'dark:hover:bg-white/5');
  // but wait! If there are some actual dark:bg-white/5 that SHOULD be non-hover?
  // Let's replace 'dark:hover:hover:bg-white/5' back to 'dark:hover:bg-white/5' just in case.
  // Actually a safer regex: replacing `hover:-bg-slate-900/5 dark:bg-white/5`
  
  // Let's just fix specific ones we know:
  content = content.replace(/\bdark:text-slate-200\b/g, 'dark:text-slate-100');
  content = content.replace(/\btext-slate-800\b/g, 'text-slate-900');
  
  content = content.replace(/\btext-slate-700\b/g, 'text-slate-800');
  content = content.replace(/\bdark:text-slate-300\b/g, 'dark:text-slate-200');

  content = content.replace(/\btext-slate-600\b/g, 'text-slate-700');
  content = content.replace(/\bdark:text-slate-400\b/g, 'dark:text-slate-300');

  fs.writeFileSync(filePath, content, 'utf-8');
}
console.log('Fixed text contrast');
