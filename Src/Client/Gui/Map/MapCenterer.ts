/*
  Part of BrutusNEXT

  Svg component that centers the map in map window
*/

/*
  Note that "overflow: visible;" must be set in css of
  this component or it will clip three quarters of the map.
*/

import { Component } from "../../../Client/Gui/Component";
import { MapZoomer } from "../../../Client/Gui/Map/MapZoomer";
import { Svg } from "../../../Client/Gui/Svg/Svg";

export class MapCenterer extends Svg
{
  private readonly mapZoomer: MapZoomer;

  constructor(parent: Component, name = "map_centerer")
  {
    super(parent, name);

    this.setRelativePosition(50, 50);

    this.mapZoomer = new MapZoomer(this);
  }
}