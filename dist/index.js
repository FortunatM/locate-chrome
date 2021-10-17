"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const child_process_1 = require("child_process");
const os_1 = require("os");
const d3_queue_1 = require("d3-queue");
var Platform;
(function (Platform) {
    Platform["macOS"] = "darwin";
    Platform["Windows"] = "win32";
    Platform["Linux"] = "linux";
})(Platform || (Platform = {}));
function getOSXPath(finisher) {
    const toExec = '/Contents/MacOS/Google Chrome';
    const regPath = '/Applications/Google Chrome.app' + toExec;
    const altPath = userHome(regPath.slice(1));
    const mdFindCmd = 'mdfind \'kMDItemDisplayName == "Google Chrome" && kMDItemKind == Application\'';
    (0, d3_queue_1.queue)(1)
        .defer(tryLocation, regPath, finisher)
        .defer(tryLocation, altPath, finisher)
        .defer(tryMd)
        .awaitAll(function () { finisher(null); });
    function tryMd(next) {
        (0, child_process_1.exec)(mdFindCmd, function (err, stdout) {
            if (err || !stdout)
                next();
            else
                finisher(stdout.trim() + toExec);
        });
    }
}
function getWinPath(finisher) {
    const winSuffix = '\\Google\\Chrome\\Application\\chrome.exe';
    const prefixes = [
        process.env.LOCALAPPDATA,
        process.env.PROGRAMFILES,
        process.env['PROGRAMFILES(X86)']
    ];
    (0, d3_queue_1.queue)(1)
        .defer(tryLocation, prefixes[0] + winSuffix, finisher)
        .defer(tryLocation, prefixes[1] + winSuffix, finisher)
        .defer(tryLocation, prefixes[2] + winSuffix, finisher)
        .awaitAll(function () { finisher(null); });
}
function getLinuxPath(finisher) {
    (0, child_process_1.exec)('which google-chrome', function (err, r) {
        if (err)
            throw err;
        finisher(r.trim());
    });
}
function tryLocation(locationPath, success, next) {
    if (fs.existsSync(locationPath)) {
        success(locationPath);
    }
    next();
}
function userHome(path) {
    const home = (0, os_1.homedir)();
    return path ? home.concat(path) : home;
}
function default_1(cb) {
    return new Promise((resolve) => {
        const finisher = cb || function (r) {
            resolve(r);
        };
        if (process.platform === Platform.macOS) {
            getOSXPath(finisher);
        }
        else if (process.platform === Platform.Windows) {
            getWinPath(finisher);
        }
        else {
            getLinuxPath(finisher);
        }
    });
}
exports.default = default_1;
