/*
  Part of BrutusNext

  A player connection
*/

// import { Player } from "../../Shared/Game/Player";
// import { Socket } from "../../Shared/Net/Socket";

// export abstract class Connection<T extends Player> extends Socket
// {
//   public player: T | "Not logged in" = "Not logged in";

//   // ---------------- Public methods --------------------

//   // ! Throws exception on error.
//   public getPlayer(): T
//   {
//     if (this.player === "Not logged in")
//     {
//       throw Error(`Player ${this.getPlayerInfo()}`
//       + ` is not logged in yet`);
//     }

//     return this.player;
//   }

//   public setPlayer(player: T)
//   {
//     this.player = player;
//   }

//   public isLoggedIn()
//   {
//     return this.player !== "Not logged in";
//   }

//   public abstract getPlayerInfo(): string;
// }