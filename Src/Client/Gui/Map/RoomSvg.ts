/*
  Part of BrutusNEXT

  Svg reprezentation of a room on the map
*/

import { Coords } from "../../../Shared/Class/Coords";
import { Room } from "../../../Client/World/Room";
import { Component } from "../../../Client/Gui/Component";
import { SvgImage } from "../../../Client/Gui/Svg/SvgImage";
import { SvgCircle } from "../../../Client/Gui/Svg/SvgCircle";
import { SvgG } from "../../../Client/Gui/Svg/SvgG";

export class RoomSvg extends SvgG
{
  private readonly backgroud: SvgCircle;
  private readonly icon: SvgImage;

  constructor
  (
    parent: Component,
    private readonly room: Room | "Doesn't exist",
    coords: Coords,
    name = "room"
  )
  {
    super(parent, name);

    this.setPosition(24 * coords.e, 24 * coords.s);

    const roomPixelSize = 10;

    this.backgroud = new SvgCircle(this, "room_background");
    this.backgroud.setRadius(roomPixelSize * 0.6);

    this.icon = new SvgImage
    (
      {
        parent: this,
        name: "room_icon",
        widthPixels: roomPixelSize,
        heightPixels: roomPixelSize,
        imagePath: "Images/Rooms/Circle.svg",
        isCentered: true
      }
    );
  }
}