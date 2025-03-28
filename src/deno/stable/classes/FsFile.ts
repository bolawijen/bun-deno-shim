///<reference path="../lib.deno.d.ts" />

import * as fs from "fs";
import * as stream from "stream";
import { fstat } from "../functions/fstat.js";
import { fstatSync } from "../functions/fstatSync.js";
import { ftruncate } from "../functions/ftruncate.js";
import { ftruncateSync } from "../functions/ftruncateSync.js";
import { fdatasync } from "../functions/fdatasync.js";
import { fdatasyncSync } from "../functions/fdatasyncSync.js";
import { read } from "../functions/read.js";
import { readSync } from "../functions/readSync.js";
import { write } from "../functions/write.js";
import { writeSync } from "../functions/writeSync.js";
import { BunFile } from "bun";

(Symbol as any).dispose ??= Symbol("Symbol.dispose");
(Symbol as any).asyncDispose ??= Symbol("Symbol.asyncDispose");


class FileRefFd implements BunFile {
  constructor(readonly fd: number) {}
}

export class FsFile implements Deno.FsFile {
  #closed = false;
  #fileRef: BunFile
  readonly readable: ReadableStream<Uint8Array>

  constructor(readonly rid: number|BunFile) {
    if (typeof rid === 'number') {
      this.#fileRef = new FileRefFd(rid)
    } else {
      this.#fileRef = rid
    }

    this.readable = this.#fileRef.stream()
  }

  [Symbol.dispose]() {
    if (!this.#closed) {
      this.close();
    }
  }

  async write(p: Uint8Array): Promise<number> {
    return await write(this.rid, p);
  }

  writeSync(p: Uint8Array): number {
    return writeSync(this.rid, p);
  }

  async truncate(len?: number): Promise<void> {
    await ftruncate(this.rid, len);
  }

  truncateSync(len?: number): void {
    return ftruncateSync(this.rid, len);
  }

  read(p: Uint8Array): Promise<number | null> {
    return read(this.rid, p);
  }

  readSync(p: Uint8Array): number | null {
    return readSync(this.rid, p);
  }

  seek(_offset: number, _whence: Deno.SeekMode): Promise<number> {
    throw new Error("Method not implemented.");
  }

  seekSync(_offset: number, _whence: Deno.SeekMode): number {
    throw new Error("Method not implemented.");
  }

  async stat(): Promise<Deno.FileInfo> {
    return await fstat(this.rid);
  }

  statSync(): Deno.FileInfo {
    return fstatSync(this.rid);
  }

  sync(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  syncSync(): void {
    throw new Error("Method not implemented.");
  }

  syncData(): Promise<void> {
    return fdatasync(this.rid);
  }

  syncDataSync(): void {
    return fdatasyncSync(this.rid);
  }

  utime(_atime: number | Date, _mtime: number | Date): Promise<void> {
    throw new Error("Method not implemented.");
  }

  utimeSync(_atime: number | Date, _mtime: number | Date): void {
    throw new Error("Method not implemented.");
  }

  close(): void {
    this.#closed = true;
    fs.closeSync(this.rid);
  }

  #readableStream: ReadableStream<Uint8Array> | undefined;
  get readable(): ReadableStream<Uint8Array> {
    if (this.#readableStream == null) {
      const nodeStream = fs.createReadStream(null as any, {
        fd: this.rid,
        autoClose: false,
      });
      this.#readableStream = stream.Readable.toWeb(nodeStream);
    }
    return this.#readableStream;
  }

  #writableStream: WritableStream<Uint8Array> | undefined;
  get writable(): WritableStream<Uint8Array> {
    if (this.#writableStream == null) {
      const nodeStream = fs.createWriteStream(null as any, {
        fd: this.rid,
        autoClose: false,
      });
      this.#writableStream = stream.Writable.toWeb(nodeStream);
    }
    return this.#writableStream;
  }
}

const File = FsFile;

export { File };
