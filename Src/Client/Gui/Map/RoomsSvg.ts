/*
  Part of BrutusNEXT

  Svg container for rooms on the map
*/

import { Component } from "../../../Client/Gui/Component";
import { Coords } from "../../../Shared/Class/Coords";
import { Room } from "../../../Client/World/Room";
import { MapZoomer } from "../../../Client/Gui/Map/MapZoomer";
import { RoomSvg } from "../../../Client/Gui/Map/RoomSvg";
import { G } from "../../../Client/Gui/Svg/G";

/// TODO: This number should be computed from the size of SvgMap
///  component and updated dynamically when it is resized.
const ROOMS_IN_CACHE = 41 * 41;

export class RoomsSvg extends G
{
  // [key]: string representation of room coords.
  private readonly rooms = new Map<string, RoomSvg>();

  private readonly roomCache = new Set<RoomSvg>();

  constructor(parent: MapZoomer, name = "rooms")
  {
    // Speed optimalization:
    //   This component is not inserted to parent right away
    // because we will be creating a large number of children
    // inside it. To prevent recalculating of DOM each time
    // a room component is inserted, we create them while
    // we are outside of DOM and than insert ourselves with
    // children already created.
    super(parent, name, Component.InsertMode.DO_NOT_INSERT);

    this.populateRoomCache();

    parent.insertElement(this.element, Component.InsertMode.APPEND);
  }

  public updateRoomSvg(room: Room | "Doesn't exist", coords: Coords): void
  {
    const roomSvg = this.getRoomSvg(coords);

    roomSvg.setRoom(room);
  }

  // ! Throws exception on error.
  public addRoomSvg(room: Room | "Doesn't exist", coords: Coords): void
  {
    const roomSvg = pop(this.roomCache);

    if (roomSvg === "Nothing there")
    {
      // TODO: Vysvětlit, co to znamená a co s tím.
      //  - že je ideálně třeba dynamicky updatovat velikost room cashe
      //    podle velikosti MapSvg.
      throw Error("No more room svg elements are left in cache");
    }

    roomSvg.setCoords(coords);
    roomSvg.setPosition(24 * coords.e, 24 * coords.s);
    roomSvg.setRoom(room);
    roomSvg.show();

    const roomId = coords.toString();

    if (this.rooms.has(roomId))
      throw Error(`Room ${roomId} already has a svg component`);

    this.rooms.set(roomId, roomSvg);
  }

  public clear(): void
  {
    for (const roomSvg of this.rooms.values())
      this.putToCache(roomSvg);

    this.rooms.clear();
  }

  public updateGraphics(): void
  {
    if (this.parent !== "No parent")
      this.parent.replaceChild(this.element);
  }

  // ---------------- Private methods -------------------

  // ! Throws exception on error.
  private populateRoomCache(): void
  {
    if (this.roomCache.size !== 0)
      throw Error("Attempt to populate room cache which is not empty");

    for (let i = 0; i < ROOMS_IN_CACHE; i++)
    {
      const roomSvg = new RoomSvg(this);

      roomSvg.setCoords("In room cache");

      this.roomCache.add(roomSvg);
    }
  }

  // ! Throws exception on error.
  private putToCache(roomSvg: RoomSvg): void
  {
    roomSvg.setCoords("In room cache");
    roomSvg.setRoom("Doesn't exist");
    roomSvg.hide();

    if (this.roomCache.has(roomSvg))
    {
      throw Error("Attempt to add an element to roomCache which is"
        + " already there");
    }

    this.roomCache.add(roomSvg);
  }

  // ! Throws exception on error.
  private getRoomSvg(coords: Coords): RoomSvg
  {
    const roomId = coords.toString();
    const roomSvg = this.rooms.get(roomId);

    if (roomSvg === undefined)
      throw Error(`Room ${roomId} doesn't have a map svg component`);

    return roomSvg;
  }
}

// ----------------- Auxiliary Functions ---------------------

function pop(roomCache: Set<RoomSvg>): RoomSvg | "Nothing there"
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