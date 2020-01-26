/*
  Part of BrutusNEXT

  Client-side version of game world
*/

import { Coords } from "../../Shared/Class/Coords";
import { World } from "../../Client/World/World";
import { Room } from "../../Client/World/Room";
import { Exit } from "../../Client/World/Exit";
import { MudMap } from "../../Client/Gui/Map/MudMap";

let rememberedCoords: Coords | "Not set" = "Not set";

export namespace MapEditor
{
  export function rememberCoords(coords: Coords): void
  {
    rememberedCoords = coords;
  }

  export function resetRememberedCoords(): void
  {
    rememberedCoords = "Not set";
  }

  // ! Throws exception on error.
  export function createRoom(coords: Coords): void
  {
    if (ensureRoomExists(coords) === "Changes occured")
    {
      // ! Throws exception on error.
      MudMap.update({ rebuild: false });
    }
  }

  // ! Throws exception on error.
  export function deleteRoom(coords: Coords): void
  {
    if (deleteRoomIfExists(coords) === "Changes occured")
    {
      // ! Throws exception on error.
      MudMap.update({ rebuild: false });
    }
  }

  // ! Throws exception on error.
  export function buildConnectionTo(coords: Coords): void
  {
    if (rememberedCoords === "Not set")
      return;

    if (!rememberedCoords.isAdjacentTo(coords))
      return;

    // ! Throws exception on error.
    if (createConnectedRooms(rememberedCoords, coords) === "Changes occured")
    {
      // ! Throws exception on error.
      MudMap.update({ rebuild: false });
    }
  }
}

// ----------------- Auxiliary Functions ---------------------

// ! Throws exception on error.
function connectRooms
(
  from: Coords,
  to: Coords
)
: "Changes occured" | "No change"
{
  let result: "Changes occured" | "No change" = "No change";

  const fromRoom = getRoom(from);
  const toRoom = getRoom(to);

  // ! Throws exception on error.
  const direction = Exit.getDirection(from, to);
  const reverseDirection = Exit.reverse(direction);

  if (!fromRoom.hasExit(direction))
  {
    fromRoom.setExitDestination(direction, to);
    result = "Changes occured";
  }

  if (!toRoom.hasExit(reverseDirection))
  {
    toRoom.setExitDestination(reverseDirection, from);
    result = "Changes occured";
  }

  return result;
}

function getRoom(coords: Coords): Room
{
  const room = World.getRoom(coords);

  if (room === "Doesn't exist")
    throw Error(`Room at coords ${coords.toString()} doesn't exist`);

  return room;
}

function deleteExitsTo(room: Room): void
{
  const adjacentCoords = room.coords.getAdjacentCoords();

  for (const coords of adjacentCoords)
  {
    const fromRoom = World.getRoom(coords);

    if (fromRoom !== "Doesn't exist")
      fromRoom.deleteExitsTo(room.coords);
  }
}

// ! Throws exception on error.
function ensureRoomExists
(
  coords: Coords
)
: "Changes occured" | "No change"
{
  const existingRoom = World.getRoom(coords);

  if (existingRoom === "Doesn't exist")
  {
    // ! Throws exception on error.
    World.setRoom(new Room(coords));

    return "Changes occured";
  }

  return "No change";
}

// ! Throws exception on error.
function deleteRoomIfExists
(
  coords: Coords
)
: "Changes occured" | "No change"
{
  const room = World.getRoom(coords);

  if (room === "Doesn't exist")
    return "No change";

  deleteExitsTo(room);

  // ! Throws exception on error.
  World.deleteRoom(room);

  return "Changes occured";
}

// ! Throws exception on error.
function createConnectedRooms
(
  from: Coords,
  to: Coords
)
: "Changes occured" | "No change"
{
  let result: "Changes occured" | "No change" = "No change";

  // ! Throws exception on error.
  if (ensureRoomExists(from) === "Changes occured")
    result = "Changes occured";

  // ! Throws exception on error.
  if (ensureRoomExists(to) === "Changes occured")
    result = "Changes occured";

  // ! Throws exception on error.
  if (connectRooms(from, to) === "Changes occured")
    result = "Changes occured";

  return result;
}