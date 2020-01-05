/*
  Part of BrutusNEXT

   Functions working with SVG circle element
*/

import { SvgElement } from "../../../Client/Gui/Svg/SvgElement";

export namespace SvgCircleElement
{
  export function create(): SVGCircleElement
  {
    return document.createElementNS(SvgElement.SVG_NAMESPACE, "circle");
  }

  export function setRadius
  (
    element: SVGCircleElement,
    radiusPixels: number
  )
  : void
  {
    element.setAttribute("r", String(radiusPixels));
  }
}