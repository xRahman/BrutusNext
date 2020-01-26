/*
  Part of BrutusNEXT

  World on the map
*/

import { Dom } from "../../../Client/Gui/Dom";
import { Coords } from "../../../Shared/Class/Coords";
import { MapEditor } from "../../../Client/Editor/MapEditor";
import { MudMap } from "../../../Client/Gui/Map/MudMap";
import { SvgRoom } from "../../../Client/Gui/Map/SvgRoom";
import { SvgRooms } from "../../../Client/Gui/Map/SvgRooms";
import { SvgExits } from "../../../Client/Gui/Map/SvgExits";
import { SvgMapZoomer } from "../../../Client/Gui/Map/SvgMapZoomer";
import { G } from "../../../Client/Gui/Svg/G";

export class SvgWorld extends G
{
  // ----------------- Private data ---------------------

  private readonly rooms: SvgRooms;
  private readonly exits: SvgExits;

  // ! Throws exception on error.
  constructor(protected parent: SvgMapZoomer, name = "world")
  {
    super(parent, name);

    // Order of creation determines drawing order.
    this.exits = new SvgExits(this);
    this.rooms = new SvgRooms(this);

    this.registerEventListeners();

    // ! Throws exception on error.
    MudMap.setSvgWorld(this);
  }

  // ---------------- Public methods --------------------

  public update
  (
    roomsAndCoords: MudMap.RoomsAndCoords,
    exitsData: MudMap.ExitsData,
    { rebuild = false }
  )
  : void
  {
    this.updateRooms(roomsAndCoords, { rebuild });
    this.rebuildExits(exitsData);
  }

  public translateTo(coords: Coords): void
  {
    const roomSpacing = SvgRooms.ROOM_SPACING_PIXELS;

    this.translate
    (
      -roomSpacing * coords.e,
      roomSpacing * coords.n
    );
  }

  // ---------------- Private methods -------------------

  private updateRooms
  (
    roomsAndCoords: MudMap.RoomsAndCoords,
    { rebuild = false }
  )
  : void
  {
    if (rebuild)
      this.rooms.clear();

    for (const { room, coords } of roomsAndCoords)
    {
      if (rebuild)
        this.rooms.addRoom(room, coords);
      else
        this.rooms.updateRoom(room, coords);
    }
  }

  private rebuildExits(exitsData: MudMap.ExitsData): void
  {
    this.exits.clear();

    for (const exitData of exitsData.values())
    {
      this.exits.addExit(exitData);
    }
  }

  private registerEventListeners(): void
  {
    this.onclick = (event) => { this.onLeftClick(event); };
    this.onrightclick = (event) => { this.onRightClick(event); };
    this.onmouseover = (event) => { this.onMouseOver(event); };
    this.onmouseout = (event) => { this.onMouseOut(event); };
  }

  // ---------------- Event handlers --------------------

  // ! Throws exception on error.
  private onLeftClick(event: MouseEvent): void
  {
    // ! Throws exception on error.
    const coords = parseRoomCoords(event);

    if (coords === "Not a room event")
      return;

    // ! Throws exception on error.
    MapEditor.createRoom(coords);
  }

  // ! Throws exception on error.
  private onRightClick(event: MouseEvent): void
  {
    // ! Throws exception on error.
    const coords = parseRoomCoords(event);

    if (coords === "Not a room event")
      return;

    // ! Throws exception on error.
    MapEditor.deleteRoom(coords);
  }

  // ! Throws exception on error.
  private onMouseOver(event: MouseEvent): void
  {
    // ! Throws exception on error.
    const coords = parseRoomCoords(event);

    if (coords === "Not a room event")
      return;

    if (Dom.isLeftButtonDown(event))
    {
      // ! Throws exception on error.
      MapEditor.buildConnectionTo(coords);
    }

    if (Dom.isRightButtonDown(event))
    {
      // ! Throws exception on error.
      MapEditor.deleteRoom(coords);
    }
  }

  // ! Throws exception on error.
  private onMouseOut(event: MouseEvent): void
  {
    // ! Throws exception on error.
    const coords = parseRoomCoords(event);

    if (coords === "Not a room event")
      return;

    if (Dom.isLeftButtonDown(event))
    {
      MapEditor.rememberCoords(coords);

      // ! Throws exception on error.
      MapEditor.createRoom(coords);
    }

    if (Dom.isRightButtonDown(event))
    {
      // ! Throws exception on error.
      MapEditor.deleteRoom(coords);
    }
  }
}

// ----------------- Auxiliary Functions ---------------------

// ! Throws exception on error.
function parseRoomCoords(event: Event): Coords | "Not a room event"
{
  if (event.target === null)
      return "Not a room event";

  if (event.target instanceof SVGElement)
  {
    if (Dom.getName(event.target) === SvgRoom.ROOM_BACKGROUND)
      // ! Throws exception on error.
      return Coords.fromString(event.target.id);
  }

  return "Not a room event";
}