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

  const host = request.get("Host");

  if (!host)
  {
    // Sometimes 'hostst' is missing in request so we can't
    // redirect to it. In that case we will reply with status
    // '400' (Bad Request).
    response.statusMessage = "Missing 'host' on requests";
    response.status(400).end();
    return;
  }

  response.redirect(`https://${host}${request.url}`);
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