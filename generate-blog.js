const fs = require("fs");
const config = require("./config.json");

const topics = [
  "How to grow on Twitch in 2026",
  "Best multistreaming strategy for creators",
  "OBS vs Restream explained",
  "How to get more viewers on YouTube Live",
  "How streamers grow across multiple platforms",
  "Why multistreaming is the future of content"
];

function pick(arr){
  return arr[Math.floor(Math.random() * arr.length)];
}

function affiliate(){
  return `
    <a href="${config.affiliateLinks[0]}" target="_blank" rel="nofollow sponsored">Start Restream Free</a><br>
    <a href="${config.affiliateLinks[1]}" target="_blank" rel="nofollow sponsored">Try Restream Studio</a>
  `;
}

function internal(){
  return config.internalPages
    .map(p => `<a href="/restream.com/${p}">${p.replace(".html","")}</a>`)
    .join(" | ");
}

function html(topic){
  return `
<!DOCTYPE html>
<html>
<head>
<title>${topic}</title>
<meta name="robots" content="index, follow">
<style>
body{font-family:Arial;background:#0b0b10;color:#fff;padding:40px;line-height:1.6}
a{color:#ff3b30}
</style>
</head>

<body>

<h1>${topic}</h1>

<p>
This guide explains ${topic} and how creators can scale using multistreaming tools.
</p>

<h2>Why it matters</h2>
<p>Creators need reach across multiple platforms, not just one.</p>

<h2>Best tool</h2>
<p>Restream allows streaming to 30+ platforms simultaneously.</p>

${affiliate()}

<h2>Strategy</h2>
<p>Combine multistreaming + consistent content + platform diversification.</p>

<h2>Internal links</h2>
<p>${internal()}</p>

<footer style="margin-top:50px;color:#777;font-size:12px">
Affiliate disclosure: this page contains affiliate links.
</footer>

</body>
</html>
`;
}

function run(){
  const topic = pick(topics);
  const file = `post-${Date.now()}.html`;

  fs.writeFileSync(`posts/${file}`, html(topic));

  console.log("Generated:", file);
}

run();
