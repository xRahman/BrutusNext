/*
  Part of BrutusNEXT

  Svg component that zooms the map
*/

/*
  Scale transform on MapZoomer scales everything inside it.
*/

import { Coords } from "../../../Shared/Class/Coords";
import { Room } from "../../../Client/World/Room";
import { Component } from "../../../Client/Gui/Component";
import { RoomSvg } from "../../../Client/Gui/Map/RoomSvg";
import { G } from "../../../Client/Gui/Svg/G";

// // Use Map instead of Array so we can have negative indexes.
// type ColumnOfRooms = Map<number, RoomSvg>;

export class RoomsSvg extends G
{
  // private readonly rooms = new Map<number, ColumnOfRooms>();
  private readonly rooms: Array<RoomSvg> = [];

  constructor(parent: Component, name = "rooms")
  {
    super(parent, name);

    // this.buildWorld(3);
  }

  public createRoomSvg(room: Room | "Doesn't exist", coords: Coords): void
  {
    this.rooms.push(new RoomSvg(this, room, coords));
  }

  // private buildWorld(radius: number): void
  // {
  //   for (let x = -radius; x <= radius; x++)
  //   {
  //     const column: ColumnOfRooms = new Map();

  //     for (let y = -radius; y <= radius; y++)
  //     {
  //       const room = new RoomSvg(this, "Doesn't exist");

  //       room.setPosition(24 * x, 24 * y);

  //       column.set(y, room);
  //     }

  //     this.rooms.set(x, column);
  //   }
  // }
}