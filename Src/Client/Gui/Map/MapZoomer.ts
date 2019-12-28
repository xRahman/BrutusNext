/*
  Part of BrutusNEXT

  Svg component that zooms the map
*/

/*
  Scale transform on MapZoomer scales everything inside it.
*/

import { Component } from "../../../Client/Gui/Component";
import { MapRoom } from "../../../Client/Gui/Map/MapRoom";
import { SvgG } from "../../../Client/Gui/Svg/SvgG";

export class MapZoomer extends SvgG
{
  private zoom = 1.0;

  private readonly room: MapRoom;

  constructor(parent: Component, name = "map_zoomer")
  {
    super(parent, name);

    // TODO: Víc než jedna rooma. A možná i pár exitů, když už v tom budu :)
    this.room = new MapRoom(this);
  }

  public setZoom(zoomFactor: number): void
  {
    this.zoom = zoomFactor;

    this.scale(zoomFactor);
  }

  public getZoom(): number { return this.zoom; }
}