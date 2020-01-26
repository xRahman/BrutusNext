/*
  Part of BrutusNEXT

  A room on the map
*/

import { Dom } from "../../../Client/Gui/Dom";
import { Coords } from "../../../Shared/Class/Coords";
import { Room } from "../../../Client/World/Room";
import { SvgRooms } from "../../../Client/Gui/Map/SvgRooms";
import { Image } from "../../../Client/Gui/Svg/Image";
import { Circle } from "../../../Client/Gui/Svg/Circle";
import { G } from "../../../Client/Gui/Svg/G";

export class SvgRoom extends G
{
  public static get roomPixelSize(): number
  {
    return Dom.remToPixels(0.75);
  }

  public static readonly ROOM_BACKGROUND = "room_background";

  private readonly roomBackground: Circle;
  private readonly roomIcon: Image;

  private coords: Coords | "In cache" = "In cache";

  constructor(protected parent: SvgRooms, name = "room")
  {
    super(parent, name);

    this.roomBackground = createRoomBackground(this);

    this.hide();

    this.roomIcon = createRoomIcon(this);
  }

  public setId(id: string): void
  {
    // Id of 'room_background' element is used
    // when processing mouse events to determine
    // which room has been clicked on.
    this.roomBackground.setId(id);
  }

  public setCoords(coords: Coords | "In cache"): void
  {
    this.coords = coords;

    if (coords !== "In cache")
      this.updatePosition(coords);
  }

  public setRoom(room: Room | "Doesn't exist"): void
  {
    if (room === "Doesn't exist")
    {
      this.roomIcon.hide();
      return;
    }

    const iconPixelSize = SvgRoom.roomPixelSize * room.icon.scale;

    this.roomIcon.setSize(iconPixelSize, iconPixelSize);

    this.roomIcon.setImage(room.icon.path);

    this.roomIcon.show();
  }

  // ---------------- Private methods -------------------

  private updatePosition(coords: Coords): void
  {
    const roomSpacing = SvgRooms.roomSpacingPixels;

    this.setPosition
    (
      roomSpacing * coords.e,
      -roomSpacing * coords.n
    );
  }
}

// ----------------- Auxiliary Functions ---------------------

function createRoomBackground(parent: SvgRoom): Circle
{
  const background = new Circle(parent, SvgRoom.ROOM_BACKGROUND);

  background.setRadius(1.2 * SvgRoom.roomPixelSize / 2);

  return background;
}

function createRoomIcon(parent: SvgRoom): Image
{
  const roomIcon = new Image(parent, "room_icon");

  roomIcon.disableMouseEvents();
  roomIcon.hide();

  return roomIcon;
}