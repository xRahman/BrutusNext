/*
  Part of BrutusNEXT

  Horizontal exits on the map
*/

import { MudMap } from "../../../Client/Gui/Map/MudMap";
import { SvgWorld } from "../../../Client/Gui/Map/SvgWorld";
import { SvgHorizontalExit } from "../../../Client/Gui/Map/SvgHorizontalExit";
import { SvgComponentCache } from "../../../Client/Gui/Svg/SvgComponentCache";

export class SvgExits extends SvgComponentCache<SvgHorizontalExit>
{
  // [key]: concatenated string representations of coords of connected rooms.
  private readonly svgExits = new Map<string, SvgHorizontalExit>();

  constructor(protected parent: SvgWorld, name = "exits")
  {
    super(parent, MudMap.maxExitsInView(), SvgHorizontalExit, name);
  }

  // ---------------- Public methods --------------------

  public addExit(exitData: MudMap.ExitData): void
  {
    // ! Throws exception on error.
    const svgExit = this.getComponentFromCache();

    svgExit.setExitData(exitData);
    svgExit.show();

    // ! Throws exception on error.
    this.addSvgExit(exitData.id, svgExit);
  }

  public clear(): void
  {
    for (const svgExit of this.svgExits.values())
      this.putToCache(svgExit);

    this.svgExits.clear();
  }

  // ---------------- Private methods -------------------

  // ! Throws exception on error.
  private addSvgExit(id: string, component: SvgHorizontalExit): void
  {
    if (this.svgExits.has(id))
    {
      throw Error(`There already is a component`
        + ` representing exit ${id} on the map`);
    }

    this.svgExits.set(id, component);
  }
}