/*
  Part of BrutusNEXT

  Svg reprezentation of a room on the map
*/

import { Component } from "../../../Client/Gui/Component";
import { MapIcon } from "../../../Client/Gui/Map/MapIcon";
import { SvgG } from "../../../Client/Gui/Svg/SvgG";

export class MapRoom extends SvgG
{
  private readonly icon: MapIcon;

  constructor(parent: Component, name = "room")
  {
    super(parent, name);

    const roomPixelSize = 16;

    this.icon = new MapIcon
    (
      this,
      roomPixelSize,
      roomPixelSize,
      "Images/Rooms/Circle.svg",
      "room_icon"
    );
  }
}