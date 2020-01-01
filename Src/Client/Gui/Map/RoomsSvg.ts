/*
  Part of BrutusNEXT

  Svg container for rooms on the map
*/

import { Coords } from "../../../Shared/Class/Coords";
import { Room } from "../../../Client/World/Room";
import { MapZoomer } from "../../../Client/Gui/Map/MapZoomer";
import { RoomSvg } from "../../../Client/Gui/Map/RoomSvg";
import { G } from "../../../Client/Gui/Svg/G";

export class RoomsSvg extends G
{
  private rooms: Array<RoomSvg> = [];

  constructor(parent: MapZoomer, name = "rooms")
  {
    super(parent, name);
  }

  public createRoomSvg(room: Room | "Doesn't exist", coords: Coords): void
  {
    this.rooms.push(new RoomSvg(this, room, coords));
  }

  public clear(): void
  {
    for (const room of this.rooms)
      room.removeFromParent();

    this.rooms = [];
  }
}