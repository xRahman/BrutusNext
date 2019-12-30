/*
  Part of BrutusNEXT

  Svg reprezentation of a room on the map
*/

import { Coords } from "../../../Shared/Class/Coords";
import { Room } from "../../../Client/World/Room";
import { Editor } from "../../../Client/Editor/Editor";
import { Component } from "../../../Client/Gui/Component";
import { SvgImage } from "../../../Client/Gui/Svg/SvgImage";
import { SvgCircle } from "../../../Client/Gui/Svg/SvgCircle";
import { SvgG } from "../../../Client/Gui/Svg/SvgG";

const roomPixelSize = 10;

export class RoomSvg extends SvgG
{
  private readonly backgroud: SvgCircle;
  private icon: SvgImage | "Doesn't exist" = "Doesn't exist";

  constructor
  (
    parent: Component,
    private room: Room | "Doesn't exist",
    private readonly coords: Coords,
    name = "room"
  )
  {
    super(parent, name);

    this.setPosition(24 * coords.e, 24 * coords.s);

    this.backgroud = new SvgCircle(this, "room_background");
    this.backgroud.setRadius(roomPixelSize * 0.6);

    this.updateRoomIcon();
    this.assignEventListeners();
  }

  // ---------------- Private methods -------------------

  private assignEventListeners(): void
  {
    this.element.onmouseup = (event) => { this.onMouseUp(event); };
  }

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
        widthPixels: roomPixelSize,
        heightPixels: roomPixelSize,
        imagePath: "Images/Rooms/Circle.svg",
        isCentered: true
      }
    );
  }

  // ---------------- Event handlers --------------------

  private onMouseUp(event: MouseEvent): void
  {
    console.log("onMouseUp fired", event.button);

    switch (event.button)
    {
      case 0:
        this.onLeftClick(event);
        break;

      case 2:
        this.onRightClick(event);
        break;

      default:
        break;
    }
  }

  private onLeftClick(event: MouseEvent): void
  {
    if (this.room === "Doesn't exist")
    {
      this.room = Editor.createRoom(this.coords);
      this.updateRoomIcon();
    }
  }

  private onRightClick(event: MouseEvent): void
  {
    if (this.room !== "Doesn't exist")
    {
      Editor.deleteRoom(this.room);
      this.room = "Doesn't exist";
      this.updateRoomIcon();
    }
  }
}