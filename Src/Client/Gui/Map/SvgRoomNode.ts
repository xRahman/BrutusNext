/*
  Part of BrutusNEXT

  A room on the map
*/

import { Dom } from "../../../Client/Gui/Dom";
import { Coords } from "../../../Shared/Class/Coords";
import { Room } from "../../../Client/World/Room";
import { SvgRoom } from "../../../Client/Gui/Map/SvgRoom";
import { SvgRooms } from "../../../Client/Gui/Map/SvgRooms";
import { Image } from "../../../Client/Gui/Svg/Image";
import { Circle } from "../../../Client/Gui/Svg/Circle";
import { SvgVerticalExit } from "../../../Client/Gui/Map/SvgVerticalExit";
import { G } from "../../../Client/Gui/Svg/G";

export class SvgRoomNode extends G
{
  // public static readonly ROOM_BACKGROUND = "room_background";

  private readonly room: SvgRoom;
  private readonly exitUp: SvgVerticalExit;
  private readonly exitDown: SvgVerticalExit;

  private coords: Coords | "In cache" = "In cache";

  constructor(protected parent: SvgRooms, name = "room_node")
  {
    super(parent, name);

    this.exitUp = new SvgVerticalExit(this, "up", "exit_up");
    this.exitDown = new SvgVerticalExit(this, "down", "exit_down");
    this.room = new SvgRoom(this);

    this.hide();
  }

  public setId(id: string): void
  {
    this.room.setId(id);
  }

  public setCoords(coords: Coords | "In cache"): void
  {
    this.coords = coords;

    if (coords !== "In cache")
      this.updatePosition(coords);
  }

  public setRoom(room: Room | "Doesn't exist"): void
  {
    this.room.setRoom(room);
  }

  // ---------------- Private methods -------------------

  private updatePosition(coords: Coords): void
  {
    const roomSpacing = SvgRooms.ROOM_SPACING_PIXELS;

    this.setPosition
    (
      roomSpacing * coords.e,
      -roomSpacing * coords.n
    );
  }
}