import {
  Discord,
  FileType,
  envPlatforms,
  Message,
  stopOnSignal,
  youtube,
  twitch,
  MsgError,
  soundcloud,
} from "@leluxnet/xbot";

import { createReadStream, existsSync } from "fs";
import { find as findEmoji, hasEmoji, random as randomEmoji } from "node-emoji";
import axios from "axios";
import { Readable } from "stream";

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

interface StreamData {
  fileName: string;
  name: string;
  stream: Readable;
  type: FileType;
}

async function getStream(
  args: string[],
  download: boolean,
  uploadLimit?: number
): Promise<StreamData | undefined> {
  const type = args.shift();
  switch (type) {
    case "m": {
      const name = findMeme(args);
      if (name === undefined) return;

      const vName = `./memes/${name}.mp4`;
      if (download && existsSync(vName)) {
        return {
          fileName: `${name}.mp4`,
          name,
          stream: createReadStream(vName),
          type: FileType.VIDEO,
        };
      } else {
        return {
          fileName: `${name}.mp3`,
          name,
          stream: createReadStream(`./memes/${name}.mp3`),
          type: FileType.VIDEO,
        };
      }
    }
    case "yt": {
      var id = youtube.getVideoId(args[0]);
      if (id === null) {
        const info = await youtube.search(args.join(" "), youtubeApiKey!);

        if (info === undefined) return;
        id = info.id;
      }

      const data = await youtube.stream(id, {
        video: download,
        sizeLimit: uploadLimit,
      });
      if (data === undefined) return;

      const fileName = data.info.title.toLowerCase().replace(" ", "-");
      return {
        fileName: download ? `${fileName}.mp4` : `${fileName}.mp3`,
        name: data.info.title,
        stream: data.stream,
        type: download ? FileType.VIDEO : FileType.AUDIO,
      };
    }
    case "tw": {
      if (download) return;

      const stream = await twitch.audioStream(args[0]);
      return stream === undefined
        ? undefined
        : {
            fileName: "audio.mp3",
            name: "",
            stream,
            type: FileType.AUDIO,
          };
    }
    case "sc": {
      const data = soundcloud.getSongData(args[0]);
      if (data === null) return;

      const stream = await soundcloud.stream(data);
      return {
        fileName: `${data.name}.mp3`,
        name: "",
        stream,
        type: FileType.AUDIO,
      };
    }
  }
}

async function onMessage(msg: Message) {
  try {
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
        var help =
          "`emojify <text>`: Replaces words from the text with emojis\n" +
          "`random-emojis <number>`: Sends x random emojis\n" +
          "`question <text>`: Sends the question and reactions to answer it\n" +
          "`poll <text> <emojis>`: Sends the text and reacts with the emojis\n" +
          "`post <m|yt|sc> <tags>`: Posts a meme, YouTube video or song from SoundCloud";

        if (msg.platform instanceof Discord) {
          help +=
            "\n`play <m|yt|tw|sc>`: Plays a meme, YouTube video, Twitch stream or song from SoundCloud in a voice channel";
        }

        msg.channel.sendText(help);
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
        const data = await getStream(args, true, msg.platform.uploadLimit);
        if (data === undefined) return;

        msg.channel.sendFile(data.fileName, data.stream, data.type);
        break;
      }
      case "play": {
        if (!(msg.platform instanceof Discord)) {
          throw new MsgError("This command only works on Discord");
        }

        const voice = msg._internal.member.voice.channel;
        if (voice === null) {
          throw new MsgError("You are not in a voice channel");
        }

        const data = await getStream(args, false, undefined);
        if (data === undefined) return;

        const conn = await voice.join();
        conn.play(data.stream); // .on("finish", () => voice.leave()))

        break;
      }
    }
  } catch (e) {
    if (e instanceof MsgError) {
      msg.channel.sendText(e.msg);
    } else {
      throw e;
    }
  }
}

const clients = envPlatforms();

clients.forEach((c) => {
  c.on("message", onMessage);
  c.start();
});

stopOnSignal(clients);
