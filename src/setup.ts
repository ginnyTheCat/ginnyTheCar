import { exec as execCallback } from "child_process";
import { unlink } from "fs";

import { Meme, Memes } from "./memes";
import _memes from "./tmp.json";
const memes: Memes = <Memes> _memes;

function exec(cmd: string) {
    return new Promise((resolve, reject) => {       
        execCallback(cmd, (error, stdout, stderr) => {
            if (error != null) {
                reject(error)
            } else {
                resolve(stdout)
            }
        });
    })
}

function deleteFile(name: string) {
    return new Promise((resolve, _) => unlink(name, resolve))
}

function getFfmpeg(input: string, name: string, meme: Meme) {
    const parts = []
    if (meme.from !== undefined) {
        parts.push(`-ss ${meme.from}`)
    }
    if (meme.to !== undefined) {
        parts.push(`-to ${meme.to}`)
    }
    const cut = parts.join(" ")

    // cut has to be at the outputs NOT the input. This is a bug (https://trac.ffmpeg.org/ticket/8189)
    return `ffmpeg -y -i ${input} ${cut} "memes/${name}.mp3"` + (meme.audioOnly ? "" : ` ${cut} "memes/${name}.mp4"`)
}

async function downloadVideo(name: string, meme: Meme) {
    await exec(`youtube-dl -o - "${meme.url}" | ` + getFfmpeg("pipe:0", name, meme))
}

async function downloadVideoBest(name: string, meme: Meme) {
    const tmpFile = `memes/${name}.tmp.mkv`
    await exec(`youtube-dl --merge-output-format mkv -o "${tmpFile}" ${meme.url}`)

    await exec(getFfmpeg(tmpFile, name, meme))

    await deleteFile(tmpFile)
}

(async () => {
    for (const [name, m] of Object.entries(memes)) {
        console.log(`Downloading ${name}`)
        downloadVideo(name, m).then(() => console.log(`Downloaded ${name}`))
    }
})()