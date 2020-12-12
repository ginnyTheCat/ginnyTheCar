import {
  Discord,
  envPlatforms,
  Message,
  stopOnSignal,
  youtube,
  twitch,
} from "@leluxnet/xbot";
import { FileType } from "@leluxnet/xbot/dist/message"; // tmp

import { createReadStream, existsSync, unlink } from "fs";
import { find as findEmoji, hasEmoji, random as randomEmoji } from "node-emoji";
import axios from "axios";
import { PassThrough, Readable } from "stream";

import { Memes } from "./memes";
import _memes from "./memes.json";
const memes: Memes = <Memes>_memes;

const PREFIX = ":";

const youtubeApiKey = process.env.YOUTUBE_API_KEY;
if (youtubeApiKey === undefined) {
  console.error(`"YOUTUBE_API_KEY" env variable not set`);
  process.exit(1);
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

async function redirectUrl(url: string): Promise<string> {
  const res = await axios.get(url);
  return res.request.res.responseUrl;
}

const RICKROLL_IDS = ["dQw4w9WgXcQ", "oHg5SJYRHA0"];

async function isRickRoll(url: string) {
  const resUrl = await redirectUrl(url);

  const id = youtube.getVideoId(resUrl);
  return id !== null && RICKROLL_IDS.includes(id);
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

  return input.includes("earrape") ? `${maxKey}_earrape` : maxKey;
}

async function onMessage(msg: Message) {
  const rickRoll = await Promise.all(
    msg.content
      .split(" ")
      .filter((e) => e.startsWith("http://") || e.startsWith("https://"))
      .map(isRickRoll)
  ).then((e) => e.includes(true));

  if (rickRoll) {
    msg.delete();
    msg.channel.sendText(
      `I protected you from \`${msg.author.name}\`'s rick roll`
    );
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
    case "help": {
      msg.channel.sendText(
        "`emojify <text>`: Replaces words from the text with emojis\n" +
          "`random-emojis <number>`: Sends x random emojis\n" +
          "`question <text>`: Sends the question and reactions to answer it\n" +
          "`poll <text> <emojis>`: Sends the text and reacts with the emojis\n" +
          "`post <tags>`: Posts the meme found by the tags\n" +
          "`play <tags>`: Plays the meme found by the tags"
      );
      break;
    }
    case "emojify":
      msg.channel.sendText(args.map(toEmoji).join(" "));
      break;
    case "random-emojis": {
      if (args.length !== 1) return;
      const amount = parseInt(args[0]);
      if (isNaN(amount)) return;

      msg.channel.sendText(randomEmojis(amount));
      break;
    }
    case "question": {
      const m = await msg.channel.sendText(args.join(" "));

      m.react("👍");
      m.react("👎");
      m.react("🤷");

      break;
    }
    case "poll": {
      console.log(args);

      const emojis: string[] = [];
      args
        .slice()
        .reverse()
        .find((e) => {
          // TODO: Discord emote support
          if (hasEmoji(e)) {
            emojis.push(e);
            return false;
          }
          return true;
        });

      const text = args.slice(0, args.length - emojis.length).join(" ");

      const m = await msg.channel.sendText(text);
      emojis.reverse().forEach((e) => m.react(e));

      break;
    }
    case "post": {
      const name = findMeme(args);
      if (name === undefined) return;
      const vFile = `./memes/${name}.mp4`;

      if (existsSync(vFile)) {
        msg.channel.sendFile(name, createReadStream(vFile), FileType.VIDEO);
      } else {
        msg.channel.sendFile(
          name,
          createReadStream(`./memes/${name}.mp3`),
          FileType.AUDIO
        );
      }
      break;
    }
    case "play": {
      if (!(msg.platform instanceof Discord)) {
        msg.channel.sendText("This command only works on Discord");
        return;
      }

      const voice = msg._internal.member.voice.channel;
      if (voice === undefined) {
        msg.channel.sendText("You are not in a voice channel");
        return;
      }

      if (args.length < 2) return;

      var stream;

      switch (args[0]) {
        case "m": {
          const name = findMeme(args.splice(1));
          if (name === undefined) return;

          stream = createReadStream(`./memes/${name}.mp3`);
          break;
        }
        case "yt": {
          var id = youtube.getVideoId(args[0]);
          if (id === null) {
            const info = await youtube.search(
              args.splice(1).join(" "),
              youtubeApiKey!
            );

            if (info === undefined) return;
            id = info.id;
          }

          const data = await youtube.audioStream(id, {});
          stream = data.stream;
          break;
        }
        case "tw": {
          stream = await twitch.audioStream(args[1]);
          break;
        }
      }

      if (stream === undefined) return;

      const conn = await voice.join();
      conn.play(stream); // .on("finish", () => voice.leave()))

      break;
    }
  }
}

const clients = envPlatforms();

clients.forEach((c) => {
  c.on("message", onMessage);
  c.start();
});

stopOnSignal(clients);
