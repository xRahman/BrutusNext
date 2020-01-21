/*
  Part of BrutusNEXT

  Component that centers the map
*/

import { MapComponent } from "../../../Client/Gui/Map/MapComponent";
import { MapZoomer } from "../../../Client/Gui/Map/MapZoomer";
import { Svg } from "../../../Client/Gui/Svg/Svg";

export class MapCenterer extends Svg
{
  public readonly mapZoomer: MapZoomer;

  // ! Throws exception on error.
  constructor(protected parent: MapComponent, name = "map_centerer")
  {
    super(parent, name);

    this.setRelativePosition(50, 50);

    // 'overflow: "visible"' must be set to this component
    // or it will clip three quarters of the map.
    this.setCss({ overflow: "visible" });

    // ! Throws exception on error.
    this.mapZoomer = new MapZoomer(this);
  }
}