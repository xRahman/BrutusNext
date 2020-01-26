/*
  Part of BrutusNEXT

  World on the map
*/

import { Coords } from "../../../Shared/Class/Coords";
import { Exit } from "../../../Client/World/Exit";
import { Room } from "../../../Client/World/Room";
import { World } from "../../../Client/World/World";
import { SvgWorld } from "../../../Client/Gui/Map/SvgWorld";

// Radius '0' wmeans that only 1 room is displayed,
// '1' means 3x3 rooms, '2' means 5x5 rooms etc.
const VIEW_RADIUS = 20;

let viewCoords = new Coords(0, 0, 0);

let svgWorld: SvgWorld | "Not set" = "Not set";

export namespace MudMap
{
  export type ExitData =
  {
    from: Coords,
    to: Coords,
    id: string,
    bidirectional: boolean
  };

  export type ExitsData = Map<string, ExitData>;

  export type RoomsAndCoords =
    Array<{ room: Room | "Doesn't exist", coords: Coords }>;

  export function maxRoomsInView(): number
  {
    return ((2 * VIEW_RADIUS) + 1) ** 2;
  }

  export function maxExitsInView(): number
  {
    // The formula to count maximum possible number of horizontal
    // exits for grid of (m * n) rooms (including exits leading out
    // of this grid) is: 4 * m * n + 3 * (m + n) - 2.
    //   If (m === n), the fomula simplifies to: 4 * n * n + 6 * n - 2.
    return (4 * VIEW_RADIUS * VIEW_RADIUS) + (6 * VIEW_RADIUS) - 2;
  }

  // ! Throws exception on error.
  export function setSvgWorld(component: SvgWorld): void
  {
    if (svgWorld !== "Not set")
      throw Error("Svg world component is already set to WorldMap");

    svgWorld = component;
  }

  // ! Throws exception on error.
  export function lookAt(coords: Coords): void
  {
    viewCoords = coords;
    update({ rebuild: true });
    getSvgWorld().translateTo(coords);
  }

  // ! Throws exception on error.
  export function update({ rebuild }: { rebuild: boolean }): void
  {
    const roomsInView = getRoomsInView();
    const exitsData = extractExitsData(roomsInView);

    getSvgWorld().update(roomsInView, exitsData, { rebuild });
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

function getRoomsInView(): MudMap.RoomsAndCoords
{
  const coordsInView = getCoordsInView();
  const roomsInView: MudMap.RoomsAndCoords = [];

  for (const coords of coordsInView)
  {
    const room = World.getRoom(coords);

    roomsInView.push({ room, coords });
  }

  return roomsInView;
}

function extractExitsData
(
  roomsInView: MudMap.RoomsAndCoords
)
: MudMap.ExitsData
{
  const exitsData = new Map<string, MudMap.ExitData>();

  for (const { room } of roomsInView)
  {
    if (room !== "Doesn't exist")
      extractExitData(room, exitsData);
  }

  return exitsData;
}

function extractExitData(room: Room, exitsData: MudMap.ExitsData): void
{
  for (const exit of Object.values(room.exits))
  {
    if (exit.to === "Nowhere")
      continue;

    const from = room.coords;
    const to = exit.to;
    const id = Coords.createExitId(from, to);

    const exitData = exitsData.get(id);

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

      exitsData.set(id, { from, to, id, bidirectional: false });
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

      exitsData.set(id, { from, to, id, bidirectional: true });
    }
  }
}

// ! Throws exception on error.
function getSvgWorld(): SvgWorld
{
  if (svgWorld === "Not set")
    throw Error("World component is not set to WorldMap yet");

  return svgWorld;
}