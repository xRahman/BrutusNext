/*
  Part of BrutusNEXT

  Rooms on the map
*/

import { Dom } from "../../../Client/Gui/Dom";
import { Coords } from "../../../Shared/Class/Coords";
import { Room } from "../../../Client/World/Room";
import { MudMap } from "../../../Client/Gui/Map/MudMap";
import { SvgWorld } from "../../../Client/Gui/Map/SvgWorld";
import { SvgRoom } from "../../../Client/Gui/Map/SvgRoom";
import { SvgRoomNode } from "../../../Client/Gui/Map/SvgRoomNode";
import { SvgComponentCache } from "../../../Client/Gui/Svg/SvgComponentCache";

export class SvgRooms extends SvgComponentCache<SvgRoomNode>
{
  public static get ROOM_SPACING_PIXELS(): number
  {
    return Dom.remToPixels(1.5);
  }

  // [key]: string representation of room coords.
  private readonly roomNodes = new Map<string, SvgRoomNode>();

  constructor(protected parent: SvgWorld, name = "rooms")
  {
    super(parent, MudMap.maxRoomsInView(), SvgRoomNode, name);
  }

  // ---------------- Public methods --------------------

  public updateRoom(room: Room | "Doesn't exist", coords: Coords): void
  {
    const roomNode = this.getRoomNode(coords);

    roomNode.setRoom(room);
  }

  // ! Throws exception on error.
  public addRoom
  (
    room: Room | "Doesn't exist",
    coords: Coords
  )
  : void
  {
    // ! Throws exception on error.
    const roomNode = this.getComponentFromCache();
    const roomId = coords.toString();

    roomNode.setCoords(coords);
    roomNode.setId(roomId);
    roomNode.setRoom(room);
    roomNode.show();

    // ! Throws exception on error.
    this.addRoomNode(roomId, roomNode);
  }

  public clear(): void
  {
    for (const svgRoom of this.roomNodes.values())
      this.putToCache(svgRoom);

    this.roomNodes.clear();
  }

  // ---------------- Private methods -------------------

  // ! Throws exception on error.
  private addRoomNode(id: string, component: SvgRoomNode): void
  {
    if (this.roomNodes.has(id))
    {
      throw Error(`There already is a component`
        + ` representing room ${id} on the map`);
    }

    this.roomNodes.set(id, component);
  }

  // ! Throws exception on error.
  private getRoomNode(coords: Coords): SvgRoomNode
  {
    const roomId = coords.toString();
    const roomNode = this.roomNodes.get(roomId);

    if (roomNode === undefined)
    {
      throw Error(`There is no component representing room`
        + ` on the map at coords ${coords.toString()}`);
    }

    return roomNode;
  }
}