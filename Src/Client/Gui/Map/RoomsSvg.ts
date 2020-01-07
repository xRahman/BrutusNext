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
  private readonly roomSvgs: Map<string, RoomSvg> = new Map();

  // TODO: Make this a set (and add appropriate checks).
  private readonly roomSvgCache: Array<RoomSvg>;

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

    this.roomSvgCache = createRoomCache(this);

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
    const roomSvg = this.roomSvgCache.pop();

    if (roomSvg === undefined)
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

    if (this.roomSvgs.has(roomId))
      throw Error(`Room ${roomId} already has a svg component`);

    this.roomSvgs.set(roomId, roomSvg);
  }

  public clear(): void
  {
    for (const roomSvg of this.roomSvgs.values())
      this.putToCache(roomSvg);

    this.roomSvgs.clear();
  }

  public updateGraphics(): void
  {
    if (this.parent !== "No parent")
      this.parent.replaceChild(this.element);
  }

  // ---------------- Private methods -------------------

  private putToCache(roomSvg: RoomSvg): void
  {
    roomSvg.setCoords("In room cache");
    roomSvg.setRoom("Doesn't exist");
    roomSvg.hide();
    this.roomSvgCache.push(roomSvg);
  }

  // ! Throws exception on error.
  private getRoomSvg(coords: Coords): RoomSvg
  {
    const roomId = coords.toString();
    const roomSvg = this.roomSvgs.get(roomId);

    if (roomSvg === undefined)
      throw Error(`Room ${roomId} doesn't have a map svg component`);

    return roomSvg;
  }
}

// ----------------- Auxiliary Functions ---------------------

function createRoomCache(parent: RoomsSvg): Array<RoomSvg>
{
  const roomCache: Array<RoomSvg> = [];

  for (let i = 0; i < ROOMS_IN_CACHE; i++)
  {
    const roomSvg = new RoomSvg(parent);

    roomSvg.setCoords("In room cache");

    roomCache.push(roomSvg);
  }

  return roomCache;
}