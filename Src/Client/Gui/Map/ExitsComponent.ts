/*
  Part of BrutusNEXT

  Exits on the map
*/

import { WorldComponent } from "../../../Client/Gui/Map/WorldComponent";
import { ExitComponent } from "../../../Client/Gui/Map/ExitComponent";
import { G } from "../../../Client/Gui/Svg/G";

export class ExitsComponent extends G
{
  private exits: Array<ExitComponent> = [];

  constructor(parent: WorldComponent, name = "exits")
  {
    super(parent, name);
  }

  public createExitComponent(exitData: ExitComponent.ExitData): void
  {
    this.exits.push(new ExitComponent(this, exitData));
  }

  public clear(): void
  {
    for (const exit of this.exits)
      exit.removeFromParent();

    this.exits = [];
  }
}