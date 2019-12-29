/*
  Part of BrutusNEXT

  Svg component that zooms the map
*/

/*
  Scale transform on MapZoomer scales everything inside it.
*/

import { Component } from "../../../Client/Gui/Component";
import { RoomsSvg } from "../../../Client/Gui/Map/RoomsSvg";
import { SvgG } from "../../../Client/Gui/Svg/SvgG";

export class MapZoomer extends SvgG
{
  private zoom = 1.0;

  private readonly rooms: RoomsSvg;

  constructor(parent: Component, name = "map_zoomer")
  {
    super(parent, name);

    // TODO: Víc než jedna rooma. A možná i pár exitů, když už v tom budu :)
    this.rooms = new RoomsSvg(this);
  }

  public setZoom(zoomFactor: number): void
  {
    this.zoom = zoomFactor;

    this.scale(zoomFactor);
  }

  public getZoom(): number { return this.zoom; }
}