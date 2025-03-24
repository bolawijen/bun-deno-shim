export class ChildProcess {
    output(): Promise<{
        readonly stdout: Uint8Array;
        readonly stderr: Uint8Array;
    }>;
}