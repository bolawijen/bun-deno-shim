///<reference path="../lib.deno.d.ts" />

import mapError from "../../internal/errorMap.js";
import { getFsFlag } from "../../internal/fs_flags.js";
import { write } from 'bun';

export const writeTextFile: typeof Deno.writeTextFile =
  async function writeTextFile(
    path,
    data,
    { append = false, create = true, createNew = false, mode, signal } = {},
  ) {
    const truncate = create && !append;
    const flag = getFsFlag({
      append,
      create,
      createNew,
      truncate,
      write: true,
    });
    try {
      await write(path, data, { mode })
      // if (mode !== undefined) await fs.chmod(path, mode);
    } catch (error) {
      throw mapError(error);
    }
  };
