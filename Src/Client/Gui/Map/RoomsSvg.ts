/*
  Part of BrutusNEXT

  Svg component that zooms the map
*/

/*
  Scale transform on MapZoomer scales everything inside it.
*/

import { Component } from "../../../Client/Gui/Component";
import { RoomSvg } from "../../../Client/Gui/Map/RoomSvg";
import { SvgG } from "../../../Client/Gui/Svg/SvgG";

// Use Map instead of Array so we can have negative indexes.
type ColumnOfRooms = Map<number, RoomSvg>;

export class RoomsSvg extends SvgG
{
  private readonly rooms = new Map<number, ColumnOfRooms>();

  constructor(parent: Component, name = "rooms")
  {
    super(parent, name);

    this.buildWorld(3);
  }

  private buildWorld(radius: number): void
  {
    for (let x = -radius; x <= radius; x++)
    {
      const column: ColumnOfRooms = new Map();

      for (let y = -radius; y <= radius; y++)
      {
        const room = new RoomSvg(this);

        room.setPosition(24 * x, 24 * y);

        column.set(y, room);
      }

      this.rooms.set(x, column);
    }
  }
}