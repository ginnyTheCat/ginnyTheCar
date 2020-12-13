"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var xbot_1 = require("@leluxnet/xbot");
var fs_1 = require("fs");
var node_emoji_1 = require("node-emoji");
var axios_1 = __importDefault(require("axios"));
var memes_json_1 = __importDefault(require("./memes.json"));
var memes = memes_json_1.default;
var PREFIX = ":";
var youtubeApiKey = process.env.YOUTUBE_API_KEY;
if (youtubeApiKey === undefined) {
    console.error("\"YOUTUBE_API_KEY\" env variable not set");
    process.exit(1);
}
var tagMap = {};
var _loop_1 = function (name, m) {
    m.tags.forEach(function (t) {
        if (tagMap[t] === undefined) {
            tagMap[t] = [];
        }
        tagMap[t].push(name);
    });
};
for (var _i = 0, _a = Object.entries(memes); _i < _a.length; _i++) {
    var _b = _a[_i], name = _b[0], m = _b[1];
    _loop_1(name, m);
}
function redirectUrl(url) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.get(url)];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, res.request.res.responseUrl];
            }
        });
    });
}
var RICKROLL_IDS = ["dQw4w9WgXcQ", "oHg5SJYRHA0"];
function isRickRoll(url) {
    return __awaiter(this, void 0, void 0, function () {
        var resUrl, id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, redirectUrl(url)];
                case 1:
                    resUrl = _a.sent();
                    id = xbot_1.youtube.getVideoId(resUrl);
                    return [2 /*return*/, id !== null && RICKROLL_IDS.includes(id)];
            }
        });
    });
}
function toEmoji(name) {
    var found = node_emoji_1.find(name);
    if (found === undefined) {
        return name;
    }
    else {
        return found.emoji;
    }
}
function randomEmojis(count) {
    var arr = new Array(count);
    for (var i = 0; i < count; i++) {
        arr[i] = node_emoji_1.random().emoji;
    }
    return arr.join("");
}
function findMeme(input) {
    var res = {};
    input.forEach(function (i) {
        var names = tagMap[i.toLowerCase()];
        if (names === undefined)
            return;
        names.forEach(function (n) {
            if (res[n] === undefined) {
                res[n] = 1;
            }
            else {
                res[n]++;
            }
        });
    });
    console.log(res);
    var maxKey;
    var maxCount = 0;
    for (var _i = 0, _a = Object.entries(res); _i < _a.length; _i++) {
        var _b = _a[_i], name = _b[0], count = _b[1];
        if (count > maxCount) {
            maxCount = count;
            maxKey = name;
        }
    }
    return input.includes("earrape") ? maxKey + "_earrape" : maxKey;
}
function getStream(args, download, uploadLimit) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, name, vName, id, info, data, fileName, stream;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = args[0];
                    switch (_a) {
                        case "m": return [3 /*break*/, 1];
                        case "yt": return [3 /*break*/, 2];
                        case "tw": return [3 /*break*/, 6];
                    }
                    return [3 /*break*/, 8];
                case 1:
                    {
                        name = findMeme(args);
                        if (name === undefined)
                            return [2 /*return*/];
                        vName = "./memes/" + name + ".mp4";
                        if (download && fs_1.existsSync(vName)) {
                            return [2 /*return*/, {
                                    fileName: name + ".mp4",
                                    name: name,
                                    stream: fs_1.createReadStream(vName),
                                    type: xbot_1.FileType.VIDEO,
                                }];
                        }
                        else {
                            return [2 /*return*/, {
                                    fileName: name + ".mp3",
                                    name: name,
                                    stream: fs_1.createReadStream("./memes/" + name + ".mp3"),
                                    type: xbot_1.FileType.VIDEO,
                                }];
                        }
                    }
                    _b.label = 2;
                case 2:
                    id = xbot_1.youtube.getVideoId(args[0]);
                    if (!(id === null)) return [3 /*break*/, 4];
                    return [4 /*yield*/, xbot_1.youtube.search(args.join(" "), youtubeApiKey)];
                case 3:
                    info = _b.sent();
                    if (info === undefined)
                        return [2 /*return*/];
                    id = info.id;
                    _b.label = 4;
                case 4: return [4 /*yield*/, xbot_1.youtube.stream(id, {
                        video: download,
                        sizeLimit: uploadLimit,
                    })];
                case 5:
                    data = _b.sent();
                    if (data === undefined)
                        return [2 /*return*/];
                    fileName = data.info.title.toLowerCase().replace(" ", "-");
                    return [2 /*return*/, {
                            fileName: download ? fileName + ".mp4" : fileName + ".mp3",
                            name: data.info.title,
                            stream: data.stream,
                            type: download ? xbot_1.FileType.VIDEO : xbot_1.FileType.AUDIO,
                        }];
                case 6:
                    if (download)
                        return [2 /*return*/];
                    return [4 /*yield*/, xbot_1.twitch.audioStream(args[0])];
                case 7:
                    stream = _b.sent();
                    return [2 /*return*/, stream === undefined
                            ? undefined
                            : {
                                fileName: "audio.mp3",
                                name: "",
                                stream: stream,
                                type: xbot_1.FileType.AUDIO,
                            }];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function onMessage(msg) {
    return __awaiter(this, void 0, void 0, function () {
        var rickRoll, rCmd, _a, cmd, args, _b, amount, m, emojis_1, text, m_1, data, voice, data, conn, e_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 15, , 16]);
                    return [4 /*yield*/, Promise.all(msg.content
                            .split(" ")
                            .filter(function (e) { return e.startsWith("http://") || e.startsWith("https://"); })
                            .map(isRickRoll)).then(function (e) { return e.includes(true); })];
                case 1:
                    rickRoll = _c.sent();
                    if (rickRoll) {
                        msg.delete();
                        msg.channel.sendText("I protected you from `" + msg.author.name + "`'s rick roll");
                        return [2 /*return*/];
                    }
                    rCmd = undefined;
                    if (msg.content.startsWith(PREFIX)) {
                        rCmd = msg.content.slice(PREFIX.length);
                    }
                    else if (msg.channel.dm) {
                        rCmd = msg.content;
                    }
                    if (rCmd == undefined) {
                        return [2 /*return*/];
                    }
                    _a = rCmd.split(" "), cmd = _a[0], args = _a.slice(1);
                    _b = cmd;
                    switch (_b) {
                        case "help": return [3 /*break*/, 2];
                        case "emojify": return [3 /*break*/, 3];
                        case "random-emojis": return [3 /*break*/, 4];
                        case "question": return [3 /*break*/, 5];
                        case "poll": return [3 /*break*/, 7];
                        case "post": return [3 /*break*/, 9];
                        case "play": return [3 /*break*/, 11];
                    }
                    return [3 /*break*/, 14];
                case 2:
                    {
                        msg.channel.sendText("`emojify <text>`: Replaces words from the text with emojis\n" +
                            "`random-emojis <number>`: Sends x random emojis\n" +
                            "`question <text>`: Sends the question and reactions to answer it\n" +
                            "`poll <text> <emojis>`: Sends the text and reacts with the emojis\n" +
                            "`post <tags>`: Posts the meme found by the tags\n" +
                            "`play <tags>`: Plays the meme found by the tags");
                        return [3 /*break*/, 14];
                    }
                    _c.label = 3;
                case 3:
                    msg.channel.sendText(args.map(toEmoji).join(" "));
                    return [3 /*break*/, 14];
                case 4:
                    {
                        if (args.length !== 1)
                            return [2 /*return*/];
                        amount = parseInt(args[0]);
                        if (isNaN(amount))
                            return [2 /*return*/];
                        msg.channel.sendText(randomEmojis(amount));
                        return [3 /*break*/, 14];
                    }
                    _c.label = 5;
                case 5: return [4 /*yield*/, msg.channel.sendText(args.join(" "))];
                case 6:
                    m = _c.sent();
                    m.react("👍");
                    m.react("👎");
                    m.react("🤷");
                    return [3 /*break*/, 14];
                case 7:
                    console.log(args);
                    emojis_1 = [];
                    args
                        .slice()
                        .reverse()
                        .find(function (e) {
                        // TODO: Discord emote support
                        if (node_emoji_1.hasEmoji(e)) {
                            emojis_1.push(e);
                            return false;
                        }
                        return true;
                    });
                    text = args.slice(0, args.length - emojis_1.length).join(" ");
                    return [4 /*yield*/, msg.channel.sendText(text)];
                case 8:
                    m_1 = _c.sent();
                    emojis_1.reverse().forEach(function (e) { return m_1.react(e); });
                    return [3 /*break*/, 14];
                case 9: return [4 /*yield*/, getStream(args, true, msg.platform.uploadLimit)];
                case 10:
                    data = _c.sent();
                    if (data === undefined)
                        return [2 /*return*/];
                    msg.channel.sendFile(data.fileName, data.stream, data.type);
                    return [3 /*break*/, 14];
                case 11:
                    if (!(msg.platform instanceof xbot_1.Discord)) {
                        throw new xbot_1.MsgError("This command only works on Discord");
                    }
                    voice = msg._internal.member.voice.channel;
                    if (voice === undefined) {
                        throw new xbot_1.MsgError("You are not in a voice channel");
                    }
                    return [4 /*yield*/, getStream(args, false, undefined)];
                case 12:
                    data = _c.sent();
                    if (data === undefined)
                        return [2 /*return*/];
                    return [4 /*yield*/, voice.join()];
                case 13:
                    conn = _c.sent();
                    conn.play(data.stream); // .on("finish", () => voice.leave()))
                    return [3 /*break*/, 14];
                case 14: return [3 /*break*/, 16];
                case 15:
                    e_1 = _c.sent();
                    if (e_1 instanceof xbot_1.MsgError) {
                        msg.channel.sendText(e_1.msg);
                    }
                    else {
                        throw e_1;
                    }
                    return [3 /*break*/, 16];
                case 16: return [2 /*return*/];
            }
        });
    });
}
var clients = xbot_1.envPlatforms();
clients.forEach(function (c) {
    c.on("message", onMessage);
    c.start();
});
xbot_1.stopOnSignal(clients);
