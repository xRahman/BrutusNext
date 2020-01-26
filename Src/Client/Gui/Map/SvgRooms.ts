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
import { G } from "../../../Client/Gui/Svg/G";

const ROOMS_IN_CACHE = MudMap.maxRoomsInView();

export class SvgRooms extends G
{
  public static get ROOM_SPACING_PIXELS(): number
  {
    return Dom.remToPixels(1.5);
  }

  // [key]: string representation of room coords.
  private readonly svgRooms = new Map<string, SvgRoom>();

  private readonly roomCache = new Set<SvgRoom>();

  constructor(protected parent: SvgWorld, name = "rooms")
  {
    // Speed optimalization:
    //   This component is not inserted to parent right away
    // because we will be creating large number of children
    // inside it. To prevent recalculating of DOM each time
    // a room component is inserted, we create them while
    // we are outside of DOM and than insert ourselves with
    // children already created.
    super("No parent", name);

    this.populateRoomCache();

    this.setParent(parent);
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
    const svgRoom = this.getRoomFromCache();

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
        + ` representing room ${id} in the map`);
    }

    this.svgRooms.set(id, component);
  }

  // ! Throws exception on error.
  private populateRoomCache(): void
  {
    if (this.roomCache.size !== 0)
      throw Error("Attempt to populate room cache which is not empty");

    for (let i = 0; i < ROOMS_IN_CACHE; i++)
    {
      this.putToCache(new SvgRoom(this));
    }
  }

  // ! Throws exception on error.
  private putToCache(svgRoom: SvgRoom): void
  {
    if (this.roomCache.has(svgRoom))
    {
      throw Error("Attempt to add an element to room cache which is"
        + " already there");
    }

    svgRoom.setCoords("In cache");
    svgRoom.setId("In cache");
    svgRoom.setRoom("Doesn't exist");
    svgRoom.hide();

    this.roomCache.add(svgRoom);
  }

  // ! Throws exception on error.
  private getSvgRoom(coords: Coords): SvgRoom
  {
    const roomId = coords.toString();
    const roomComponent = this.svgRooms.get(roomId);

    if (roomComponent === undefined)
    {
      throw Error(`There is no component representing room at coords`
        + ` ${coords.toString()} in the map`);
    }

    return roomComponent;
  }

  // ! Throws exception on error.
  private getRoomFromCache(): SvgRoom
  {
    const component = Array.from(this.roomCache).pop();

    if (!component)
      throw Error("There are no more room components in the cache");

    this.roomCache.delete(component);

    return component;
  }
}