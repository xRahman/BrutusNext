/*
  Part of BrutusNEXT

  Map of the world
*/

import { CssColor } from "../../../Client/Gui/CssColor";
import { Component } from "../../../Client/Gui/Component";
import { SvgMapCenterer } from "../../../Client/Gui/Map/SvgMapCenterer";
import { Path } from "../../../Client/Gui/Svg/Path";
import { Defs } from "../../../Client/Gui/Svg/Defs";
import { Marker } from "../../../Client/Gui/Svg/Marker";
import { Svg } from "../../../Client/Gui/Svg/Svg";

export class SvgMap extends Svg
{
  private readonly defs: Defs;
  private readonly arrowMarker: Marker;
  private readonly arrowTriangle: Path;

  private readonly mapCenterer: SvgMapCenterer;

  // ! Throws exception on error.
  constructor(parent: Component, name = "map")
  {
    super(parent, name);

    this.defs = new Defs(this);
    this.arrowMarker = createArrowMarker(this.defs, "Arrow");
    this.arrowTriangle = createArrowTriangle(this.arrowMarker);

    // ! Throws exception on error.
    // Use another svg component to translate the map to the center
    // of parent element.
    this.mapCenterer = new SvgMapCenterer(this);

    this.onwheel = (event) => { this.onWheel(event); };
  }

  // ---------------- Event handlers --------------------

  private onWheel(event: WheelEvent): void
  {
    event.preventDefault();

    if (event.deltaY > 0)
      this.mapCenterer.mapZoomer.zoomIn();

    if (event.deltaY < 0)
      this.mapCenterer.mapZoomer.zoomOut();
  }
}

// ----------------- Auxiliary Functions ---------------------

function createArrowMarker(parent: Defs, id: string): Marker
{
  const arrow = new Marker(parent);

  arrow.setId(id);
  arrow.setPivot(1, 1.3);

  return arrow;
}

function createArrowTriangle(parent: Marker): Path
{
  const triangle = new Path(parent);

  triangle.setColor(new CssColor(255, 255, 0));
  triangle.draw("M 1 1 L 1 1.6 L 1.9 1 z");

  return triangle;
}