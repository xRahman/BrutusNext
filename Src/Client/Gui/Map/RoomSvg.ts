/*
  Part of BrutusNEXT

  Svg reprezentation of a room on the map
*/

import { Coords } from "../../../Shared/Class/Coords";
import { Room } from "../../../Client/World/Room";
import { Component } from "../../../Client/Gui/Component";
import { SvgImage } from "../../../Client/Gui/Svg/SvgImage";
import { Circle } from "../../../Client/Gui/Svg/Circle";
import { G } from "../../../Client/Gui/Svg/G";

export class RoomSvg extends G
{
  private readonly background: Circle;
  private icon: SvgImage | "Doesn't exist" = "Doesn't exist";

  constructor
  (
    parent: Component,
    private readonly room: Room | "Doesn't exist",
    private readonly coords: Coords,
    name = "room"
  )
  {
    super(parent, name);

    this.setPosition(24 * coords.e, 24 * coords.s);

    this.background = new Circle(this, "room_background");
    this.background.setId(coords.toString());
    this.background.setRadius(Room.DEFAULT_ROOM_PIXEL_SIZE * 0.6);

    this.updateRoomIcon();
  }

  // ---------------- Private methods -------------------

  private updateRoomIcon(): void
  {
    if (this.room === "Doesn't exist")
    {
      if (this.icon !== "Doesn't exist")
      {
        this.icon.removeFromParent();
        this.icon = "Doesn't exist";
      }

      return;
    }

    this.icon = new SvgImage
    (
      {
        parent: this,
        name: "room_icon",
        widthPixels: this.room.icon.pixelSize,
        heightPixels: this.room.icon.pixelSize,
        imagePath: this.room.icon.path,
        isCentered: true
      }
    );

    // Disable mouse events on the icon so they are handled
    // by "room_background" element.
    this.icon.setCss({ pointerEvents: "none" });
  }
}