/*
  Part of BrutusNEXT

  Class implementing cache of child components
*/

import { Component } from "../../../Client/Gui/Component";
import { G } from "../../../Client/Gui/Svg/G";

export class SvgComponentCache<T extends Component> extends G
{
  private readonly componentCache = new Set<T>();

  constructor
  (
    protected parent: Component,
    cacheSize: number,
    ComponentConstructor: new (...args: any[]) => T,
    name: string
  )
  {
    // Speed optimalization:
    //   This component is not inserted to parent right away
    // because we will be creating large number of children
    // inside it. To prevent recalculating of DOM each time
    // a room component is inserted, we create them while
    // we are outside of DOM and than insert ourselves with
    // children already created.
    super("No parent", name);

    this.populateCache(cacheSize, ComponentConstructor);

    this.setParent(parent);
  }

  // --------------- Protected methods ------------------

  // ! Throws exception on error.
  protected putToCache(component: T): void
  {
    if (this.componentCache.has(component))
    {
      throw Error("Attempt to put component to cache which is"
        + " already there");
    }

    component.setId("In cache");
    component.hide();

    this.componentCache.add(component);
  }

  // ! Throws exception on error.
  protected getComponentFromCache(): T
  {
    const component = Array.from(this.componentCache).pop();

    if (!component)
      throw Error("There are no more components in the cache");

    this.componentCache.delete(component);

    return component;
  }

  // ---------------- Private methods -------------------

  private populateCache
  (
    cacheSize: number,
    ComponentConstructor: new (...args: any[]) => T
  )
  : void
  {
    if (this.componentCache.size !== 0)
      throw Error("Attempt to populate exit cache which is not empty");

    for (let i = 0; i < cacheSize; i++)
    {
      this.putToCache(new ComponentConstructor(this));
    }
  }
}