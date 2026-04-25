const fs = require("fs");
const config = require("./config.json");

const posts = fs.readdirSync("./posts");

function pick(arr){
  return arr[Math.floor(Math.random() * arr.length)];
}

// extract topic from filename or generate simple hook
function buildCaption(){
  const topics = [
    "How to grow on Twitch in 2026",
    "Best way to stream everywhere at once",
    "Why creators use multistreaming",
    "OBS vs Restream explained",
    "How to get more viewers instantly"
  ];

  const topic = pick(topics);

  return `
🚀 ${topic}

Stream to 30+ platforms at once using Restream.

👉 ${config.affiliateLinks[0]}

#streaming #twitch #youtube #contentcreator
`;
}

// MOCK POST FUNCTION (replace with real APIs later)
function postToSocial(platform, content){
  console.log(`\n[POSTING TO ${platform}]`);
  console.log(content);
}

// MAIN
function run(){

  const caption = buildCaption();

  // simulate posting to multiple platforms
  postToSocial("Twitter/X", caption);
  postToSocial("Facebook", caption);
  postToSocial("LinkedIn", caption);

  fs.writeFileSync(`social-log-${Date.now()}.txt`, caption);

  console.log("\nSocial posts generated successfully.");
}

run();
