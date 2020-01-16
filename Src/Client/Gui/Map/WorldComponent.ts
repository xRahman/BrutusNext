/*
  Part of BrutusNEXT

  World on the map
*/

import { Dom } from "../../../Client/Gui/Dom";
import { Coords } from "../../../Shared/Class/Coords";
import { Room } from "../../../Client/World/Room";
import { World } from "../../../Client/World/World";
import { MapEditor } from "../../../Client/Editor/MapEditor";
import { RoomComponent } from "../../../Client/Gui/Map/RoomComponent";
import { RoomsComponent } from "../../../Client/Gui/Map/RoomsComponent";
import { ExitComponent } from "../../../Client/Gui/Map/ExitComponent";
import { ExitsComponent } from "../../../Client/Gui/Map/ExitsComponent";
import { MapCenterer } from "../../../Client/Gui/Map/MapCenterer";
import { MapZoomer } from "../../../Client/Gui/Map/MapZoomer";

export class WorldComponent extends MapZoomer
{
  private static instance: WorldComponent | "Not set" = "Not set";

  // ------------- Public static methods ----------------

  // ! Throws exception on error.
  public static lookAt(coords: Coords): void
  {
    // ! Throws exception on error.
    this.getInstance().lookAt(coords);
  }

  // ------------- Private static methods ---------------

  // ! Throws exception on error.
  private static getInstance(): WorldComponent
  {
    if (this.instance === "Not set")
      throw Error("An instance of WorldComponent is not created yet");

    return this.instance;
  }

  // ----------------- Private data ---------------------

  private readonly rooms: RoomsComponent;
  private readonly exits: ExitsComponent;

  private currentCoords = new Coords(0, 0, 0);

  // ! Throws exception on error.
  constructor(parent: MapCenterer, name = "world")
  {
    super(parent, name);

    // Order of creation determines drawing order.
    this.exits = new ExitsComponent(this);
    this.rooms = new RoomsComponent(this);

    this.registerEventListeners();

    // ! Throws exception on error.
    this.setInstance();
  }

  // ---------------- Private methods -------------------

  private lookAt(mapOffset: Coords): void
  {
    /// S tímhle testem by se neprovedla úvodní inicializace mapy.
    // if (targetCoords.equals(this.currentCoords))
    //   return;

    this.rebuildMap(mapOffset);

    this.currentCoords = mapOffset;
  }

  private registerEventListeners(): void
  {
    this.onclick = (event) => { this.onLeftClick(event); };
    this.onrightclick = (event) => { this.onRightClick(event); };
    this.onmouseover = (event) => { this.onMouseOver(event); };
    this.onmouseout = (event) => { this.onMouseOut(event); };
  }

  // ! Throws exception on error.
  private setInstance(): void
  {
    if (WorldComponent.instance !== "Not set")
    {
      throw Error("An instance of WorldComponent is already set."
        + " WorldComponent is a singleton at the moment - if you"
        + " need more instances of map, you need to change this");
    }

    WorldComponent.instance = this;
  }

  // ! Throws exception on error.
  private rebuildMap(mapOffset: Coords): void
  {
    const exitsData =
      updateRooms(this.rooms, mapOffset, { rebuild: true });

    rebuildExits(exitsData, this.exits, mapOffset);
  }

  // ! Throws exception on error.
  private updateMap(): void
  {
    const exitsData =
      updateRooms(this.rooms, this.currentCoords, { rebuild: false });

    rebuildExits(exitsData, this.exits, this.currentCoords);
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
    this.ensureRoomExists(coords);
  }

  // ! Throws exception on error.
  private onRightClick(event: MouseEvent): void
  {
    // ! Throws exception on error.
    const coords = parseRoomCoords(event);

    if (coords === "Not a room event")
      return;

    // ! Throws exception on error.
    this.deleteRoomIfExists(coords);
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
      this.buildConnectionTo(coords);
    }

    if (Dom.isRightButtonDown(event))
    {
      // ! Throws exception on error.
      this.deleteRoomIfExists(coords);
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
      rememberCoords(coords);

      // ! Throws exception on error.
      this.ensureRoomExists(coords);
    }

    if (Dom.isRightButtonDown(event))
    {
      // ! Throws exception on error.
      this.deleteRoomIfExists(coords);
    }
  }

  // ! Throws exception on error.
  private buildConnectionTo(coords: Coords): void
  {
    // ! Throws exception on error.
    const result = MapEditor.connectWithLastCoords(coords);

    if (result === "Changes occured")
    {
      // ! Throws exception on error.
      this.updateMap();
    }
  }

  // ! Throws exception on error.
  private ensureRoomExists(coords: Coords): void
  {
    // ! Throws exception on error.
    const result = MapEditor.ensureRoomExists(coords);

    if (result === "Changes occured")
    {
      // ! Throws exception on error.
      this.updateMap();
    }
  }

  // ! Throws exception on error.
  private deleteRoomIfExists(coords: Coords): void
  {
    // ! Throws exception on error.
    const result = MapEditor.deleteRoomIfExists(coords);

    if (result === "Changes occured")
    {
      // ! Throws exception on error.
      this.updateMap();
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
    if (Dom.getName(event.target) === RoomComponent.ROOM_BACKGROUND)
      // ! Throws exception on error.
      return Coords.fromString(event.target.id);
  }

  return "Not a room event";
}

function rememberCoords(coords: Coords): void
{
  MapEditor.setLastCoords(coords);
}

function getCoordsInViewAround(coords: Coords): Array<Coords>
{
  const coordsInView: Array<Coords> = [];

  // TODO: Provázat tohle s Rooms.ROOMS_IN_CACHE
  // (měly by to bejt stejný hodnoty).
  const from =
  {
    e: coords.e - 20,
    s: coords.s - 20
  };

  const to =
  {
    e: coords.e + 20,
    s: coords.s + 20
  };

  // Order of cycles determines oder of svg components representing
  // rooms in the DOM. Since people usually expects rows of things
  // rather than columns, we iterate nort-south direction first.
  for (let s = from.s; s <= to.s; s++)
  {
    for (let e = from.e; e <= to.e; e++)
    {
      coordsInView.push(new Coords(e, s, coords.u));
    }
  }

  return coordsInView;
}

function updateRooms
(
  rooms: RoomsComponent,
  mapOffset: Coords,
  { rebuild = false }
)
: Map<string, ExitComponent.ExitData>
{
  if (rebuild)
    rooms.clear();

  const exitsData = new Map<string, ExitComponent.ExitData>();
  const coordsInView = getCoordsInViewAround(mapOffset);

  for (const coords of coordsInView)
  {
    const room = World.getRoom(coords);

    if (room === "Nothing there")
    {
      if (rebuild)
        rooms.addRoomComponent("Doesn't exist", coords, mapOffset);
      else
        rooms.updateRoom("Doesn't exist", coords);
    }
    else
    {
      if (rebuild)
        rooms.addRoomComponent(room, coords, mapOffset);
      else
        rooms.updateRoom(room, coords);

      extractExitData(room, exitsData);
    }
  }

  return exitsData;
}

function rebuildExits
(
  exitsData: Map<string, ExitComponent.ExitData>,
  exits: ExitsComponent,
  mapOffset: Coords
)
: void
{
  exits.clear();

  for (const exitData of exitsData.values())
  {
    exits.createExitComponent(exitData, mapOffset);
  }
}

function extractExitData
(
  room: Room,
  exitsData: Map<string, ExitComponent.ExitData>
)
: void
{
  for (const exit of Object.values(room.exits))
  {
    if (exit.to === "Nowhere")
      continue;

    const from = room.coords;
    const to = exit.to;
    const exitId = Coords.createExitId(from, to);

    const exitData = exitsData.get(exitId);

    if (exitData === undefined)
    {
      // DEBUG
      // console.log
      // (
      //   "Setting onedirectional exit",
      //   exitName,
      //   "from:",
      //   from,
      //   "to:",
      //   to,
      //   "exitId:",
      //   exitId
      // );

      exitsData.set(exitId, { from, to, bidirectional: false });
    }
    else
    {
      // DEBUG
      // console.log
      // (
      //   "Setting bidirectional exit",
      //   exitName,
      //   "from:",
      //   from,
      //   "to:",
      //   to,
      //   "exitId:",
      //   exitId
      // );

      exitsData.set(exitId, { from, to, bidirectional: true });
    }
  }
}