/*
          ____             _               _   _ _______   ________
         |  _ \           | |             | \ | |  ___\ \ / /_   __|
         | |_) |_ __ _   _| |_ _   _ ___  |  \| | |__  \ V /  | |
         |  _ <| '__| | | | __| | | / __| | . ` |  __|  > <   | |
         | |_) | |  | |_| | |_| |_| \__ \ | |\  | |___ / . \  | |
         |____/|_|   \__,_|\__|\__,_|___/ |_| \_|_____/_/ \_\ |_|

                           Server application
*/

import { REPORT } from "../Shared/Log/REPORT";
import { Syslog } from "../Server/Log/Syslog";
// import { HttpsServer } from "../Server/Net/HttpsServer";
// import { Game } from "../Server/Game/Game";
// import { Engine } from "../Server/Engine/Engine";
import { Test } from "../Server/Test";

export const timeOfBoot = new Date();

// Include sourcemap support module which uses .js.map files generated by
// typecript compiler to change stack traces to show typescript stack trace
// instead of generated javascript stack trace.
import * as SourceMapSupport from "source-map-support";
SourceMapSupport.install();

async function start()
{
  Syslog.log("[INFO]", `Starting BrutusNext server...`);

  try
  {
    /// TEST:
    // Syslog.log("[INFO]", "b");
    // REPORT(new Error("test error"));
    Test.test();

  // await HttpsServer.startServers();
  // await Game.load();
    /// Tohle si tu nechám kvůli budoucí teminologii. Na klientu
    /// by to mělo bejt stejně.
    // await Game.init();
  }
  catch (error)
  {
    REPORT(error, "Failed to start");
    return;
  }

// await Engine.loop();

  Syslog.log("[INFO]", `BrutusNext server has stopped normally`);
}

// tslint:disable-next-line:no-floating-promises
start();