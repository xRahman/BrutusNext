/* Part of BrutusNext */

/*
  Https server.

  Notes:
    Websocket server runs inside https server and is started
    automatically along with it.

    Http trafic is redirected to https.

    Express is used to handle security issues like directory traversing.
*/

import { REPORT } from "../../Shared/Log/REPORT";
import { Syslog } from "../../Shared/Log/Syslog";
import { FileSystem } from "../../Server/FileSystem/FileSystem";
import { WebSocketServer } from "../../Server/Net/WebSocketServer";

// Node.js modules.
import * as http from "http";
import * as https from "https";

// 3rd party modules.
import * as express from "express";

type Express = express.Application;
type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;

const PRIVATE_KEY_FILE = "./Keys/BrutusNext-key.pem";
const CERTIFICATE_FILE = "./Keys/BrutusNext-cert.pem";

const WWW_ROOT = "./Client";

const DEFAULT_HTTP_PORT = 80;
const DEFAULT_HTTPS_PORT = 443;

// Use 'express' to handle security issues like directory traversing.
const expressServer: Express = express();

let httpServer: (http.Server | "Not running") = "Not running";
let httpsServer: (https.Server | "Not running") = "Not running";

// Websocket server runs inside a https server.
const webSocketServer = new WebSocketServer();

export namespace HttpsServer
{
  // ! Throws exception on error.
  export async function startServers
  (
    { httpPort = DEFAULT_HTTP_PORT, httpsPort = DEFAULT_HTTPS_PORT } = {}
  )
  : Promise<void>
  {
    // ! Throws exception on error.
    startHttpServer(httpPort);

    redirectHttpToHttps();

    // ! Throws exception on error.
    const certificate = await loadCertificate();

    // ! Throws exception on error.
    startHttpsServer(certificate, httpsPort);

    serveStaticFiles();
  }
}

// ----------------- Auxiliary Functions ---------------------

// ! Throws exception on error.
function startHttpServer(port: number): void
{
  if (httpServer !== "Not running")
  {
    throw Error(`Failed to start http server because it's`
      + ` already running`);
  }

  Syslog.log("[HTTPS_SERVER]", `Starting http server at port ${port}`);

  httpServer = http.createServer(expressServer);

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
}

// ! Throws exception on error.
function startHttpsServer
(
  certificate: { key: string, cert: string },
  port: number
)
: void
{
  if (httpsServer !== "Not running")
  {
    throw Error("Failed to start https server because it's"
      + " already running");
  }

  Syslog.log("[HTTPS_SERVER]", `Starting https server at port ${port}`);

  httpsServer = https.createServer(certificate, expressServer);

  httpsServer.on
  (
    "error",
    (error) => { onHttpsError(error); }
  );

  httpsServer.listen
  (
    port,
    () => { onHttpsStartListening(); }
  );
}

// ! Throws exception on error.
async function loadCertificate(): Promise<{ key: string, cert: string }>
{
  const [ key, cert ] = await Promise.all
  (
    [
      // ! Throws exception on error.
      readPrivateKey(),
      // ! Throws exception on error.
      readCertificate()
    ]
  );

  return { key, cert };
}

// ! Throws exception on error.
async function readPrivateKey(): Promise<string>
{
  try
  {
    return await FileSystem.readExistingFile(PRIVATE_KEY_FILE);
  }
  catch (error)
  {
    throw prependMessage(error, "Failed to read ssl private key");
  }
}

// ! Throws exception on error.
async function readCertificate(): Promise<string>
{
  try
  {
    return await FileSystem.readExistingFile(CERTIFICATE_FILE);
  }
  catch (error)
  {
    throw prependMessage(error, "Failed to read ssl certificate");
  }
}

function redirectHttpToHttps(): void
{
  expressServer.use
  (
    (request: Request, response: Response, next: NextFunction) =>
    {
      if (request.secure)
        return next();

      if (!request.headers.host)
      {
        // Report the error immediately instead of throwing
        // an exception because this is a callback so there
        // is noone to catch the exception.
        REPORT(new Error("Missing 'host' on http request"));
        return;
      }

      response.redirect(`https://${request.headers.host}${request.url}`);
    }
  );
}

function serveStaticFiles(): void
{
  expressServer.use(express.static(WWW_ROOT));
}

function prependMessage(error: Error, message: string): Error
{
  if (!(error instanceof Error))
    return new Error(message);

  error.message = `${message}: ${error.message}`;

  return error;
}

// ---------------- Event handlers --------------------

function onHttpStartListening(): void
{
  if (httpServer === "Not running")
  {
    // Report the error immediately because we are in top-level
    // event handler so there is noone to catch the exception.
    REPORT
    (
      new Error("HttpServer isn't running even though it"
        + " has just started listening - Huh?!?")
    );
    return;
  }

  Syslog.log("[HTTP_SERVER]", "Http server is up and listening");
}

// Executes when https server is ready and listening.
function onHttpsStartListening(): void
{
  if (httpsServer === "Not running")
  {
    // Report the error immediately because we are in top-level
    // event handler so there is noone to catch the exception.
    REPORT
    (
      new Error("HttpsServer isn't running even though it"
        + " has just started listening - Huh?!?")
    );
    return;
  }

  Syslog.log("[HTTPS_SERVER]", "Https server is up and listening");

  try
  {
    // ! Throws exception on error.
    webSocketServer.startInsideHttpsServer(httpsServer);
  }
  catch (error)
  {
    REPORT(error);
  }
}

function onHttpError(error: Error): void
{
  REPORT(error);
}

function onHttpsError(error: Error): void
{
  REPORT(error);
}