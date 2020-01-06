/* eslint-disable max-statements */
/*
  Part of BrutusNEXT

  Manages state of user interface
*/

import { Coords } from "../../Shared/Class/Coords";
import { Room } from "../../Client/World/Room";
import { World } from "../../Client/World/World";
import { ExitSvg } from "../../Client/Gui/Map/ExitSvg";
import { ExitsSvg } from "../../Client/Gui/Map/ExitsSvg";
import { RoomsSvg } from "../../Client/Gui/Map/RoomsSvg";
import { Body } from "../../Client/Gui/Body";

const components =
{
  roomsSvg: "Not assigned" as (RoomsSvg | "Not assigned"),
  exitsSvg: "Not assigned" as (ExitsSvg | "Not assigned")
};

export namespace Gui
{
  export enum State
  {
    INITIAL,
    LOGIN,
    REGISTER,
    TERMS,
    CHARSELECT,
    CHARGEN,
    GAME,
    ERROR   // Player is asked to reload browser tab to recover.
  }

  let state = State.INITIAL;

  // ! Throws exception on error.
  export function switchToState(newState: State): void
  {
    if (newState === State.INITIAL)
      throw Error("Attempt to set GUI state to 'INITIAL'");

    state = newState;

    Body.showWindowsByState(state);

    if (newState === State.ERROR)
    {
      // TODO: Better displaying of error message.
      alert("An error occured. Please reload the browser tab to log back in.");
    }
  }

  export function setRoomsSvg(roomsSvg: RoomsSvg): RoomsSvg
  {
    if (components.roomsSvg !== "Not assigned")
    {
      throw Error("'roomSvg' is already assigned to Gui");
    }

    components.roomsSvg = roomsSvg;

    return roomsSvg;
  }

  export function setExitsSvg(exitsSvg: ExitsSvg): ExitsSvg
  {
    if (components.exitsSvg !== "Not assigned")
    {
      throw Error("'exitsSvg' is already assigned to Gui");
    }

    components.exitsSvg = exitsSvg;

    return exitsSvg;
  }

  // ! Throws exception on error.
  export function updateMap(): void
  {
    console.log("updateMap()");

    // TODO: Parametrizovat.
    const location = new Coords(0, 0, 0);

    if (components.roomsSvg === "Not assigned")
    {
      throw Error("Failed to update map because 'roomsSvg' component"
        + " is not assigned to Gui yet");
    }

    // TEST
    console.log("disabling mouse events");
    components.roomsSvg.disableMouseEvents();

    console.error(new Error("Update"));

    components.roomsSvg.clear();

    const exitsData = updateRooms(components.roomsSvg, location);

    components.roomsSvg.updateGraphics();

    if (components.exitsSvg === "Not assigned")
    {
      throw Error("Failed to update map because 'exitsSvg' component"
        + " is not assigned to Gui yet");
    }

    components.exitsSvg.clear();
    updateExits(exitsData, components.exitsSvg, location);

    // TEST
    console.log("setting timeout");
    setTimeout
    (
      () =>
      {
        if (components.roomsSvg !== "Not assigned")
        {
          console.log("enabling mouse events");
          components.roomsSvg.enableMouseEvents();
        }
      },
      2000
    );
  }
}

// ----------------- Auxiliary Functions ---------------------

function updateRooms
(
  roomsSvg: RoomsSvg,
  location: Coords
)
: Map<string, ExitSvg.ExitData>
{
  // TODO: Provázat tohle s RoomsSvg.ROOMS_IN_CACHE
  // (měly by to bejt stejný hodnoty).
  const from =
  {
    e: location.e - 20,
    s: location.s - 20
  };

  const to =
  {
    e: location.e + 20,
    s: location.s + 20
  };

  const exitsData = new Map<string, ExitSvg.ExitData>();

  // Order of cycles determines oder of svg components representing
  // rooms in the DOM. Since people usually expects rows of things
  // rather than columns, we iterate nort-south direction first.
  for (let s = from.s; s <= to.s; s++)
  {
    for (let e = from.e; e <= to.e; e++)
    {
      // The world is 3d but map only 2e - we show only
      // one horizontal slice of the world at a time.
      const coords = new Coords(e, s, location.u);
      const room = World.getRoom(coords);

      if (room === "Nothing there")
      {
        roomsSvg.addRoomSvg("Doesn't exist", coords);
      }
      else
      {
        roomsSvg.addRoomSvg(room, coords);
        extractExitData(room, exitsData);
      }
    }
  }

  return exitsData;
}

function updateExits
(
  exitsData: Map<string, ExitSvg.ExitData>,
  exitsSvg: ExitsSvg,
  location: Coords
)
: void
{
  for (const exitData of exitsData.values())
  {
    exitsSvg.createExitSvg(exitData);
  }
}

function extractExitData
(
  room: Room,
  exitsData: Map<string, ExitSvg.ExitData>
)
: void
{
  for (const exit of Object.values(room.exits))
  {
    if (exit.to === "Nowhere")
      continue;

    const from = room.coords;
    const to = exit.to;
    const exitId = Coords.createExitId(from, to);

    const exitData = exitsData.get(exitId);

    if (exitData === undefined)
    {
      // DEBUG
      // console.log
      // (
      //   "Setting onedirectional exit",
      //   exitName,
      //   "from:",
      //   from,
      //   "to:",
      //   to,
      //   "exitId:",
      //   exitId
      // );

      exitsData.set(exitId, { from, to, bidirectional: false });
    }
    else
    {
      // DEBUG
      // console.log
      // (
      //   "Setting bidirectional exit",
      //   exitName,
      //   "from:",
      //   from,
      //   "to:",
      //   to,
      //   "exitId:",
      //   exitId
      // );

      exitsData.set(exitId, { from, to, bidirectional: true });
    }
  }
}