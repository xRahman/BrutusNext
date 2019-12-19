/*
  Part of BrutusNext

  Web server running http server, https server and websocket server
*/

/*
  Websocket server runs inside https server and is started
  automatically along with it.

  Http trafic is redirected to https.

  Express is used to handle security issues like directory traversing.
*/

// import { REPORT } from "../../Shared/Log/REPORT";
// import { Syslog } from "../../Shared/Log/Syslog";
import { HttpServer } from "../../Server/Net/HttpServer";
import { HttpsServer } from "../../Server/Net/HttpsServer";
// import { FileSystem } from "../../Server/FileSystem/FileSystem";
// import { WebSocketServer } from "../../Server/Net/WebSocketServer";

// 3rd party modules.
import * as Express from "express";

const WWW_ROOT = "./Client";

// Use 'express' to handle security issues like directory traversing.
const express = Express();

// // Websocket server runs inside a https server.
// const webSocketServer = new WebSocketServer();

export namespace WebServer
{
  // ! Throws exception on error.
  export async function start
  (
    {
      httpPort = HttpServer.DEFAULT_PORT,
      httpsPort = HttpsServer.DEFAULT_PORT
    } = {}
  )
  : Promise<void>
  {
    // ! Throws exception on error.
    HttpServer.start(httpPort, express);

    // ! Throws exception on error.
    await HttpsServer.start(httpsPort, express);

    serveStaticFiles();
  }

  // ! Throws exception on error.
  export function shutdown(): void
  {
    // It's probably a good idea to shutdown https server first,
    // because http server only redirects trafic to https, so
    // when we shut it down, http requests won't get any reply.
    // ! Throws exception on error.
    HttpsServer.shutdown();

    // ! Throws exception on error.
    HttpServer.shutdown();
  }
}

// ----------------- Auxiliary Functions ---------------------

function serveStaticFiles(): void
{
  express.use(Express.static(WWW_ROOT));
}

// ---------------- Event handlers --------------------

// // Executes when https server is ready and listening.
// function onHttpsStartListening(): void
// {
//   if (httpsServer === "Not running")
//   {
//     // Report the error immediately because we are in top-level
//     // event handler so there is noone to catch the exception.
//     REPORT
//     (
//       new Error("HttpsServer isn't running even though it"
//         + " has just started listening - Huh?!?")
//     );
//     return;
//   }

//   Syslog.log("[HTTPS_SERVER]", "Https server is up and listening");

//   try
//   {
//     // ! Throws exception on error.
//     webSocketServer.startInsideHttpsServer(httpsServer);
//   }
//   catch (error)
//   {
//     REPORT(error);
//   }
// }

// function onHttpsError(error: Error): void
// {
//   REPORT(error);
// }