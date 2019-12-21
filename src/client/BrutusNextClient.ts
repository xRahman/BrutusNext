/*
          ____             _               _   _ _______   ________
         |  _ \           | |             | \ | |  ___\ \ / /_   __|
         | |_) |_ __ _   _| |_ _   _ ___  |  \| | |__  \ V /  | |
         |  _ <| '__| | | | __| | | / __| | . ` |  __|  > <   | |
         | |_) | |  | |_| | |_| |_| \__ \ | |\  | |___ / . \  | |
         |____/|_|   \__,_|\__|\__,_|___/ |_| \_|_____/_/ \_\ |_|

                          Client application
*/

import { Syslog } from "../Client/Log/Syslog";
import { Connection } from "../Client/Net/Connection";
import { Gui } from "../Client/Gui/Gui";

function start(): void
{
  try
  {
    Gui.init();
    // await Renderer.init();
    Connection.connect();
  }
  catch (error)
  {
    Syslog.logError(error, "Failed to start the client");
    alert(`Failed to start`);
  }
}

// tslint:disable-next-line:no-floating-promises
start();

// import { REPORT } from "../Shared/Log/REPORT";
// import { Syslog } from "../Client/Log/Syslog";
// import { Gui } from "../Client/Gui/Gui";
// import { Renderer } from "../Client/Engine/Renderer";
// import { Connection } from "../Client/Net/Connection";

/// HACK: Neregistrovala se mi root prototype entita.
// import "../Client/Game/Zone";
// import "../Client/Asset/TextureAsset";
// import "../Client/Asset/TextureAtlasAsset";

// async function start()
// {
//   Syslog.log("[CLIENT]", "Starting Kosmud client...");

//   try
//   {
//     Gui.init();
//     await Renderer.init();
//     Connection.connect();
//   }
//   catch (error)
//   {
//     REPORT(error, "Failed to start the client");
//     alert(`Failed to start`);
//   }
// }

// // tslint:disable-next-line:no-floating-promises
// start();