import { FileSink, Subprocess } from 'bun';
import { ChildProcess } from "./ChildProcess.js";

export class Command {
    #cmds = []; #opts = {}
    #stdout: string;
    #stderr: string;
    constructor(bin, opts = {}) {
        opts.args ||= []
        opts.args.unshift(bin)
        this.#cmds = opts.args
        this.#opts = opts

        const stdio_value = {
            'piped': 'pipe',
            'null': null
        }

        for (let stdio of [
            'stdin',
            'stdout',
            'stderr'
        ]) {
            opts[stdio] = stdio_value[opts[stdio]]
        }
    }

    spawn(): ChildProcess {
        const [bin, cmd] = this.#opts.args

        // this.#opts.stdout = 'inherit'
        this.#opts.stderr = 'inherit'
        // console.info(this.#cmds, this.#opts)
        const self = this

        const bun_subproc: Subprocess & {
            stdin: FileSink;
            stdout: ReadableStream;
        } = Bun.spawn(this.#cmds, this.#opts)
        //  as SubP {
        //     exited: Promise<number>;
        //     stdout: ReadableStream;
        //     stdin: FileSink;
        // }

        // s.unref()

        bun_subproc.exited.then((exit) => {
            // console.warn('bun_subproc exited', exit)
        })
 
        return {
            stdin: new WritableStream({
                write(chunk: Uint8Array, controller: WritableStreamDefaultController) {
                    // console.info({chunk, controller})
                    bun_subproc.stdin.write(chunk)
                    bun_subproc.stdin.flush()
                },
                close() {
                    bun_subproc.stdin.end()
                    // bun_subproc.kill()
                }
            }),
            output() {
                let s
                return Bun.readableStreamToArrayBuffer(bun_subproc.stdout)
                    // .then((buf: ArrayBuffer) => (console.warn(`stdout: byteLength:`, buf.byteLength, '\n', s=new TextDecoder().decode(buf), '\nstr.length:', s.length), buf))
                    .then((buf: ArrayBuffer) => new Uint8Array(buf))
                    // .then((arr: Uint8Array) => (console.warn(`arr.length:`, arr.length, arr.slice(880, 900), {end: arr.indexOf(0)}), arr))
                    .then((arr: Uint8Array) => arr.slice(0, Math.min(Math.max(arr.indexOf(0), 0), arr.length)))
                    .then((stdout: Uint8Array) => ({stdout}))
            }
            // async output() {
            //     return {
            //         stdout: await Bun.readableStreamToArrayBuffer(stdout),
            //         stderr,
            //     }
            // }
        } as ChildProcess
    }
}