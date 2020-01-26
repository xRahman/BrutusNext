/*
  Part of BrutusNEXT

  Vertical exit connecting two rooms on the map
*/

import { Syslog } from "../../../Shared/Log/Syslog";
import { CssColor } from "../../../Client/Gui/CssColor";
import { SvgRoom } from "../../../Client/Gui/Map/SvgRoom";
import { SvgRooms } from "../../../Client/Gui/Map/SvgRooms";
import { Line } from "../../../Client/Gui/Svg/Line";
import { G } from "../../../Client/Gui/Svg/G";

export class SvgVerticalExit extends G
{
  // private readonly defs: Defs;
  // private readonly arrowMarker: Marker;
  // private readonly arrowTriangle: Path;
  private readonly exitLine: Line;

  constructor
  (
    protected parent: SvgRoom,
    direction: "up" | "down",
    name = "exit"
  )
  {
    super(parent, name);

    this.exitLine = new Line(this, "exit_line");
    this.exitLine.setMarkerEnd("Arrow");

    this.updateGraphics(direction);
  }

  // ---------------- Public methods --------------------

  // ---------------- Private methods -------------------

  private updateGraphics(direction: "up" | "down"): void
  {
    const sign = getSign(direction);
    const roomSpacing = SvgRooms.ROOM_SPACING_PIXELS;

    this.exitLine.setColor(new CssColor(255, 255, 0));
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
    this.exitLine.draw
    (
      {
        xPixels: sign * roomSpacing * 0.125,
        yPixels: 0
      },
      {
        xPixels: sign * roomSpacing * 0.125,
        yPixels: -sign * roomSpacing * 0.4
      }
    );
  }
}

// ----------------- Auxiliary Functions ---------------------

function getSign(direction: "up" | "down"): 1 | -1
{
  switch (direction)
  {
    case "up":
      return 1;

    case "down":
      return -1;

    default:
      throw Syslog.reportMissingCase(direction);
  }
}