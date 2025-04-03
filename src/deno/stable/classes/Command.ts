import { FileSink, Subprocess, readableStreamToArrayBuffer } from 'bun';
import { ChildProcess } from "./ChildProcess.js";


export type CommandOutput = {
    signal: string | null,
    success: boolean,
    code: number,
}

export class Command {
    #cmds = []
    #opts = {}
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

        if (process.parsedArgs.values?.['allow-all']) {
            this.#cmds.push('--allow-all' as never)
        }
    }

    spawn(): ChildProcess {
        // const [bin, cmd] = this.#opts.args

        // this.#opts.stdout = 'inherit'
        this.#opts.stderr = 'inherit'
        // console.info(this.#cmds, this.#opts)
        const self = this

        const bun_subproc: Subprocess & {
            stdin: FileSink;
            stdout: ReadableStream;
        } = Bun.spawn(this.#cmds, this.#opts)

        const status: CommandOutput = {
            signal: null,
            success: true,
            code: 0,
        }

        //  as SubP {
        //     exited: Promise<number>;
        //     stdout: ReadableStream;
        //     stdin: FileSink;
        // }

        // s.unref()

        bun_subproc.exited.then((exit) => {
            // console.warn('bun_subproc exited', exit)
            if (exit !== 0) {
                status.code = exit
                status.success = false
                status.signal = bun_subproc.signalCode
            }
        })
 
        // console.info({process_args: process.parsedArgs, cmds: this.#cmds, opts: this.#opts, bun_subproc})
        return {
            get pid() { return bun_subproc.pid },

            get stdin() {
                return new WritableStream({
                    write(chunk: Uint8Array, controller: WritableStreamDefaultController) {
                        // console.info({chunk, controller})
                        bun_subproc.stdin.write(chunk)
                        bun_subproc.stdin.flush()
                    },
                    close() {
                        bun_subproc.stdin.end()
                        // bun_subproc.kill()
                    }
                })
            },

            get stdout() { return bun_subproc.stdout },
            get stderr() { return bun_subproc.stderr },
            get status() { return Promise.resolve(status) },

            async output() {
                const arr = new Uint8Array(await readableStreamToArrayBuffer(bun_subproc.stdout))
                return { stdout: arr.slice(0, Math.min(Math.max(arr.indexOf(0), 0), arr.length)) } as never
            }
        } as ChildProcess
    }

    output() {
        return this.spawn().status
    }

    outputSync(): CommandOutput {
    }
}