/*
  Part of BrutusNEXT

  Horizontal exits on the map
*/

import { MudMap } from "../../../Client/Gui/Map/MudMap";
import { SvgWorld } from "../../../Client/Gui/Map/SvgWorld";
import { SvgHorizontalExit } from "../../../Client/Gui/Map/SvgHorizontalExit";
import { G } from "../../../Client/Gui/Svg/G";

const EXITS_IN_CACHE = MudMap.maxExitsInView();

export class SvgExits extends G
{
  // [key]: concatenated string representations of coords of connected rooms.
  private readonly svgExits = new Map<string, SvgHorizontalExit>();

  private readonly exitCache = new Set<SvgHorizontalExit>();

  constructor(protected parent: SvgWorld, name = "exits")
  {
    // Speed optimalization:
    //   This component is not inserted to parent right away
    // because we will be creating large number of children
    // inside it. To prevent recalculating of DOM each time
    // a room component is inserted, we create them while
    // we are outside of DOM and than insert ourselves with
    // children already created.
    super("No parent", name);

    this.populateExitCache();

    this.setParent(parent);
  }

  // ---------------- Public methods --------------------

  public addExit(exitData: MudMap.ExitData): void
  {
    // ! Throws exception on error.
    const svgExit = this.getExitFromCache();

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
        + ` representing exit ${id} in the map`);
    }

    this.svgExits.set(id, component);
  }

  private populateExitCache(): void
  {
    if (this.exitCache.size !== 0)
      throw Error("Attempt to populate exit cache which is not empty");

    for (let i = 0; i < EXITS_IN_CACHE; i++)
    {
      this.putToCache(new SvgHorizontalExit(this));
    }
  }

  // ! Throws exception on error.
  private putToCache(svgExit: SvgHorizontalExit): void
  {
    if (this.exitCache.has(svgExit))
    {
      throw Error("Attempt to add an element to exit cache which is"
        + " already there");
    }

    svgExit.setId("In cache");
    svgExit.hide();

    this.exitCache.add(svgExit);
  }

  // ! Throws exception on error.
  private getExitFromCache(): SvgHorizontalExit
  {
    const component = Array.from(this.exitCache).pop();

    if (!component)
      throw Error("There are no more exit components in the cache");

    this.exitCache.delete(component);

    return component;
  }
}