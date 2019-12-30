/*
  Part of BrutusNEXT

  Manages state of user interface
*/

import { Coords } from "../../Shared/Class/Coords";
import { World } from "../../Client/World/World";
import { Body } from "../../Client/Gui/Body";
import { RoomsSvg } from "../../Client/Gui/Map/RoomsSvg";

const components =
{
  roomsSvg: undefined as RoomsSvg | undefined
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
    components.roomsSvg = roomsSvg;

    return roomsSvg;
  }

  export function updateMap(): void
  {
    if (!components.roomsSvg)
    {
      throw Error("Failed to update map because 'roomsSvg' component"
        + " is not available");
    }

    for (let x = -3; x <= 3; x++)
    {
      for (let y = -3; y <= 3; y++)
      {
        const coords = new Coords(x, y, 0);
        const room = World.getRoomAtCoords(coords);

        if (room === "Nothing there")
          components.roomsSvg.createRoomSvg("Doesn't exist", coords);
        else
          components.roomsSvg.createRoomSvg(room, coords);
      }
    }
  }
}