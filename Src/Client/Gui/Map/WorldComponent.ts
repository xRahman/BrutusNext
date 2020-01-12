/*
  Part of BrutusNEXT

  World on the map
*/

import { Dom } from "../../../Client/Gui/Dom";
import { Coords } from "../../../Shared/Class/Coords";
import { MapEditor } from "../../../Client/Editor/MapEditor";
import { Gui } from "../../../Client/Gui/Gui";
import { RoomComponent } from "../../../Client/Gui/Map/RoomComponent";
import { RoomsComponent } from "../../../Client/Gui/Map/RoomsComponent";
import { ExitsComponent } from "../../../Client/Gui/Map/ExitsComponent";
import { MapCenterer } from "../../../Client/Gui/Map/MapCenterer";
import { MapZoomer } from "../../../Client/Gui/Map/MapZoomer";

export class WorldComponent extends MapZoomer
{
  private readonly rooms: RoomsComponent;
  private readonly exits: ExitsComponent;

  constructor(parent: MapCenterer, name = "world")
  {
    super(parent, name);

    // Order of creation determines drawing order.
    this.exits = Gui.setExitsComponent(new ExitsComponent(this));
    this.rooms = Gui.setRoomsComponent(new RoomsComponent(this));

    this.registerEventListeners();
  }

  // ---------------- Private methods -------------------

  private registerEventListeners(): void
  {
    // this.element.onclick = (event) => { this.onLeftClick(event); };
    this.onclick = (event) => { this.onLeftClick(event); };

    this.onrightclick = (event) => { this.onRightClick(event); };
    this.onmouseover = (event) => { this.onMouseOver(event); };
    this.onmouseout = (event) => { this.onMouseOut(event); };
  }

  // ---------------- Event handlers --------------------

  // ! Throws exception on error.
  private onLeftClick(event: MouseEvent): void
  {
    const coords = getRoomCoords(event);

    if (!coords)
      return;

    // ! Throws exception on error.
    ensureRoomExists(coords);
  }

  // ! Throws exception on error.
  private onRightClick(event: MouseEvent): void
  {
    const coords = getRoomCoords(event);

    if (!coords)
      return;

    // ! Throws exception on error.
    deleteRoomIfExists(coords);
  }

  // ! Throws exception on error.
  private onMouseOver(event: MouseEvent): void
  {
    const coords = getRoomCoords(event);

    if (!coords)
      return;

    // Left mouse button down.
    if (event.buttons === 1)
      // ! Throws exception on error.
      buildConnectionTo(coords);

    // Right mouse button down.
    if (event.buttons === 2)
      // ! Throws exception on error.
      deleteRoomIfExists(coords);
  }

  // ! Throws exception on error.
  private onMouseOut(event: MouseEvent): void
  {
     const coords = getRoomCoords(event);

    if (!coords)
      return;

    // Left mouse button down.
    if (event.buttons === 1)
    {
      rememberCoords(coords);

      // ! Throws exception on error.
      ensureRoomExists(coords);
    }

    // Left mouse button down.
    if (event.buttons === 2)
    {
      // ! Throws exception on error.
      deleteRoomIfExists(coords);
    }
  }
}

// ----------------- Auxiliary Functions ---------------------

function getRoomCoords(event: Event): Coords | undefined
{
  if (event.target === null)
      return undefined;

  if (event.target instanceof SVGElement)
  {
    if (Dom.getName(event.target) === RoomComponent.ROOM_BACKGROUND)
      // ! Throws exception on error.
      return Coords.fromString(event.target.id);
  }

  return undefined;
}

function rememberCoords(coords: Coords): void
{
  MapEditor.setLastCoords(coords);
}

function connectWithLastCoords
(
  newCoords: Coords
)
: "Changes occured" | "No change"
{
  const lastCoords = MapEditor.getLastCoords();

  if (lastCoords === "Not set")
    return "No change";

  if (!lastCoords.isAdjacentTo(newCoords))
    return "No change";

  return MapEditor.createConnectedRooms(lastCoords, newCoords);
}

// ! Throws exception on error.
function buildConnectionTo(coords: Coords): void
{
  const result = connectWithLastCoords(coords);

  if (result === "Changes occured")
  {
    // ! Throws exception on error.
    Gui.updateMap();

    // // Gui.updateMap() will destroy all room svg components
    // // (including this one) and create new ones. If mouse
    // // pointer moves fast, it can leave the room svg element
    // // before new one is created so the onmouseleave() won't
    // // trigger and coords won't be remembered. So we do it here
    // // instead.
    // rememberCoords(coords);
  }
}

// ! Throws exception on error.
function ensureRoomExists(coords: Coords): void
{
  // ! Throws exception on error.
  const result = MapEditor.ensureRoomExists(coords);

  if (result === "Changes occured")
    Gui.updateMap();
}

// ! Throws exception on error.
function deleteRoomIfExists(coords: Coords): void
{
  // ! Throws exception on error.
  const result = MapEditor.deleteRoomIfExists(coords);

  if (result === "Changes occured")
    Gui.updateMap();
}