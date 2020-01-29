/*
  Part of BrutusNEXT

  Vertical exit connecting two rooms on the map
*/

import { Syslog } from "../../../Shared/Log/Syslog";
import { CssColor } from "../../../Client/Gui/CssColor";
import { SvgRoom } from "../../../Client/Gui/Map/SvgRoom";
import { SvgRooms } from "../../../Client/Gui/Map/SvgRooms";
import { Path } from "../../../Client/Gui/Svg/Path";
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
    // this.exitGraphics.setMarkerEnd("Arrow");

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

    this.exitGraphics.setColor(new CssColor(255, 255, 0));
    // this.line.draw
    // (
    //   {
    //     xPixels: 0,
    //     yPixels: 0
    //   },
    //   {
    //     xPixels: sign * roomSpacing / 5,
    //     yPixels: -sign * roomSpacing / 2
    //   }
    // );
    // this.exitGraphics.draw
    // (
    //   {
    //     xPixels: sign * roomSpacing * 0.125,
    //     yPixels: 0
    //   },
    //   {
    //     xPixels: sign * roomSpacing * 0.125,
    //     yPixels: -sign * roomSpacing * 0.4
    //   }
    // );

    this.exitGraphics.draw(path);

    this.rotate(-67.5 + rotateByDirection(direction));
  }
}

// ----------------- Auxiliary Functions ---------------------

function rotateByDirection(direction: "up" | "down"): number
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