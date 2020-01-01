/*
  Part of BrutusNEXT

  Svg container for exits on the map
*/

import { MapZoomer } from "../../../Client/Gui/Map/MapZoomer";
import { ExitSvg } from "../../../Client/Gui/Map/ExitSvg";
import { G } from "../../../Client/Gui/Svg/G";

export class ExitsSvg extends G
{
  private exits: Array<ExitSvg> = [];

  constructor(parent: MapZoomer, name = "exits")
  {
    super(parent, name);
  }

  public createExitSvg(exitData: ExitSvg.ExitData): void
  {
    this.exits.push(new ExitSvg(this, exitData));
  }

  public clear(): void
  {
    for (const exit of this.exits)
      exit.removeFromParent();

    this.exits = [];
  }
}