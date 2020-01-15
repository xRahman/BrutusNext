/*
  Part of BrutusNEXT

  A room on the map
*/

import { Coords } from "../../../Shared/Class/Coords";
import { Room } from "../../../Client/World/Room";
import { RoomsComponent } from "../../../Client/Gui/Map/RoomsComponent";
import { Image } from "../../../Client/Gui/Svg/Image";
import { Circle } from "../../../Client/Gui/Svg/Circle";
import { G } from "../../../Client/Gui/Svg/G";

export class RoomComponent extends G
{
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

    this.roomIcon.setSize(room.icon.pixelSize, room.icon.pixelSize);

    this.roomIcon.setImage(room.icon.path);

    this.roomIcon.show();
  }
}

// ----------------- Auxiliary Functions ---------------------

function createRoomBackground(parent: RoomComponent): Circle
{
  const background = new Circle(parent, RoomComponent.ROOM_BACKGROUND);

  background.setRadius(Room.DEFAULT_ROOM_PIXEL_SIZE * 0.6);

  return background;
}

function createRoomIcon(parent: RoomComponent): Image
{
  const roomIcon = new Image(parent, "room_icon");

  roomIcon.disableMouseEvents();
  roomIcon.hide();

  return roomIcon;
}