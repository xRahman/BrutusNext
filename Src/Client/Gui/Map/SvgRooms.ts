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
import { SvgComponentCache } from "../../../Client/Gui/Svg/SvgComponentCache";

export class SvgRooms extends SvgComponentCache<SvgRoom>
{
  public static get ROOM_SPACING_PIXELS(): number
  {
    return Dom.remToPixels(1.5);
  }

  // [key]: string representation of room coords.
  private readonly svgRooms = new Map<string, SvgRoom>();

  constructor(protected parent: SvgWorld, name = "rooms")
  {
    super(parent, MudMap.maxRoomsInView(), SvgRoom, name);
  }

  // ---------------- Public methods --------------------

  public updateRoom(room: Room | "Doesn't exist", coords: Coords): void
  {
    const svgRoom = this.getSvgRoom(coords);

    svgRoom.setRoom(room);
  }

  // ! Throws exception on error.
  public addRoom
  (
    room: Room | "Doesn't exist",
    coords: Coords
  )
  : void
  {
    const roomId = coords.toString();

    // ! Throws exception on error.
    const svgRoom = this.getComponentFromCache();

    svgRoom.setCoords(coords);
    svgRoom.setId(roomId);
    svgRoom.setRoom(room);
    svgRoom.show();

    // ! Throws exception on error.
    this.addSvgRoom(roomId, svgRoom);
  }

  public clear(): void
  {
    for (const svgRoom of this.svgRooms.values())
      this.putToCache(svgRoom);

    this.svgRooms.clear();
  }

  // ! Throws exception on error.
  // Forces recalculating of focus, css etc.
  public updateChildGraphics(): void
  {
    this.parent.updateChildGraphics(this.element);
  }

  // ---------------- Private methods -------------------

  // ! Throws exception on error.
  private addSvgRoom(id: string, component: SvgRoom): void
  {
    if (this.svgRooms.has(id))
    {
      throw Error(`There already is a component`
        + ` representing room ${id} on the map`);
    }

    this.svgRooms.set(id, component);
  }

  // ! Throws exception on error.
  private getSvgRoom(coords: Coords): SvgRoom
  {
    const roomId = coords.toString();
    const roomComponent = this.svgRooms.get(roomId);

    if (roomComponent === undefined)
    {
      throw Error(`There is no component representing room`
        + ` on the map at coords ${coords.toString()}`);
    }

    return roomComponent;
  }
}