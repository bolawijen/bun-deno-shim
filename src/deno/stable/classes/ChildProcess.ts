import { CommandOutput } from "./Command";

export class ChildProcess {
    readonly status: Promise<CommandOutput> = Promise.resolve({} as CommandOutput);
    output(): Promise<{
        readonly stdout: Uint8Array;
        readonly stderr: Uint8Array;
    }>;
}