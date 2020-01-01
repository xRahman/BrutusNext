/*
  Part of BrutusNEXT

  Client-side version of game world
*/

import { Gui } from "../../Client/Gui/Gui";
import { Coords } from "../../Shared/Class/Coords";
import { Room } from "../../Client/World/Room";
import { World } from "../../Client/World/World";

export namespace Editor
{
  // This is an eslint false positive. Exported variable can be assigned
  // from outside of this module.
  // eslint-disable-next-line prefer-const
  export let lastSelectedCoords: Coords | "Not set" = "Not set";

  // ! Throws exception on error.
  export function ensureRoomExists(coords: Coords): Room
  {
    const existingRoom = World.getRoomAtCoords(coords);

    if (existingRoom === "Nothing there")
      // ! Throws exception on error.
      return createRoom(coords);

    return existingRoom;
  }

  // ! Throws exception on error.
  export function createRoom(coords: Coords): Room
  {
    // ! Throws exception on error.
    const newRoom = World.createRoom(coords);

    // ! Throws exception on error.
    Gui.updateMap();

    return newRoom;
  }

  // ! Throws exception on error.
  export function deleteRoom(room: Room): void
  {
    // ! Throws exception on error.
    World.deleteRoom(room);

    // ! Throws exception on error.
    Gui.updateMap();
  }

  // ! Throws exception on error.
  export function createExitTo(to: Coords): void
  {
    if (lastSelectedCoords === "Not set")
      return;

    const from = lastSelectedCoords;

    if (!canBuildExit(from, to))
      return;

    // ! Throws exception on error.
    World.createExit(from, to);

    // ! Throws exception on error.
    Gui.updateMap();
  }
}

// ----------------- Auxiliary Functions ---------------------

function canBuildExit(from: Coords, to: Coords): boolean
{
  const distance = Coords.distance(from, to);

  if (distance === 0 || distance === "More than 1")
    return false;

  return true;
}