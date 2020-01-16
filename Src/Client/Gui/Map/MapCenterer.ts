/*
  Part of BrutusNEXT

  Component that centers the map
*/

import { MapComponent } from "../../../Client/Gui/Map/MapComponent";
import { WorldComponent } from "../../../Client/Gui/Map/WorldComponent";
import { Svg } from "../../../Client/Gui/Svg/Svg";

export class MapCenterer extends Svg
{
  public readonly world: WorldComponent;

  // ! Throws exception on error.
  constructor(parent: MapComponent, name = "map_centerer")
  {
    super(parent, name);

    this.setRelativePosition(50, 50);

    // 'overflow: "visible"' must be set to this component
    // or it will clip three quarters of the map.
    this.setCss({ overflow: "visible" });

    // ! Throws exception on error.
    this.world = new WorldComponent(this);
  }
}