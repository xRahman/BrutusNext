/*
  Part of BrutusNEXT

  Rooms on the map
*/

import { Dom } from "../../../Client/Gui/Dom";
import { Coords } from "../../../Shared/Class/Coords";
import { Room } from "../../../Client/World/Room";
import { WorldComponent } from "../../../Client/Gui/Map/WorldComponent";
import { RoomComponent } from "../../../Client/Gui/Map/RoomComponent";
import { G } from "../../../Client/Gui/Svg/G";

/// TODO: This number should be computed from the size of SvgMap
///  component and updated dynamically when it is resized.
const ROOMS_IN_CACHE = 41 * 41;

export class RoomsComponent extends G
{
  public static get roomSpacingPixels(): number
  {
    return Dom.remToPixels(1.5);
  }

  // [key]: string representation of room coords.
  private readonly roomComponents = new Map<string, RoomComponent>();

  private readonly roomComponentCache = new Set<RoomComponent>();

  constructor(parent: WorldComponent, name = "rooms")
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
    roomCoords: Coords,
    mapOffset: Coords
  )
  : void
  {
    const roomMapCoords = Coords.c1MinusC2(roomCoords, mapOffset);
    const roomComponent = getComponentFrom(this.roomComponentCache);

    if (roomComponent === "Nothing there")
    {
      // TODO: Vysvětlit, co to znamená a co s tím.
      //  - že je ideálně třeba dynamicky updatovat velikost room cashe
      //    podle velikosti MapSvg.
      throw Error("No more room components are left in cache");
    }

    const roomSpacing = RoomsComponent.roomSpacingPixels;

    roomComponent.setCoords(roomCoords);
    roomComponent.setPosition
    (
      roomSpacing * roomMapCoords.e,
      -roomSpacing * roomMapCoords.n
    );
    roomComponent.setRoom(room);
    roomComponent.show();

    const coordsString = roomCoords.toString();

    if (this.roomComponents.has(coordsString))
    {
      throw Error(`Room with coords ${coordsString} already`
        + ` has a component in the map`);
    }

    this.roomComponents.set(coordsString, roomComponent);
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
    if (this.parent === "No parent")
      throw Error("Failed to update graphics because there is no parent");

    this.parent.updateChildGraphics(this.element);
  }

  // ---------------- Private methods -------------------

  // ! Throws exception on error.
  private populateRoomComponentCache(): void
  {
    if (this.roomComponentCache.size !== 0)
      throw Error("Attempt to populate room cache which is not empty");

    for (let i = 0; i < ROOMS_IN_CACHE; i++)
    {
      const roomComponent = new RoomComponent(this);

      roomComponent.setCoords("In cache");

      this.roomComponentCache.add(roomComponent);
    }
  }

  // ! Throws exception on error.
  private putToCache(roomComponent: RoomComponent): void
  {
    roomComponent.setCoords("In cache");
    roomComponent.setRoom("Doesn't exist");
    roomComponent.hide();

    if (this.roomComponentCache.has(roomComponent))
    {
      throw Error("Attempt to add an element to roomCache which is"
        + " already there");
    }

    this.roomComponentCache.add(roomComponent);
  }

  // ! Throws exception on error.
  private getRoomComponent(coords: Coords): RoomComponent
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
}

// ----------------- Auxiliary Functions ---------------------

function getComponentFrom
(
  roomCache: Set<RoomComponent>
)
: RoomComponent | "Nothing there"
{
  for (const value of roomCache)
  {
    roomCache.delete(value);

    // We are using the for cycle just to access the
    // first element of the set so we return right away.
    return value;
  }

  return "Nothing there";
}