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
import { SvgHorizontalExits } from
  "../../../Client/Gui/Map/SvgHorizontalExits";
import { SvgMapZoomer } from "../../../Client/Gui/Map/SvgMapZoomer";
import { G } from "../../../Client/Gui/Svg/G";

export class SvgWorld extends G
{
  // ----------------- Private data ---------------------

  private readonly rooms: SvgRooms;
  private readonly horizontalExits: SvgHorizontalExits;

  // ! Throws exception on error.
  constructor(protected parent: SvgMapZoomer, name = "world")
  {
    super(parent, name);

    // Order of creation determines drawing order.
    this.horizontalExits = new SvgHorizontalExits(this);
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
    { rebuild }: { rebuild: boolean }
  )
  : void
  {
    this.updateRooms(roomsAndCoords, { rebuild });
    this.rebuildHorizontalExits(exitsData);
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

  private rebuildHorizontalExits(exitsData: MudMap.ExitsData): void
  {
    this.horizontalExits.clear();

    for (const exitData of exitsData.values())
    {
      this.horizontalExits.addExit(exitData);
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
    const result = parseRoomEvent(event);

    if (result.status === "Not a room event")
      return;

    // ! Throws exception on error.
    MapEditor.createRoom(result.coords);
  }

  // ! Throws exception on error.
  private onRightClick(event: MouseEvent): void
  {
    // ! Throws exception on error.
    const result = parseRoomEvent(event);

    if (result.status === "Not a room event")
      return;

    // ! Throws exception on error.
    MapEditor.deleteRoom(result.coords);
  }

  // ! Throws exception on error.
  private onMouseOver(event: MouseEvent): void
  {
    // ! Throws exception on error.
    const result = parseRoomEvent(event);

    if (result.status === "Not a room event")
      return;

    if (Dom.isLeftButtonDown(event))
    {
      // ! Throws exception on error.
      MapEditor.buildConnectionTo(result.coords);
    }

    if (Dom.isRightButtonDown(event))
    {
      // ! Throws exception on error.
      MapEditor.deleteRoom(result.coords);
    }
  }

  // ! Throws exception on error.
  private onMouseOut(event: MouseEvent): void
  {
    // ! Throws exception on error.
    const result = parseRoomEvent(event);

    if (result.status === "Not a room event")
      return;

    if (Dom.isLeftButtonDown(event))
    {
      MapEditor.rememberCoords(result.coords);

      // ! Throws exception on error.
      MapEditor.createRoom(result.coords);
    }

    if (Dom.isRightButtonDown(event))
    {
      // ! Throws exception on error.
      MapEditor.deleteRoom(result.coords);
    }
  }
}

// ----------------- Auxiliary Functions ---------------------

// ! Throws exception on error.
function parseRoomEvent
(
  event: Event
)
: { status: "Not a room event" } | { status: "Ok", coords: Coords }
{
  if (event.target === null)
    return { status: "Not a room event" };

  if (!(event.target instanceof SVGElement))
    return { status: "Not a room event" };

  if (Dom.getName(event.target) !== SvgRoom.ROOM_BACKGROUND)
    return { status: "Not a room event" };

  // ! Throws exception on error.
  return { status: "Ok", coords: Coords.fromString(event.target.id) };
}