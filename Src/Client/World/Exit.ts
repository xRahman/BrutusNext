/*
  Part of BrutusNEXT

  Client-side exit
*/

import { Room } from "../../Client/World/Room";

let idCount = 0;

export class Exit
{
  public id: number;

  constructor(private readonly rooms: { room1: Room, room2: Room })
  {
    // TODO: Použít idčko entity.
    this.id = idCount;
    idCount++;
  }
}