/*
  Part of BrutusNEXT

  World on the map
*/

import { Coords } from "../../../Shared/Class/Coords";
import { Exit } from "../../../Client/World/Exit";
import { Room } from "../../../Client/World/Room";
import { World } from "../../../Client/World/World";
import { WorldComponent } from "../../../Client/Gui/Map/WorldComponent";

// Radius '0' wmeans that only 1 room is displayed,
// '1' means 3x3 rooms, '2' means 5x5 rooms etc.
const VIEW_RADIUS = 20;

let viewCoords = new Coords(0, 0, 0);

let worldComponent: WorldComponent | "Not set" = "Not set";

export namespace WorldMap
{
  export type ExitData =
  {
    from: Coords,
    to: Coords,
    bidirectional: boolean
  };

  export type ExitsData = Map<string, ExitData>;

  export type RoomsAndCoords =
    Array<{ room: Room | "Doesn't exist", coords: Coords }>;

  export function countRoomsInView(): number
  {
    return ((2 * VIEW_RADIUS) + 1) ** 2;
  }

  // ! Throws exception on error.
  export function setWorldComponent(component: WorldComponent): void
  {
    if (worldComponent !== "Not set")
      throw Error("World component is already set to WorldMap");

    worldComponent = component;
  }

  // ! Throws exception on error.
  export function lookAt(coords: Coords): void
  {
    viewCoords = coords;
    update({ rebuild: true });
    getWorldComponent().translateTo(coords);
  }

  // ! Throws exception on error.
  export function update({ rebuild }: { rebuild: boolean }): void
  {
    const roomsInView = getRoomsInView();
    const exitsData = extractExitsData(roomsInView);

    getWorldComponent().update(roomsInView, exitsData, { rebuild });
  }

  /// TODO: Tohle by asi neměla dělat mapa, ale Character, nebo tak něco.
  ///    Odtamtud by se pak mělo zavolat WorldMap.lookAt(coords);
  // ! Throws exception on error.
  export function stepInDirection(direction: Exit.Direction): void
  {
    // ! Throws exception on error.
    const vector = Exit.getUnitVector(direction);

    lookAt(Coords.add(viewCoords, vector));
  }
}

// ----------------- Auxiliary Functions ---------------------

function getCoordsInView(): Array<Coords>
{
  const coordsInView: Array<Coords> = [];

  const from =
  {
    e: viewCoords.e - VIEW_RADIUS,
    n: viewCoords.n - VIEW_RADIUS
  };

  const to =
  {
    e: viewCoords.e + VIEW_RADIUS,
    n: viewCoords.n + VIEW_RADIUS
  };

  // Order of cycles determines oder of svg components representing
  // rooms. Since people usually expects rows of things rather than
  // columns, we iterate north-south direction first.
  for (let n = from.n; n <= to.n; n++)
  {
    for (let e = from.e; e <= to.e; e++)
    {
      coordsInView.push(new Coords(e, n, viewCoords.u));
    }
  }

  return coordsInView;
}

function getRoomsInView(): WorldMap.RoomsAndCoords
{
  const coordsInView = getCoordsInView();
  const roomsInView: WorldMap.RoomsAndCoords = [];

  for (const coords of coordsInView)
  {
    const room = World.getRoom(coords);

    roomsInView.push({ room, coords });
  }

  return roomsInView;
}

function extractExitsData
(
  roomsInView: WorldMap.RoomsAndCoords
)
: WorldMap.ExitsData
{
  const exitsData = new Map<string, WorldMap.ExitData>();

  for (const { room } of roomsInView)
  {
    if (room !== "Doesn't exist")
      extractExitData(room, exitsData);
  }

  return exitsData;
}

function extractExitData(room: Room, exitsData: WorldMap.ExitsData): void
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

// ! Throws exception on error.
function getWorldComponent(): WorldComponent
{
  if (worldComponent === "Not set")
    throw Error("World component is not set to WorldMap yet");

  return worldComponent;
}