const { execSync } = require("child_process");

// SETTINGS
const BLOG_DAYS = 4; // how many blog posts per week (3–5 recommended)

// pick random days each week
function getBlogDays(){
  const days = [1,2,3,4,5,6,0]; // Mon–Sun
  return days.sort(() => 0.5 - Math.random()).slice(0, BLOG_DAYS);
}

const today = new Date().getDay(); // 0 = Sunday

// store weekly schedule
let scheduleFile = "schedule.json";
let schedule;

// load or create schedule
try {
  schedule = require("./schedule.json");
} catch {
  schedule = { blogDays: getBlogDays() };
  require("fs").writeFileSync(scheduleFile, JSON.stringify(schedule, null, 2));
}

// reset weekly (Sunday)
if(today === 0){
  schedule = { blogDays: getBlogDays() };
  require("fs").writeFileSync(scheduleFile, JSON.stringify(schedule, null, 2));
  console.log("New weekly schedule:", schedule.blogDays);
}

// RUN LOGIC

console.log("Today:", today);

if(schedule.blogDays.includes(today)){
  console.log("📄 Publishing blog...");
  execSync("node generate-blog.js", { stdio: "inherit" });

  console.log("🧭 Updating sitemap...");
  execSync("node generate-sitemap.js", { stdio: "inherit" });
} else {
  console.log("⏭ Skipping blog today");
}

// ALWAYS POST SOCIAL
console.log("📣 Posting to social...");
execSync("node social-poster.js", { stdio: "inherit" });

console.log("✅ Done");
