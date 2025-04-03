import { HttpServer, NetAddr, ServeHandler, ServeHandlerInfo, ServeOptions } from "../types.js";

export const serve: typeof Deno.serve = function (opts: ServeHandler & ServeOptions, handler: ServeHandler): HttpServer {
    // console.info(`${import.meta.path}#Deno.serve`,{opts, handler})
    
    // if (opts instanceof Function) {
    //   handler = opts
    // }
  
    try {
      const server = Bun.serve({
        port: opts.port,
        async fetch(req: Request): Response|Promise<Response> {
          const remote = this.requestIP(req)
          const info: ServeHandlerInfo = {
            remoteAddr: {
              transport: 'tcp',
              port: remote.port,
              hostname: remote?.address || 'localhost',
            }
          }
          // console.info('Bun.serve#fetch.req',req)
          const res: Response = await (opts instanceof Function ? opts : handler)(req, info)
          // console.info('Bun.serve#fetch.res',res)
  
          if (res.status === 404) {
            console.error(`throw new Deno.errors.NotFound()`)
            return Promise.reject(new Deno.errors.NotFound)
          }
  
          return res
        },
        error(err) {
          // console.error(`err1`, {...err})
          throw err
        },
      });
  
      opts.onListen?.(server)
  
      return server
    } catch(err: Error) {
      if (err.code === 'EADDRINUSE') {
        throw new Deno.errors.AddrInUse
      }
      throw err
    }
  };