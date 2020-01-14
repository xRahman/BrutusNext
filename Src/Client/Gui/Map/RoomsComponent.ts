/*
  Part of BrutusNEXT

  Rooms on the map
*/

import { Dom } from "../../../Client/Gui/Dom";
import { Component } from "../../../Client/Gui/Component";
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
    super(parent, name, "DO_NOT_INSERT");

    this.populateComponentCache();

    parent.insertElement(this.element);
  }

  public updateRoom(room: Room | "Doesn't exist", coords: Coords): void
  {
    const roomComponent = this.getRoomComponent(coords);

    roomComponent.setRoom(room);
  }

  // ! Throws exception on error.
  public addRoomComponent(room: Room | "Doesn't exist", coords: Coords): void
  {
    const roomComponent = shift(this.roomComponentCache);

    if (roomComponent === "Nothing there")
    {
      // TODO: Vysvětlit, co to znamená a co s tím.
      //  - že je ideálně třeba dynamicky updatovat velikost room cashe
      //    podle velikosti MapSvg.
      throw Error("No more room components are left in cache");
    }

    roomComponent.setCoords(coords);
    roomComponent.setPosition(24 * coords.e, 24 * coords.s);
    roomComponent.setRoom(room);
    roomComponent.show();

    const roomId = coords.toString();

    if (this.roomComponents.has(roomId))
      throw Error(`Room ${roomId} already has a svg component`);

    this.roomComponents.set(roomId, roomComponent);
  }

  public clear(): void
  {
    for (const roomComponent of this.roomComponents.values())
      this.putToCache(roomComponent);

    this.roomComponents.clear();
  }

  // ! Throws exception on error.
  // Forces recalculating of focus, css etc.
  public updateGraphics(): void
  {
    if (this.parent === "No parent")
      throw Error("Failed to update graphics because there is no parent");

    this.parent.replaceChild(this.element);
  }

  // ---------------- Private methods -------------------

  // ! Throws exception on error.
  private populateComponentCache(): void
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
    const roomId = coords.toString();
    const roomComponent = this.roomComponents.get(roomId);

    if (roomComponent === undefined)
      throw Error(`Room ${roomId} doesn't have a map svg component`);

    return roomComponent;
  }
}

// ----------------- Auxiliary Functions ---------------------

function shift(roomCache: Set<RoomComponent>): RoomComponent | "Nothing there"
{
  for (const value of roomCache)
  {
    roomCache.delete(value);

    // We are using the for cycle just to access the
    // first element of the set so we return right awayt.
    return value;
  }

  return "Nothing there";
}