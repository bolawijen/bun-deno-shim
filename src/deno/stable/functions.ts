import fs from "fs";
import mapError from "../internal/errorMap.js";
import { errors } from "./variables.js";

// todo(dsherret): collapse all these files into here

export { isatty } from "tty";
export { addSignalListener } from "./functions/addSignalListener.js";
export { chdir } from "./functions/chdir.js";
export { chmod } from "./functions/chmod.js";
export { chmodSync } from "./functions/chmodSync.js";
export { chown } from "./functions/chown.js";
export { chownSync } from "./functions/chownSync.js";
export { close } from "./functions/close.js";
export { connect } from "./functions/connect.js";
export { connectTls } from "./functions/connectTls.js";
export { consoleSize } from "./functions/consoleSize.js";
export { copy } from "./functions/copy.js";
export { copyFile } from "./functions/copyFile.js";
export { copyFileSync } from "./functions/copyFileSync.js";
export { create } from "./functions/create.js";
export { createSync } from "./functions/createSync.js";
export { cwd } from "./functions/cwd.js";
export { execPath } from "./functions/execPath.js";
export { exit } from "./functions/exit.js";
export { fdatasync } from "./functions/fdatasync.js";
export { fdatasyncSync } from "./functions/fdatasyncSync.js";
export { fstat } from "./functions/fstat.js";
export { fstatSync } from "./functions/fstatSync.js";
export { fsync } from "./functions/fsync.js";
export { fsyncSync } from "./functions/fsyncSync.js";
export { ftruncate } from "./functions/ftruncate.js";
export { ftruncateSync } from "./functions/ftruncateSync.js";
export { gid } from "./functions/gid.js";
export { hostname } from "./functions/hostname.js";
export { inspect } from "./functions/inspect.js";
export { kill } from "./functions/kill.js";
export { link } from "./functions/link.js";
export { linkSync } from "./functions/linkSync.js";
export { listen } from "./functions/listen.js";
export { listenTls } from "./functions/listenTls.js";
export { loadavg } from "./functions/loadavg.js";
export { lstat } from "./functions/lstat.js";
export { lstatSync } from "./functions/lstatSync.js";
export { makeTempDir } from "./functions/makeTempDir.js";
export { makeTempDirSync } from "./functions/makeTempDirSync.js";
export { makeTempFile } from "./functions/makeTempFile.js";
export { makeTempFileSync } from "./functions/makeTempFileSync.js";
export { memoryUsage } from "./functions/memoryUsage.js";
export { mkdir } from "./functions/mkdir.js";
export { mkdirSync } from "./functions/mkdirSync.js";
export { open } from "./functions/open.js";
export { openSync } from "./functions/openSync.js";
export { osRelease } from "./functions/osRelease.js";
export { osUptime } from "./functions/osUptime.js";
export { read } from "./functions/read.js";
export { readDir } from "./functions/readDir.js";
export { readDirSync } from "./functions/readDirSync.js";
export { readFile } from "./functions/readFile.js";
export { readFileSync } from "./functions/readFileSync.js";
export { readLink } from "./functions/readLink.js";
export { readLinkSync } from "./functions/readLinkSync.js";
export { readSync } from "./functions/readSync.js";
export { readTextFile } from "./functions/readTextFile.js";
export { readTextFileSync } from "./functions/readTextFileSync.js";
export { realPath } from "./functions/realPath.js";
export { realPathSync } from "./functions/realPathSync.js";
export { remove } from "./functions/remove.js";
export { removeSignalListener } from "./functions/removeSignalListener.js";
export { removeSync } from "./functions/removeSync.js";
export { rename } from "./functions/rename.js";
export { renameSync } from "./functions/renameSync.js";
export { resolveDns } from "./functions/resolveDns.js";
export { Process, run } from "./functions/run.js";
export type { UnstableRunOptions } from "./functions/run.js";
export { serve } from "./functions/serve.js";
export { shutdown } from "./functions/shutdown.js";
export { stat } from "./functions/stat.js";
export { statSync } from "./functions/statSync.js";
export { symlink } from "./functions/symlink.js";
export { symlinkSync } from "./functions/symlinkSync.js";
export { test } from "./functions/test.js";
export { truncate } from "./functions/truncate.js";
export { truncateSync } from "./functions/truncateSync.js";
export { uid } from "./functions/uid.js";
export { watchFs } from "./functions/watchFs.js";
export { write } from "./functions/write.js";
export { writeFile } from "./functions/writeFile.js";
export { writeFileSync } from "./functions/writeFileSync.js";
export { writeSync } from "./functions/writeSync.js";
export { writeTextFile } from "./functions/writeTextFile.js";
export { writeTextFileSync } from "./functions/writeTextFileSync.js";
export { args } from "./variables/args.js";

export const futime: typeof Deno.futime = async function (rid, atime, mtime) {
  try {
    await new Promise<void>((resolve, reject) => {
      // doesn't exist in fs.promises
      fs.futimes(rid, atime, mtime, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    throw mapError(error);
  }
};

export const futimeSync: typeof Deno.futimeSync = function (rid, atime, mtime) {
  try {
    fs.futimesSync(rid, atime, mtime);
  } catch (error: any) {
    throw mapError(error);
  }
};

export const utime: typeof Deno.utime = async function (path, atime, mtime) {
  try {
    await fs.promises.utimes(path, atime, mtime);
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      throw new errors.NotFound(
        `No such file or directory (os error 2), utime '${path}'`,
      );
    }
    throw mapError(error);
  }
};

export const utimeSync: typeof Deno.utimeSync = function (path, atime, mtime) {
  try {
    fs.utimesSync(path, atime, mtime);
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      throw new errors.NotFound(
        `No such file or directory (os error 2), utime '${path}'`,
      );
    }
    throw mapError(error);
  }
};
