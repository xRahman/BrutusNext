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
  public static readonly ROOM_BACKGROUND = "room_background";

  private readonly roomBackground: Circle;
  private readonly roomIcon: SvgImage;

  private coords: Coords | "In room cache" = "In room cache";

  constructor
  (
    parent: Component,
    name = "room"
  )
  {
    super(parent, name);

    this.roomBackground = createRoomBackground(this);

    this.hide();

    this.roomIcon = createRoomIcon(this);
  }

  public setCoords(coords: Coords | "In room cache"): void
  {
    const elementId =
      coords === "In room cache" ? "In room cache" : coords.toString();

    this.coords = coords;
    this.roomBackground.setId(elementId);
  }

  public setRoom(room: Room | "Doesn't exist"): void
  {
    if (room === "Doesn't exist")
    {
      this.roomIcon.hide();
      return;
    }

    this.roomIcon.setSize
    (
      room.icon.pixelSize,
      room.icon.pixelSize,
      { centered: true }
    );

    this.roomIcon.setImage(room.icon.path);

    this.roomIcon.show();
  }
}

// ----------------- Auxiliary Functions ---------------------

function createRoomBackground(parent: RoomSvg): Circle
{
  const background = new Circle(parent, RoomSvg.ROOM_BACKGROUND);

  background.setRadius(Room.DEFAULT_ROOM_PIXEL_SIZE * 0.6);

  return background;
}

function createRoomIcon(parent: RoomSvg): SvgImage
{
  const roomIcon = new SvgImage(parent, "room_icon");

  // Disable mouse events on the icon (they are handled
  // by "room_background" element).
  roomIcon.setCss({ pointerEvents: "none" });

  roomIcon.hide();

  return roomIcon;
}