/* eslint-disable max-statements */
/*
  Part of BrutusNEXT

  Manages state of user interface
*/

import { Coords } from "../../Shared/Class/Coords";
import { Room } from "../../Client/World/Room";
import { World } from "../../Client/World/World";
import { ExitComponent } from "../../Client/Gui/Map/ExitComponent";
import { ExitsComponent } from "../../Client/Gui/Map/ExitsComponent";
import { RoomsComponent } from "../../Client/Gui/Map/RoomsComponent";
import { Body } from "../../Client/Gui/Body";

const components =
{
  rooms: "Not assigned" as (RoomsComponent | "Not assigned"),
  exits: "Not assigned" as (ExitsComponent | "Not assigned")
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
      // TODO: Better displaying of error message
      //  (probably output it to error window).
      alert("An error occured. Please reload the browser tab to log back in.");
    }
  }

  export function setRoomsComponent(rooms: RoomsComponent): RoomsComponent
  {
    if (components.rooms !== "Not assigned")
      throw Error("A reference to 'rooms' is already assigned to Gui");

    components.rooms = rooms;

    return rooms;
  }

  export function setExitsComponent(exits: ExitsComponent): ExitsComponent
  {
    if (components.exits !== "Not assigned")
    {
      throw Error("A reference to 'exits' is already assigned to Gui");
    }

    components.exits = exits;

    return exits;
  }

  export function rebuildMap(): void
  {
    updateMap({ rebuild: true });
  }

  // ! Throws exception on error.
  export function updateMap({ rebuild = false } = {}): void
  {
    // TODO: Parametrizovat.
    const location = new Coords(0, 0, 0);

    if (components.rooms === "Not assigned")
    {
      throw Error("Failed to update map because 'rooms' component"
        + " is not assigned to Gui yet");
    }

    const exitsData = updateRooms(components.rooms, location, { rebuild });

    // components.rooms.updateGraphics();

    if (components.exits === "Not assigned")
    {
      throw Error("Failed to update map because 'exits' component"
        + " is not assigned to Gui yet");
    }

    rebuildExits(exitsData, components.exits, location);
  }
}

// ----------------- Auxiliary Functions ---------------------

function getCoordsInView(location: Coords): Array<Coords>
{
  const coordsInView: Array<Coords> = [];

  // TODO: Provázat tohle s Rooms.ROOMS_IN_CACHE
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

  // Order of cycles determines oder of svg components representing
  // rooms in the DOM. Since people usually expects rows of things
  // rather than columns, we iterate nort-south direction first.
  for (let s = from.s; s <= to.s; s++)
  {
    for (let e = from.e; e <= to.e; e++)
    {
      coordsInView.push(new Coords(e, s, location.u));
    }
  }

  return coordsInView;
}

function updateRooms
(
  rooms: RoomsComponent,
  location: Coords,
  { rebuild = false }
)
: Map<string, ExitComponent.ExitData>
{
  if (rebuild)
    rooms.clear();

  const exitsData = new Map<string, ExitComponent.ExitData>();
  const coordsInView = getCoordsInView(location);

  for (const coords of coordsInView)
  {
    const room = World.getRoom(coords);

    if (room === "Nothing there")
    {
      if (rebuild)
        rooms.addRoomComponent("Doesn't exist", coords);
      else
        rooms.updateRoom("Doesn't exist", coords);
    }
    else
    {
      if (rebuild)
        rooms.addRoomComponent(room, coords);
      else
        rooms.updateRoom(room, coords);

      extractExitData(room, exitsData);
    }
  }

  return exitsData;
}

function rebuildExits
(
  exitsData: Map<string, ExitComponent.ExitData>,
  exits: ExitsComponent,
  location: Coords
)
: void
{
  exits.clear();

  for (const exitData of exitsData.values())
  {
    exits.createExitComponent(exitData);
  }
}

function extractExitData
(
  room: Room,
  exitsData: Map<string, ExitComponent.ExitData>
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