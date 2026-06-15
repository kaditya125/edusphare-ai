const fs = require('fs');

const replaceInFile = (file, replacements) => {
  let content = fs.readFileSync(file, 'utf8');
  replacements.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
  });
  fs.writeFileSync(file, content);
};

replaceInFile('src/components/Sidebar.tsx', [
  [/from-white to-slate-400/g, 'from-slate-900 to-slate-500 dark:from-white dark:to-slate-400']
]);

replaceInFile('src/components/LandingPage.tsx', [
  [/from-white to-slate-500/g, 'from-slate-900 to-slate-600 dark:from-white dark:to-slate-500'],
  [/bg-white text-slate-900 hover:bg-slate-100/g, 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'],
  [/bg-slate-100 text-slate-900 rounded-2xl/g, 'bg-primary-600 text-white dark:bg-slate-100 dark:text-slate-900 rounded-2xl'],
  [/shadow-\[0_0_20px_rgba\(255,255,255,0\\\.3\)\] hover:shadow-\[0_0_30px_rgba\(255,255,255,0\\\.5\)\]/g, 'shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.2)] dark:shadow-[0_0_20px_rgba(255,255,255,0.3)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]']
]);
