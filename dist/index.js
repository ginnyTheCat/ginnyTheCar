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
var memes_json_1 = __importDefault(require("./memes.json"));
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
function isRickRoll(url) {
    // TODO: Check for 30x redirects
    return url.includes("https://youtube.com/dQw4w9WgXcQ") || url.includes("https://youtu.be/dQw4w9WgXcQ");
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
    return maxKey;
}
function onMessage(msg) {
    if (isRickRoll(msg.content)) {
        msg.delete();
        msg.channel.sendMessage("I protected you from a rick roll");
        return;
    }
    var rCmd = undefined;
    if (msg.content.startsWith(PREFIX)) {
        rCmd = msg.content.slice(PREFIX.length);
    }
    else if (msg.channel.dm) {
        rCmd = msg.content;
    }
    if (rCmd == undefined) {
        return;
    }
    var _a = rCmd.split(" "), cmd = _a[0], args = _a.slice(1);
    switch (cmd) {
        case "emoji-text":
            msg.channel.sendMessage(args.map(toEmoji).join(" "));
            break;
        case "random-emojis":
            if (args.length !== 1)
                return;
            var amount = parseInt(args[0]);
            if (isNaN(amount))
                return;
            msg.channel.sendMessage(randomEmojis(amount));
            break;
        case "post":
            var vName = findMeme(args);
            if (vName === undefined)
                return;
            var vFile = "./memes/" + vName + ".mp4";
            if (fs_1.existsSync(vFile)) {
                msg.channel._internal.send("", { files: [vFile] });
            }
            else {
                msg.channel._internal.send("", { files: ["./memes/" + vName + ".mp3"] });
            }
            break;
        case "play":
            var aName = findMeme(args);
            if (aName === undefined)
                return;
            var aFile_1 = "./memes/" + aName + ".mp3";
            if (msg.platform instanceof xbot_1.Discord) {
                var voice = msg._internal.member.voice.channel;
                voice.join().then(function (conn) { return conn.play(aFile_1); }); // .on("finish", () => voice.leave()))
            }
            break;
    }
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
