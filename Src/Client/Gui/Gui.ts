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
    if (components.roomsSvg === "Not assigned")
    {
      throw Error("Failed to update map because 'roomsSvg' component"
        + " is not assigned to Gui yet");
    }

    components.roomsSvg.clear();

    if (components.exitsSvg === "Not assigned")
    {
      throw Error("Failed to update map because 'exitsSvg' component"
        + " is not assigned to Gui yet");
    }

    components.exitsSvg.clear();

    createRoomsAndExits(components.roomsSvg, components.exitsSvg);
  }
}

// ----------------- Auxiliary Functions ---------------------

function createRoomsAndExits(roomsSvg: RoomsSvg, exitsSvg: ExitsSvg): void
{
  const exitsData = createRooms(roomsSvg);

  createExits(exitsData, exitsSvg);
}

function createRooms(roomsSvg: RoomsSvg): Map<string, ExitSvg.ExitData>
{
  const exitsData = new Map<string, ExitSvg.ExitData>();

  for (let x = -3; x <= 3; x++)
  {
    for (let y = -3; y <= 3; y++)
    {
      const coords = new Coords(x, y, 0);
      const room = World.getRoom(coords);

      if (room === "Nothing there")
      {
        roomsSvg.createRoomSvg("Doesn't exist", coords);
      }
      else
      {
        roomsSvg.createRoomSvg(room, coords);
        extractExitData(room, exitsData);
      }
    }
  }

  return exitsData;
}

function createExits
(
  exitsData: Map<string, ExitSvg.ExitData>,
  exitsSvg: ExitsSvg
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