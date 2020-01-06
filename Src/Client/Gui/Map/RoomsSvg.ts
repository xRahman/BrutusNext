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
  // TODO: Make this a set (and add appropriate checks).
  private roomSvgs: Array<RoomSvg> = [];

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

  public addRoomSvg(room: Room | "Doesn't exist", coords: Coords): void
  {
    const roomSvg = this.roomSvgCache.pop();

    if (roomSvg === undefined)
    {
      // TODO: Vysvětlit, co to znamená a co s tím.
      throw Error("No more room svg elements are left in cache");
    }

    roomSvg.setPosition(24 * coords.e, 24 * coords.s);
    roomSvg.setCoords(coords);
    roomSvg.setRoom(room);
    roomSvg.show();

    this.roomSvgs.push(roomSvg);
  }

  public clear(): void
  {
    for (const roomSvg of this.roomSvgs)
      this.putToCache(roomSvg);

    this.roomSvgs = [];
  }

  private putToCache(roomSvg: RoomSvg): void
  {
    roomSvg.setCoords("In room cache");
    roomSvg.setRoom("Doesn't exist");
    roomSvg.hide();
    this.roomSvgCache.push(roomSvg);
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