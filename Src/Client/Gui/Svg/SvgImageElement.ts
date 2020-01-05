/*
  Part of BrutusNEXT

   Functions working with SVG circle element
*/

import { SvgElement } from "../../../Client/Gui/Svg/SvgElement";

export namespace SvgImageElement
{
  export const SVG_XLINK_NAMESPACE = "http://www.w3.org/1999/xlink";

  export function create
  (
    {
      // parent,
      name,
      widthPixels,
      heightPixels,
      texture,
      centered,
      visible
    } :
    {
      // parent: Element,
      name: string,
      widthPixels: number,
      heightPixels: number,
      texture: string,
      centered: boolean,
      visible: boolean
    }
  )
  : SVGImageElement
  {
    const image = document.createElementNS(SvgElement.SVG_NAMESPACE, "image");

    SvgElement.setName(image, name);

    SvgElement.setWidthAndHeight(image, widthPixels, heightPixels);

    setTexture(image, texture);

    if (centered)
      SvgElement.translate(image, -widthPixels / 2, -heightPixels / 2);

    if (!visible)
      hide(image);

    return image;
  }

  export function setTexture
  (
    element: SVGImageElement,
    path: string
  )
  : void
  {
    element.setAttributeNS(SVG_XLINK_NAMESPACE, "href", path);
  }

  export function hide(element: SVGImageElement): void
  {
    // TODO: Tohle asi není dobrej nápad - zůstanou aktivní
    //   envent handlery. Spíš bych měl všechno hidovat stejně
    // (Na druhou stranu takhle si nemusím pamatovat původní
    //  display mód).
    element.setAttribute("visibility", "hidden");
  }

  export function show(element: SVGImageElement): void
  {
    element.setAttribute("visibility", "visible");
  }
}