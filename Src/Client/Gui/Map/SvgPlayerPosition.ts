/*
  Part of BrutusNEXT

  Player position on the map
*/

import { SvgRoom } from "../../../Client/Gui/Map/SvgRoom";
import { SvgMapZoomer } from "../../../Client/Gui/Map/SvgMapZoomer";
import { Circle } from "../../../Client/Gui/Svg/Circle";

export class SvgPlayerPosition extends Circle
{
  constructor(protected parent: SvgMapZoomer, name = "player_position")
  {
    super(parent, name);

    const roomPixelSize = SvgRoom.PIXEL_SIZE;

    this.setRadius(1.4 * roomPixelSize / 2);
  }
}