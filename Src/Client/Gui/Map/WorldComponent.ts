/*
  Part of BrutusNEXT

  World on the map
*/

import { Dom } from "../../../Client/Gui/Dom";
import { Coords } from "../../../Shared/Class/Coords";
import { Exit } from "../../../Client/World/Exit";
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

  // ! Throws exception on error.
  public static stepInDirection(direction: Exit.Direction): void
  {
    // ! Throws exception on error.
    const vector = Exit.getUnitVector(direction);

    // ! Throws exception on error.
    const currentCoords = this.getInstance().currentCoords;

    WorldComponent.lookAt(Coords.add(currentCoords, vector));
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
  constructor(protected parent: MapCenterer, name = "world")
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

  private translateTo(coords: Coords): void
  {
    const roomSpacing = RoomsComponent.roomSpacingPixels;

    this.translate
    (
      -roomSpacing * coords.e,
      roomSpacing * coords.n
    );
  }

  private lookAt(coords: Coords): void
  {
    /// S tímhle testem by se neprovedla úvodní inicializace mapy.
    // if (targetCoords.equals(this.currentCoords))
    //   return;

    this.rebuildMap(coords);
    this.translateTo(coords);
    this.currentCoords = coords;
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
    const mapView = getMapView(mapOffset);

    this.updateRooms(mapView, mapOffset, { rebuild: true });
    this.rebuildExits(mapView, mapOffset);
  }

  // ! Throws exception on error.
  private updateMap(): void
  {
    const mapOffset = this.currentCoords;
    const mapView = getMapView(mapOffset);

    this.updateRooms(mapView, mapOffset, { rebuild: false });
    this.rebuildExits(mapView, mapOffset);
  }

  private updateRooms
  (
    mapView: Array<{ room: Room | "Doesn't exist", coords: Coords }>,
    mapOffset: Coords,
    { rebuild = false }
  )
  : void
  {
    if (rebuild)
      this.rooms.clear();

    for (const { room, coords } of mapView)
    {
      if (rebuild)
        this.rooms.addRoom(room, coords, mapOffset);
      else
        this.rooms.updateRoom(room, coords);
    }
  }

  private rebuildExits
  (
    mapView: Array<{ room: Room | "Doesn't exist", coords: Coords }>,
    mapOffset: Coords
  )
  : void
  {
    const exitsData = extractExitsData(mapView);

    this.exits.clear();

    for (const exitData of exitsData.values())
    {
      this.exits.createExitComponent(exitData, mapOffset);
    }
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
    s: coords.n - 20
  };

  const to =
  {
    e: coords.e + 20,
    s: coords.n + 20
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

function getMapView
(
  mapOffset: Coords
)
: Array<{ room: Room | "Doesn't exist", coords: Coords }>
{
  // TODO: Provázat tohle s Rooms.ROOMS_IN_CACHE
  // (měly by to bejt stejný hodnoty).
  const from =
  {
    e: mapOffset.e - 20,
    s: mapOffset.n - 20
  };

  const to =
  {
    e: mapOffset.e + 20,
    s: mapOffset.n + 20
  };

  const mapView: Array<{ room: Room | "Doesn't exist", coords: Coords }> = [];

  // Order of cycles determines oder of svg components representing
  // rooms in the DOM. Since people usually expects rows of things
  // rather than columns, we iterate nort-south direction first.
  for (let s = from.s; s <= to.s; s++)
  {
    for (let e = from.e; e <= to.e; e++)
    {
      const coords = new Coords(e, s, mapOffset.u);
      const getResult = World.getRoom(coords);
      const room = getResult === "Nothing there" ? "Doesn't exist" : getResult;

      mapView.push({ coords, room });
    }
  }

  return mapView;
}

function extractExitsData
(
  mapView: Array<{ room: Room | "Doesn't exist", coords: Coords }>
)
: Map<string, ExitComponent.ExitData>
{
  const exitsData = new Map<string, ExitComponent.ExitData>();

  for (const { room } of mapView)
  {
    if (room !== "Doesn't exist")
      extractExitData(room, exitsData);
  }

  return exitsData;
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
      /// DEBUG
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
      /// DEBUG
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