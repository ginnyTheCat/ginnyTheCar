import { Discord, Message, Platform } from "@leluxnet/xbot";
import { existsSync } from "fs";
import { find as findEmoji, random as randomEmoji } from "node-emoji";
import axios from "axios";

import { Memes } from "./memes";
import _memes from "./memes.json";
const memes: Memes = <Memes>_memes;

const PREFIX = ":";

const { DISCORD_TOKEN } = process.env;
const clients: Platform[] = [];

var discord: Discord;
if (DISCORD_TOKEN != undefined) {
  discord = new Discord(DISCORD_TOKEN);
  discord.start();

  clients.push(discord);
}

const tagMap: { [tag: string]: string[] } = {};
for (const [name, m] of Object.entries(memes)) {
  m.tags.forEach((t) => {
    if (tagMap[t] === undefined) {
      tagMap[t] = [];
    }
    tagMap[t].push(name);
  });
}

async function redirectUrl(url: string) {
  const res = await axios.get(url, {
    maxRedirects: 0,
    validateStatus: (s) => s === 302,
  });
  return res.headers.location;
}

const RICKROLL_IDS = ["dQw4w9WgXcQ", "oHg5SJYRHA0"];

async function isRickRoll(url: string) {
  const resUrl = await redirectUrl(url);
  return !!RICKROLL_IDS.find(
    (e) =>
      resUrl.startsWith(`https://www.youtube.com/watch?v=${e}`) ||
      resUrl.startsWith(`https://www.youtube.com/embed/${e}`) ||
      resUrl.startsWith(`https://www.youtube-nocookie.com/embed/${e}`)
  );
}

function toEmoji(name: string) {
  const found = findEmoji(name);
  if (found === undefined) {
    return name;
  } else {
    return found.emoji;
  }
}

function randomEmojis(count: number) {
  const arr = new Array(count);
  for (let i = 0; i < count; i++) {
    arr[i] = randomEmoji().emoji;
  }
  return arr.join("");
}

function findMeme(input: string[]) {
  const res: { [name: string]: number } = {};
  input.forEach((i) => {
    const names = tagMap[i.toLowerCase()];
    if (names === undefined) return;
    names.forEach((n) => {
      if (res[n] === undefined) {
        res[n] = 1;
      } else {
        res[n]++;
      }
    });
  });
  console.log(res);

  var maxKey;
  var maxCount = 0;
  for (const [name, count] of Object.entries(res)) {
    if (count > maxCount) {
      maxCount = count;
      maxKey = name;
    }
  }

  return maxKey;
}

async function onMessage(msg: Message) {
  if (await isRickRoll(msg.content)) {
    msg.delete();
    msg.channel.sendMessage("I protected you from a rick roll");
    return;
  }

  var rCmd = undefined;
  if (msg.content.startsWith(PREFIX)) {
    rCmd = msg.content.slice(PREFIX.length);
  } else if (msg.channel.dm) {
    rCmd = msg.content;
  }

  if (rCmd == undefined) {
    return;
  }

  const [cmd, ...args] = rCmd.split(" ");

  switch (cmd) {
    case "emoji-text":
      msg.channel.sendMessage(args.map(toEmoji).join(" "));
      break;
    case "random-emojis":
      if (args.length !== 1) return;
      const amount = parseInt(args[0]);
      if (isNaN(amount)) return;

      msg.channel.sendMessage(randomEmojis(amount));
      break;
    case "post":
      const vName = findMeme(args);
      if (vName === undefined) return;
      const vFile = `./memes/${vName}.mp4`;

      if (existsSync(vFile)) {
        msg.channel._internal.send("", { files: [vFile] });
      } else {
        msg.channel._internal.send("", { files: [`./memes/${vName}.mp3`] });
      }
      break;
    case "play":
      const aName = findMeme(args);
      if (aName === undefined) return;
      const aFile = `./memes/${aName}.mp3`;

      if (msg.platform instanceof Discord) {
        const voice = msg._internal.member.voice.channel;
        voice.join().then((conn: any) => conn.play(aFile)); // .on("finish", () => voice.leave()))
      }

      break;
  }
}

clients.forEach((c) => {
  c.on("message", onMessage);
});

process.on("SIGINT", async () => {
  await Promise.all(clients.map((c) => c.stop()));
  process.exit();
});
