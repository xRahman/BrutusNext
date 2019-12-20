/*
  Part of BrutusNext

  Https server
*/

/*
  When https server comes online it starts a websocket server
  inside it.
*/

import { REPORT } from "../../Shared/Log/REPORT";
import { Syslog } from "../../Shared/Log/Syslog";
import { ErrorUtils } from "../../Shared/Utils/ErrorUtils";
import { FileSystem } from "../../Server/FileSystem/FileSystem";
import { WebSocketServer } from "../../Server/Net/WebSocketServer";

// Node.js modules.
// import * as http from "http";
import * as https from "https";

// 3rd party modules.
import * as Express from "express";

const PRIVATE_KEY_FILE = "./Server/Keys/BrutusNext-key.pem";
const CERTIFICATE_FILE = "./Server/Keys/BrutusNext-cert.pem";

let httpsServer: (https.Server | "Not running") = "Not running";

export namespace HttpsServer
{
  export const DEFAULT_PORT = 443;

  // ! Throws exception on error.
  export async function start(port: number, express: Express.Application)
  : Promise<void>
  {
    // ! Throws exception on error.
    serverMustNotBeRunning();

    // ! Throws exception on error.
    const certificate = await loadCertificate();

    // ! Throws exception on error.
    // (Check again because we have waited for the certificate to load
    //  and things might have changed meanwhile.)
    serverMustNotBeRunning();

    Syslog.log("[HTTPS_SERVER]", `Starting https server at port ${port}`);

    httpsServer = https.createServer(certificate, express);

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

  export function shutdown(): void
  {
    WebSocketServer.shutdown();

    if (httpsServer !== "Not running")
      httpsServer.close();
  }
}

// ----------------- Auxiliary Functions ---------------------

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
    throw ErrorUtils.prependMessage("Failed to read ssl private key", error);
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
    throw ErrorUtils.prependMessage("Failed to read ssl certificate", error);
  }
}

// ! Throws exception on error.
function serverMustNotBeRunning(): void
{
  if (httpsServer !== "Not running")
    throw Error("Failed to start https server because it's already running");
}

// ---------------- Event handlers --------------------

// Executes when https server is ready and listening.
function onHttpsStartListening(): void
{
  if (httpsServer === "Not running")
  {
    // Report the error right away because we are the top-level
    // event handler so there is noone else to do it.
    REPORT
    (
      new Error("Something fishy is going on - https server is not"
        + " running even though it has just started listening")
    );
    return;
  }

  Syslog.log("[HTTPS_SERVER]", "Https server is up and listening");

  try
  {
    // ! Throws exception on error.
    WebSocketServer.startInHttpsServer(httpsServer);
  }
  catch (error)
  {
    REPORT(error);
  }
}

function onHttpsError(error: Error): void
{
  REPORT(error);
}