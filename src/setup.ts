import { exec as execCallback } from "child_process";
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";

import { Meme, Memes } from "./memes";
import _memes from "./memes.json";
const memes: Memes = <Memes>_memes;

function exec(cmd: string) {
  return new Promise((resolve, reject) => {
    execCallback(cmd, (error, stdout, stderr) => {
      if (error != null) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function downloadVideo(name: string, meme: Meme) {
  const info = await ytdl.getInfo(meme.id);

  const audio = ytdl.filterFormats(info.formats, "audioonly")[0].url;
  const video = ytdl.filterFormats(info.formats, "videoonly")[0].url;

  const file = `memes/${name}.mp`;
  const fileE = `memes/${name}_earrape.mp`;

  const earrape = [{ filter: "acrusher", options: [0.1, 1, 64, 0, "log"] }];

  const duration =
    meme.to === undefined ? undefined : meme.to - (meme.from || 0);

  const cmd = ffmpeg().input(audio);

  if (!meme.audioOnly) {
    cmd.input(video);
  }

  const addOutput = (path: string) => {
    cmd.output(path);

    if (meme.from !== undefined) {
      cmd.seekOutput(meme.from);
    }
    if (duration !== undefined) {
      cmd.duration(duration);
    }

    return cmd;
  };

  addOutput(`${file}3`);
  addOutput(`${fileE}3`).audioFilter(earrape);

  if (!meme.audioOnly) {
    addOutput(`${file}4`);
    addOutput(`${fileE}4`).audioFilter(earrape);
  }

  return new Promise<void>((resolve, reject) =>
    cmd
      .on("error", (err) => reject(err))
      .on("end", () => resolve())
      .run()
  );
}

(async () => {
  var entries = Object.entries(memes);

  const args = process.argv.slice(2);
  if (args.length > 0) {
    entries = entries.filter(([name]) => args.includes(name));
  }

  var i = 0;
  for (const [name, m] of entries) {
    console.log(`[${++i}/${entries.length}] ${name}`);
    await downloadVideo(name, m);
  }
})();
