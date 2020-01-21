/*
  Part of BrutusNEXT

  Exit connecting two rooms on the map
*/

import { CssColor } from "../../../Client/Gui/CssColor";
import { Coords } from "../../../Shared/Class/Coords";
import { WorldMap } from "../../../Client/Gui/Map/WorldMap";
import { RoomsComponent } from "../../../Client/Gui/Map/RoomsComponent";
import { ExitsComponent } from "../../../Client/Gui/Map/ExitsComponent";
import { Line } from "../../../Client/Gui/Svg/Line";
import { G } from "../../../Client/Gui/Svg/G";

export class ExitComponent extends G
{
  private readonly line: Line;

  constructor
  (
    protected parent: ExitsComponent,
    exitData: WorldMap.ExitData,
    name = "exit"
  )
  {
    super(parent, name);

    const roomSpacing = RoomsComponent.roomSpacingPixels;

    this.line = new Line(this, "exit_line");
    this.line.setColor(new CssColor(255, 255, 0));
    this.line.draw
    (
      {
        xPixels: roomSpacing * exitData.from.e,
        yPixels: -roomSpacing * exitData.from.n
      },
      {
        xPixels: roomSpacing * exitData.to.e,
        yPixels: -roomSpacing * exitData.to.n
      }
    );
  }
}

// // ------------------ Type Declarations ----------------------

// export namespace ExitComponent
// {
//   export type ExitData =
//   {
//     from: Coords,
//     to: Coords,
//     bidirectional: boolean
//   };
// }