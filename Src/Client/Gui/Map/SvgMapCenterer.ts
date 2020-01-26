/*
  Part of BrutusNEXT

  Component that centers the map
*/

import { SvgMap } from "../../../Client/Gui/Map/SvgMap";
import { SvgMapZoomer } from "../../../Client/Gui/Map/SvgMapZoomer";
import { Svg } from "../../../Client/Gui/Svg/Svg";

export class SvgMapCenterer extends Svg
{
  public readonly mapZoomer: SvgMapZoomer;

  // ! Throws exception on error.
  constructor(protected parent: SvgMap, name = "map_centerer")
  {
    super(parent, name);

    this.setRelativePosition(50, 50);

    // 'overflow: "visible"' must be set to this component
    // or it will clip three quarters of the map.
    this.setCss({ overflow: "visible" });

    // ! Throws exception on error.
    this.mapZoomer = new SvgMapZoomer(this);
  }
}