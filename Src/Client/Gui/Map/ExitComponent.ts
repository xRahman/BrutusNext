/*
  Part of BrutusNEXT

  Exit connecting two rooms on the map
*/

import { CssColor } from "../../../Client/Gui/CssColor";
import { Coords } from "../../../Shared/Class/Coords";
import { ExitsComponent } from "../../../Client/Gui/Map/ExitsComponent";
import { Line } from "../../../Client/Gui/Svg/Line";
import { G } from "../../../Client/Gui/Svg/G";

export class ExitComponent extends G
{
  private readonly line: Line;

  constructor
  (
    parent: ExitsComponent,
    private readonly exitData: ExitComponent.ExitData,
    name = "exit"
  )
  {
    super(parent, name);

    this.line = new Line(this, "exit_line");
    this.line.setColor(new CssColor(255, 255, 0));
    this.line.draw
    (
      {
        xPixels: 24 * exitData.from.e,
        yPixels: 24 * exitData.from.s
      },
      {
        xPixels: 24 * exitData.to.e,
        yPixels: 24 * exitData.to.s
      }
    );
  }
}

// ------------------ Type Declarations ----------------------

export namespace ExitComponent
{
  export type ExitData =
  {
    from: Coords,
    to: Coords,
    bidirectional: boolean
  };
}