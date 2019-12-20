/*
  Part of BrutusNext

  Https server
*/

/*
  All http trafic is redirected to https.

  Express is used to handle security issues like directory traversing.
*/

import { Syslog } from "../../Shared/Log/Syslog";

// Node.js modules.
import * as http from "http";

// 3rd party modules.
import * as Express from "express";

let httpServer: (http.Server | "Not running") = "Not running";

export namespace HttpServer
{
  export const DEFAULT_PORT = 80;

  // ! Throws exception on error.
  export function start(port: number, express: Express.Application): void
  {
    if (httpServer !== "Not running")
    {
      throw Error(`Failed to start http server because it's`
        + ` already running`);
    }

    Syslog.log("[HTTP_SERVER]", `Starting http server at port ${port}`);

    httpServer = http.createServer(express);

    httpServer.on
    (
      "error",
      (error) => { onHttpError(error); }
    );

    httpServer.listen
    (
      port,
      () => { onHttpStartListening(); }
    );

    redirectHttpToHttps(express);
  }

  export function shutdown(): void
  {
    if (httpServer !== "Not running")
      httpServer.close();
  }
}

// ---------------- Event handlers --------------------

function onHttpError(error: Error): void
{
  Syslog.logError(error);
}

function onHttpStartListening(): void
{
  Syslog.log("[HTTP_SERVER]", "Http server is up and listening");
}

// ----------------- Auxiliary Functions ---------------------

function redirect
(
  request: Express.Request,
  response: Express.Response,
  next: Express.NextFunction
)
: void
{
  if (request.secure)
    return next();

  if (!request.headers.host)
  {
    // Report the error right away instead of throwing
    // an exception because this is a top-level callback
    // so there is noone else to catch the exception.
    Syslog.logError("Missing 'host' on http request");
    return;
  }

  response.redirect(`https://${request.headers.host}${request.url}`);
}

function redirectHttpToHttps(express: Express.Application): void
{
  express.use
  (
    (request, response, next) =>
    {
      redirect(request, response, next);
    }
  );
}