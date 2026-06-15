const fs = require('fs');

let content = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');
content = content.replace(/shadow-\[0_0_20px_rgba\(255,255,255,0\.3\)\] hover:shadow-\[0_0_30px_rgba\(255,255,255,0\.5\)\]/pxg, 'shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.2)] dark:shadow-[0_0_20px_rgba(255,255,255,0.3)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]');

// let's do without Regex!
content = content.split('shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]').join('shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.2)] dark:shadow-[0_0_20px_rgba(255,255,255,0.3)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]');

fs.writeFileSync('src/components/LandingPage.tsx', content);

