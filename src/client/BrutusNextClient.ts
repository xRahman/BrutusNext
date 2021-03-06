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
import { Coords } from "../Shared/Class/Coords";
import { Gui } from "../Client/Gui/Gui";
import { MudMap } from "../Client/Gui/Map/MudMap";
import { Body } from "../Client/Gui/Html/Body";

// Import following modules to execute their inicialization code.
import "../Client/Gui/Html/Document";
import "../Client/Gui/Html/Html";

async function startBrutusNextClient(): Promise<void>
{
  Syslog.log("[CLIENT]", "Starting BrutusNext client");

  try
  {
    // ! Throws exception on error.
    Body.createWindows();

    // await Renderer.init();
    await Connection.connect();

    /// TEST (Mělo by se to volat jinde)
    MudMap.lookAt(new Coords(0, 0, 0));
    Gui.switchToState(Gui.State.GAME);
  }
  catch (error)
  {
    Syslog.logError(error, "Failed to start the client");
    /// TODO: Dát o tom nějak vědět hráči.
  }
}

startBrutusNextClient().catch
(
  (reason: any) =>
  {
    Syslog.logError(reason, `BrutusNext client encountered an unhandled`
      + ` error: ${String(reason)}`);
  }
);

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
//   Syslog.log("[CLIENT]", "Starting BrutusNext client...");

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