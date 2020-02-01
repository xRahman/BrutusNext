/*
  Part of BrutusNEXT

  Vertical exit connecting two rooms on the map
*/

import { Syslog } from "../../../Shared/Log/Syslog";
import { CssColor } from "../../../Client/Gui/CssColor";
import { SvgRoom } from "../../../Client/Gui/Map/SvgRoom";
import { SvgRooms } from "../../../Client/Gui/Map/SvgRooms";
import { Path } from "../../../Client/Gui/Svg/Path";
import { SvgHorizontalExits } from
  "../../../Client/Gui/Map/SvgHorizontalExits";
import { G } from "../../../Client/Gui/Svg/G";

export class SvgVerticalExit extends G
{
  private readonly exitGraphics: Path;

  constructor
  (
    protected parent: SvgRoom,
    direction: "up" | "down",
    name = "exit"
  )
  {
    super(parent, name);

    this.exitGraphics = new Path(this, "exit_line");
    this.updateGraphics(direction);
  }

  // ---------------- Public methods --------------------

  // ---------------- Private methods -------------------

  private updateGraphics(direction: "up" | "down"): void
  {
    const roomSpacing = SvgRooms.ROOM_SPACING_PIXELS;

    const path = `M 0 0`
      + ` L ${roomSpacing * 0.4} 0`
      + ` L ${roomSpacing * 0.4} ${roomSpacing * 0.03}`
      + ` L ${roomSpacing * 0.45} 0`
      + ` L ${roomSpacing * 0.4} -${roomSpacing * 0.03}`
      + ` L ${roomSpacing * 0.4} 0`;

    this.exitGraphics.setStrokeColor(new CssColor(255, 255, 0));
    this.exitGraphics.setStrokeWidth(SvgHorizontalExits.LINE_WIDTH_PIXELS);
    this.exitGraphics.draw(path);
    this.rotate(-67.5 + angleToDirection(direction));
  }
}

// ----------------- Auxiliary Functions ---------------------

function angleToDirection(direction: "up" | "down"): number
{
  switch (direction)
  {
    case "up":
      return 0;

    case "down":
      return 180;

    default:
      throw Syslog.reportMissingCase(direction);
  }
}