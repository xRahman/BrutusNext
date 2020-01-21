/*
  Part of BrutusNEXT

  Player position on the map
*/

import { RoomComponent } from "../../../Client/Gui/Map/RoomComponent";
import { MapZoomer } from "../../../Client/Gui/Map/MapZoomer";
import { Circle } from "../../../Client/Gui/Svg/Circle";

export class PlayerPosition extends Circle
{
  constructor(protected parent: MapZoomer, name = "player_position")
  {
    super(parent, name);

    const roomPixelSize = RoomComponent.roomPixelSize;

    this.setRadius(1.4 * roomPixelSize / 2);
  }
}