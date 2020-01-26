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

const ROOMS_IN_CACHE = MudMap.countRoomsInView();

export class SvgRooms extends G
{
  public static get roomSpacingPixels(): number
  {
    return Dom.remToPixels(1.5);
  }

  // [key]: string representation of room coords.
  private readonly roomComponents = new Map<string, SvgRoom>();

  private readonly roomComponentCache = new Set<SvgRoom>();

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

    this.populateRoomComponentCache();

    this.setParent(parent);
  }

  public updateRoom(room: Room | "Doesn't exist", coords: Coords): void
  {
    const roomComponent = this.getRoomComponent(coords);

    roomComponent.setRoom(room);
  }

  // ! Throws exception on error.
  public addRoom
  (
    room: Room | "Doesn't exist",
    roomCoords: Coords
  )
  : void
  {
    const roomId = roomCoords.toString();

    // ! Throws exception on error.
    const roomComponent = this.getComponentFromCache();

    roomComponent.setCoords(roomCoords);
    roomComponent.setId(roomId);
    roomComponent.setRoom(room);
    roomComponent.show();

    // ! Throws exception on error.
    this.addRoomComponent(roomId, roomComponent);
  }

  public clear(): void
  {
    for (const roomComponent of this.roomComponents.values())
      this.putToCache(roomComponent);

    this.roomComponents.clear();
  }

  // ! Throws exception on error.
  // Forces recalculating of focus, css etc.
  public updateChildGraphics(): void
  {
    this.parent.updateChildGraphics(this.element);
  }

  // ---------------- Private methods -------------------

  // ! Throws exception on error.
  private addRoomComponent(id: string, component: SvgRoom): void
  {
    if (this.roomComponents.has(id))
    {
      throw Error(`There already is a component`
        + ` representing room ${id} in the map`);
    }

    this.roomComponents.set(id, component);
  }

  // ! Throws exception on error.
  private populateRoomComponentCache(): void
  {
    if (this.roomComponentCache.size !== 0)
      throw Error("Attempt to populate room cache which is not empty");

    for (let i = 0; i < ROOMS_IN_CACHE; i++)
    {
      this.putToCache(new SvgRoom(this));
    }
  }

  // ! Throws exception on error.
  private putToCache(roomComponent: SvgRoom): void
  {
    if (this.roomComponentCache.has(roomComponent))
    {
      throw Error("Attempt to add an element to roomCache which is"
        + " already there");
    }

    roomComponent.setCoords("In cache");
    roomComponent.setId("In cache");
    roomComponent.setRoom("Doesn't exist");
    roomComponent.hide();

    this.roomComponentCache.add(roomComponent);
  }

  // ! Throws exception on error.
  private getRoomComponent(coords: Coords): SvgRoom
  {
    const coordsString = coords.toString();
    const roomComponent = this.roomComponents.get(coordsString);

    if (roomComponent === undefined)
    {
      throw Error(`There is no component representing room at coords`
        + ` ${coordsString} in the map`);
    }

    return roomComponent;
  }

  // ! Throws exception on error.
  private getComponentFromCache(): SvgRoom
  {
    const component = Array.from(this.roomComponentCache).pop();

    if (!component)
      throw Error("There are no more room components in the cache");

    this.roomComponentCache.delete(component);

    return component;
  }
}