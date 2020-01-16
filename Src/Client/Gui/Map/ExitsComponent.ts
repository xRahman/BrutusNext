/*
  Part of BrutusNEXT

  Exits on the map
*/

import { Coords } from "../../../Shared/Class/Coords";
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

  public createExitComponent
  (
    exitData: ExitComponent.ExitData,
    mapOffset: Coords
  )
  : void
  {
    const mapCoordsExitData =
    {
      from: Coords.c1MinusC2(exitData.from, mapOffset),
      to: Coords.c1MinusC2(exitData.to, mapOffset),
      bidirectional: exitData.bidirectional
    };

    const exitComponent = new ExitComponent(this, mapCoordsExitData);

    this.exits.push(exitComponent);
  }

  public clear(): void
  {
    for (const exit of this.exits)
      exit.removeFromParent();

    this.exits = [];
  }
}