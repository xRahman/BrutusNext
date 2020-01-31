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
    name = "exit"
  )
  {
    super(parent, name);

    this.line = new Line(this, "exit_line");
  }

  // ---------------- Public methods --------------------

  public setExitData(exitData: MudMap.ExitData): void
  {
    this.setId(exitData.id);
    this.updateGraphics(exitData);
  }

  // ---------------- Private methods -------------------

  private updateGraphics(exitData: MudMap.ExitData): void
  {
    const roomSpacing = SvgRooms.ROOM_SPACING_PIXELS;

    this.line.setStrokeColor(new CssColor(255, 255, 0));
    this.line.setStrokeWidth(SvgExits.LINE_WIDTH_PIXELS);
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