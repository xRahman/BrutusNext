/*
  Part of BrutusNEXT

  Svg reprezentation of a room on the map
*/

import { Component } from "../../../Client/Gui/Component";
import { IconOnMap } from "../../../Client/Gui/Map/IconOnMap";
import { SvgCircle } from "../../../Client/Gui/Svg/SvgCircle";
import { SvgG } from "../../../Client/Gui/Svg/SvgG";

export class RoomOnMap extends SvgG
{
  private readonly backgroud: SvgCircle;
  private readonly icon: IconOnMap;

  constructor(parent: Component, name = "room")
  {
    super(parent, name);

    const roomPixelSize = 10;

    this.backgroud = new SvgCircle(this, "room_background");
    this.backgroud.setRadius(roomPixelSize * 0.6);

    this.icon = new IconOnMap
    (
      this,
      roomPixelSize,
      roomPixelSize,
      "Images/Rooms/Circle.svg",
      "room_icon"
    );
  }
}