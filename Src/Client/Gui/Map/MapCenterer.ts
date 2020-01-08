/*
  Part of BrutusNEXT

  Component that centers the map
*/

/*
  Note that "overflow: visible;" must be set in css of
  this component or it will clip three quarters of the map.
*/

import { MapComponent } from "../../../Client/Gui/Map/MapComponent";
import { WorldComponent } from "../../../Client/Gui/Map/WorldComponent";
import { Svg } from "../../../Client/Gui/Svg/Svg";

export class MapCenterer extends Svg
{
  public readonly world: WorldComponent;

  constructor(parent: MapComponent, name = "map_centerer")
  {
    super(parent, name);

    this.setRelativePosition(50, 50);

    this.world = new WorldComponent(this);
  }
}