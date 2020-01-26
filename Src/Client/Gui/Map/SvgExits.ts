/*
  Part of BrutusNEXT

  Horizontal exits on the map
*/

import { MudMap } from "../../../Client/Gui/Map/MudMap";
import { SvgWorld } from "../../../Client/Gui/Map/SvgWorld";
import { SvgHorizontalExit } from "../../../Client/Gui/Map/SvgHorizontalExit";
import { G } from "../../../Client/Gui/Svg/G";

export class SvgExits extends G
{
  private exits: Array<SvgHorizontalExit> = [];

  constructor(protected parent: SvgWorld, name = "exits")
  {
    super(parent, name);
  }

  public createExitComponent(exitData: MudMap.ExitData): void
  {
    // const mapCoordsExitData =
    // {
    //   from: Coords.c1MinusC2(exitData.from, mapOffset),
    //   to: Coords.c1MinusC2(exitData.to, mapOffset),
    //   bidirectional: exitData.bidirectional
    // };

    // const exitComponent = new ExitComponent(this, mapCoordsExitData);
    const exitComponent = new SvgHorizontalExit(this, exitData);

    this.exits.push(exitComponent);
  }

  public clear(): void
  {
    for (const exit of this.exits)
      exit.removeFromParent();

    this.exits = [];
  }
}