/*
  Part of BrutusNEXT

  A room on the map
*/

import { Dom } from "../../../Client/Gui/Dom";
import { Coords } from "../../../Shared/Class/Coords";
import { Room } from "../../../Client/World/Room";
import { RoomsComponent } from "../../../Client/Gui/Map/RoomsComponent";
import { Image } from "../../../Client/Gui/Svg/Image";
import { Circle } from "../../../Client/Gui/Svg/Circle";
import { G } from "../../../Client/Gui/Svg/G";

export class RoomComponent extends G
{
  public static get roomPixelSize(): number
  {
    return Dom.remToPixels(0.75);
  }

  public static readonly ROOM_BACKGROUND = "room_background";

  private readonly roomBackground: Circle;
  private readonly roomIcon: Image;

  private coords: Coords | "In cache" = "In cache";

  constructor
  (
    parent: RoomsComponent,
    name = "room"
  )
  {
    super(parent, name);

    this.roomBackground = createRoomBackground(this);

    this.hide();

    this.roomIcon = createRoomIcon(this);
  }

  public setCoords(coords: Coords | "In cache"): void
  {
    const elementId = coords === "In cache" ? "In cache" : coords.toString();

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

    const roomPixelSize = RoomComponent.roomPixelSize * room.icon.scale;

    this.roomIcon.setSize(roomPixelSize, roomPixelSize);

    this.roomIcon.setImage(room.icon.path);

    this.roomIcon.show();
  }
}

// ----------------- Auxiliary Functions ---------------------

function createRoomBackground(parent: RoomComponent): Circle
{
  const background = new Circle(parent, RoomComponent.ROOM_BACKGROUND);

  background.setRadius(1.2 * RoomComponent.roomPixelSize / 2);

  return background;
}

function createRoomIcon(parent: RoomComponent): Image
{
  const roomIcon = new Image(parent, "room_icon");

  roomIcon.disableMouseEvents();
  roomIcon.hide();

  return roomIcon;
}