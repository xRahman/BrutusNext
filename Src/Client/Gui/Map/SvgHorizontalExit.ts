/*
  Part of BrutusNEXT

  Horizontal exit connecting two rooms on the map
*/

import { CssColor } from "../../../Client/Gui/CssColor";
import { MudMap } from "../../../Client/Gui/Map/MudMap";
import { SvgRooms } from "../../../Client/Gui/Map/SvgRooms";
import { SvgExits } from "../../../Client/Gui/Map/SvgExits";
import { Line } from "../../../Client/Gui/Svg/Line";
import { G } from "../../../Client/Gui/Svg/G";

export class SvgHorizontalExit extends G
{
  private readonly line: Line;

  constructor
  (
    protected parent: SvgExits,
    exitData: MudMap.ExitData,
    name = "exit"
  )
  {
    super(parent, name);

    const roomSpacing = SvgRooms.roomSpacingPixels;

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