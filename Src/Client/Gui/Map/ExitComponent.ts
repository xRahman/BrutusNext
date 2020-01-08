/*
  Part of BrutusNEXT

  Connection between rooms on the map
*/

import { CssColor } from "../../../Client/Gui/CssColor";
import { Coords } from "../../../Shared/Class/Coords";
import { ExitsComponent } from "../../../Client/Gui/Map/ExitsComponent";
import { Line } from "../../../Client/Gui/Svg/Line";
import { G } from "../../../Client/Gui/Svg/G";

export class ExitComponent extends G
{
  private readonly svgLine: Line;

  constructor
  (
    parent: ExitsComponent,
    private readonly exitData: ExitComponent.ExitData,
    name = "exit"
  )
  {
    super(parent, name);

    this.svgLine = new Line(this, "exit_line");
    this.svgLine.setColor(new CssColor(255, 255, 0));
    this.svgLine.draw
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

    // this.assignEventListeners();
  }

  // ---------------- Private methods -------------------

  // private assignEventListeners(): void
  // {
  //   this.element.onmouseup = (event) => { this.onMouseUp(event); };
  // }

  // ---------------- Event handlers --------------------

  // private onLeftClick(event: MouseEvent): void
  // {
  // }

  // private onRightClick(event: MouseEvent): void
  // {
  // }
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