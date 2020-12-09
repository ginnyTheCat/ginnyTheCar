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
var message_1 = require("@leluxnet/xbot/dist/message");
var memes = memes_json_1.default;
var PREFIX = ":";
var DISCORD_TOKEN = process.env.DISCORD_TOKEN;
var clients = [];
var discord;
if (DISCORD_TOKEN != undefined) {
    discord = new xbot_1.Discord(DISCORD_TOKEN);
    discord.start();
    clients.push(discord);
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
                    console.log(res.request.res.responseUrl);
                    return [2 /*return*/, res.request.res.responseUrl];
            }
        });
    });
}
var RICKROLL_IDS = ["dQw4w9WgXcQ", "oHg5SJYRHA0"];
function isRickRoll(url) {
    return __awaiter(this, void 0, void 0, function () {
        var resUrl;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, redirectUrl(url)];
                case 1:
                    resUrl = _a.sent();
                    return [2 /*return*/, !!RICKROLL_IDS.find(function (e) {
                            return (resUrl.startsWith("https://www.youtube.com/watch") &&
                                resUrl.includes("v=" + e)) ||
                                resUrl.startsWith("https://www.youtube.com/embed/" + e) ||
                                resUrl.startsWith("https://www.youtube-nocookie.com/embed/" + e);
                        })];
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
function onMessage(msg) {
    return __awaiter(this, void 0, void 0, function () {
        var rickRoll, rCmd, _a, cmd, args, _b, amount, m, emojis_1, text, m_1, name, vFile, name, file_1, voice;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, Promise.all(msg.content
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
                        case "emojify": return [3 /*break*/, 2];
                        case "random-emojis": return [3 /*break*/, 3];
                        case "question": return [3 /*break*/, 4];
                        case "poll": return [3 /*break*/, 6];
                        case "post": return [3 /*break*/, 8];
                        case "play": return [3 /*break*/, 9];
                    }
                    return [3 /*break*/, 10];
                case 2:
                    msg.channel.sendText(args.map(toEmoji).join(" "));
                    return [3 /*break*/, 10];
                case 3:
                    {
                        if (args.length !== 1)
                            return [2 /*return*/];
                        amount = parseInt(args[0]);
                        if (isNaN(amount))
                            return [2 /*return*/];
                        msg.channel.sendText(randomEmojis(amount));
                        return [3 /*break*/, 10];
                    }
                    _c.label = 4;
                case 4: return [4 /*yield*/, msg.channel.sendText(args.join(" "))];
                case 5:
                    m = _c.sent();
                    m.react("👍");
                    m.react("👎");
                    m.react("🤷");
                    return [3 /*break*/, 10];
                case 6:
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
                case 7:
                    m_1 = _c.sent();
                    emojis_1.reverse().forEach(function (e) { return m_1.react(e); });
                    return [3 /*break*/, 10];
                case 8:
                    {
                        name = findMeme(args);
                        if (name === undefined)
                            return [2 /*return*/];
                        vFile = "./memes/" + name + ".mp4";
                        if (fs_1.existsSync(vFile)) {
                            msg.channel.sendFile(vFile, name, message_1.FileType.VIDEO);
                        }
                        else {
                            msg.channel.sendFile("./memes/" + name + ".mp3", name, message_1.FileType.AUDIO);
                        }
                        return [3 /*break*/, 10];
                    }
                    _c.label = 9;
                case 9:
                    {
                        name = findMeme(args);
                        if (name === undefined)
                            return [2 /*return*/];
                        file_1 = "./memes/" + name + ".mp3";
                        if (msg.platform instanceof xbot_1.Discord) {
                            voice = msg._internal.member.voice.channel;
                            if (voice === undefined) {
                                msg.channel.sendText("You are not in a voice channel");
                            }
                            else {
                                voice.join().then(function (conn) { return conn.play(file_1); }); // .on("finish", () => voice.leave()))
                            }
                        }
                        else {
                            msg.channel.sendText("This command only works on Discord");
                        }
                        return [3 /*break*/, 10];
                    }
                    _c.label = 10;
                case 10: return [2 /*return*/];
            }
        });
    });
}
clients.forEach(function (c) {
    c.on("message", onMessage);
});
process.on("SIGINT", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Promise.all(clients.map(function (c) { return c.stop(); }))];
            case 1:
                _a.sent();
                process.exit();
                return [2 /*return*/];
        }
    });
}); });
