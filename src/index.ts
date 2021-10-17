import * as fs from 'fs'
import {exec} from 'child_process'
import {homedir} from 'os';
import {queue} from 'd3-queue'

type Resolver = () =>  string;

enum Platform{
  macOS= 'darwin',
  Windows = 'win32',
  Linux = 'linux'
}

function getOSXPath(finisher: Function) {
  const toExec = '/Contents/MacOS/Google Chrome';
  const regPath = '/Applications/Google Chrome.app' + toExec;
  const altPath = userHome(regPath.slice(1));
  const mdFindCmd = 'mdfind \'kMDItemDisplayName == "Google Chrome" && kMDItemKind == Application\'';

  queue(1)
    .defer(tryLocation, regPath, finisher)
    .defer(tryLocation, altPath, finisher)
    .defer(tryMd)
    .awaitAll(function() { finisher(null); });

  function tryMd(next: Function) {
    exec(mdFindCmd, function(err, stdout) {
      if (err || !stdout) next();
      else finisher(stdout.trim() + toExec);
    })
  }
}

function getWinPath(finisher: Function) {
  const winSuffix = '\\Google\\Chrome\\Application\\chrome.exe';
  const prefixes = [
    process.env.LOCALAPPDATA,
    process.env.PROGRAMFILES,
    process.env['PROGRAMFILES(X86)']
  ];

  queue(1)
    .defer(tryLocation, prefixes[0] + winSuffix, finisher)
    .defer(tryLocation, prefixes[1] + winSuffix, finisher)
    .defer(tryLocation, prefixes[2] + winSuffix, finisher)
    .awaitAll(function() { finisher(null); });
}

function getLinuxPath(finisher: Function) {
  exec('which google-chrome', function(err, r) {
    if (err) throw err;
    finisher(r.trim());
  });
}

function tryLocation(locationPath: string, success: Function, next: Function) {
  if(fs.existsSync(locationPath)){
    success(locationPath)
  }
  next()
}

function userHome(path?: string){
  const home = homedir()
  return path ?  home.concat(path) : home
}

export default function(cb?: Resolver): Promise<string>{
  return new Promise((resolve) => {
    const finisher = cb || function(r: string) {
      resolve(r);
    };

    if (process.platform === Platform.macOS) {
      getOSXPath(finisher);
    } else if (process.platform === Platform.Windows) {
      getWinPath(finisher);
    } else {
      getLinuxPath(finisher);
    }
  });
}

