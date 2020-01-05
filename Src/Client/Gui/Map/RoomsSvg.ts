/*
  Part of BrutusNEXT

  Svg container for rooms on the map
*/

import { Coords } from "../../../Shared/Class/Coords";
import { Room } from "../../../Client/World/Room";
import { MapZoomer } from "../../../Client/Gui/Map/MapZoomer";
import { RoomSvg } from "../../../Client/Gui/Map/RoomSvg";
import { G } from "../../../Client/Gui/Svg/G";
import { SvgCircleElement } from "../../../Client/Gui/Svg/SvgCircleElement";
import { SvgImageElement } from "../../../Client/Gui/Svg/SvgImageElement";
import { SvgElement } from "../../../Client/Gui/Svg/SvgElement";

export class RoomsSvg extends G
{
  // private rooms: Array<RoomSvg> = [];

  constructor(parent: MapZoomer, name = "rooms")
  {
    super(parent, name);
  }

  public createRoomSvg(room: Room | "Doesn't exist", coords: Coords): void
  {
    const roomSvg = SvgElement.create("g");

    SvgElement.translate(roomSvg, 24 * coords.e, 24 * coords.s);

    const roomBackground = SvgCircleElement.create();

    SvgElement.setName(roomBackground, "room_background");
    SvgElement.setId(roomBackground, coords.toString());

    SvgCircleElement.setRadius
    (
      roomBackground,
      Room.DEFAULT_ROOM_PIXEL_SIZE * 0.6
    );

    let iconTexture = Room.DEFAULT_ROOM_ICON;

    if (room !== "Doesn't exist")
      iconTexture = room.icon.path;

    const roomIcon = SvgImageElement.create
    (
      {
        name: "room_icon",
        widthPixels: Room.DEFAULT_ROOM_PIXEL_SIZE,
        heightPixels: Room.DEFAULT_ROOM_PIXEL_SIZE,
        texture: iconTexture,
        centered: true,
        visible: room !== "Doesn't exist"
      }
    );

    // Disable mouse events on the icon so they are handled
    // by "room_background" element.
    SvgElement.setcss(roomIcon, { pointerEvents: "none" });

    roomSvg.appendChild(roomBackground);
    roomSvg.appendChild(roomIcon);

    // TODO: Appendovat do nepřipojeného containeru
    //  a připojit ho, až v něm bude všechno vyrobeno
    //  (tzn. asi vyrábět všechno v konstruktoru a ne
    //   až tady).
    this.element.appendChild(roomSvg);

    // this.updateRoomIcon(room);

    // this.rooms.push(roomSvg);
  }

  public clear(): void
  {
    // for (const room of this.rooms)
    //   room.removeFromParent();

    // this.rooms = [];
  }

  // ---------------- Private methods -------------------

  private updateRoomIcon(room: Room | "Doesn't exist"): void
  {
    // if (room === "Doesn't exist")
    // {
    //   if (this.icon !== "Doesn't exist")
    //   {
    //     this.icon.removeFromParent();
    //     this.icon = "Doesn't exist";
    //   }

    //   return;
    // }

    // this.icon = new SvgImage
    // (
    //   {
    //     parent: this,
    //     name: "room_icon",
    //     widthPixels: room.icon.pixelSize,
    //     heightPixels: room.icon.pixelSize,
    //     imagePath: room.icon.path,
    //     isCentered: true
    //   }
    // );

    // // Disable mouse events on the icon so they are handled
    // // by "room_background" element.
    // this.icon.setCss({ pointerEvents: "none" });
  }
}