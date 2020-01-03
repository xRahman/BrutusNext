/*
  Part of BrutusNEXT

  Client-side version of game world
*/

import { Coords } from "../../Shared/Class/Coords";
import { World } from "../../Client/World/World";
import { Room } from "../../Client/World/Room";
import { Exit } from "../../Client/World/Exit";

let lastVisitedCoords: Coords | "Not set" = "Not set";

export namespace Editor
{
  export function setLastVisitedCoords(coords: Coords): void
  {
    lastVisitedCoords = coords;
  }

  export function getLastVisitedCoords(): Coords | "Not set"
  {
    return lastVisitedCoords;
  }

  export function resetLastVisitedCoords(): void
  {
    lastVisitedCoords = "Not set";
  }

  // ! Throws exception on error.
  export function ensureRoomExists
  (
    coords: Coords
  )
  : "Changes occured" | "No change was required"
  {
    const existingRoom = World.getRoom(coords);

    if (existingRoom === "Nothing there")
    {
      // ! Throws exception on error.
      World.setRoom(new Room(coords));

      return "Changes occured";
    }

    return "No change was required";
  }

  // ! Throws exception on error.
  export function deleteRoom(room: Room): void
  {
    // ! Throws exception on error.
    World.deleteRoom(room);
  }

  export function createConnectedRooms
  (
    from: Coords,
    to: Coords
  )
  : "Changes occured" | "No change was required"
  {
    let result: "Changes occured" | "No change was required" =
    "No change was required";

    // ! Throws exception on error.
    if (ensureRoomExists(from) === "Changes occured")
      result = "Changes occured";

    // ! Throws exception on error.
    if (ensureRoomExists(to) === "Changes occured")
      result = "Changes occured";

    if (connectRooms(from, to) === "Changes occured")
      result = "Changes occured";

    return result;
  }
}

// ----------------- Auxiliary Functions ---------------------

function connectRooms
(
  from: Coords,
  to: Coords
)
: "Changes occured" | "No change was required"
{
  let result: "Changes occured" | "No change was required" =
    "No change was required";

  const fromRoom = getRoom(from);
  const toRoom = getRoom(to);

  // ! Throws exception on error.
  const direction = Exit.getDirection(from, to);
  const reverseDirection = Exit.reverse(direction);

  if (!fromRoom.hasExit(direction))
  {
    fromRoom.setRoomInDirection(direction, toRoom);
    result = "Changes occured";
  }

  if (!toRoom.hasExit(reverseDirection))
  {
    toRoom.setRoomInDirection(reverseDirection, fromRoom);
    result = "Changes occured";
  }

  return result;
}

function getRoom(coords: Coords): Room
{
  const room = World.getRoom(coords);

  if (room === "Nothing there")
    throw Error(`Room at coords ${coords.toString()} doesn't exist`);

  return room;
}