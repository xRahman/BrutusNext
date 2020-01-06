/*
  Part of BrutusNEXT

  Svg reprezentation of a room on the map
*/

import { Coords } from "../../../Shared/Class/Coords";
import { Room } from "../../../Client/World/Room";
import { MapEditor } from "../../../Client/Editor/MapEditor";
import { Gui } from "../../../Client/Gui/Gui";
import { Component } from "../../../Client/Gui/Component";
import { SvgImage } from "../../../Client/Gui/Svg/SvgImage";
import { Circle } from "../../../Client/Gui/Svg/Circle";
import { G } from "../../../Client/Gui/Svg/G";

export class RoomSvg extends G
{
  private readonly backgroud: Circle;
  private icon: SvgImage | "Doesn't exist" = "Doesn't exist";

  constructor
  (
    parent: Component,
    private readonly room: Room | "Doesn't exist",
    private readonly coords: Coords,
    name = "room"
  )
  {
    super(parent, name);

    this.setPosition(24 * coords.e, 24 * coords.s);

    this.backgroud = new Circle(this, "room_background");
    this.backgroud.setRadius(Room.DEFAULT_ROOM_PIXEL_SIZE * 0.6);

    this.updateRoomIcon();
    // this.registerEventListeners();
  }

  // ---------------- Private methods -------------------

  // private registerEventListeners(): void
  // {
  //   this.element.onclick = (event) => { this.onLeftClick(event); };
  //   this.element.oncontextmenu = (event) => { this.onRightClick(event); };
  //   this.element.onmouseenter = (event) => { this.onMouseEnter(event); };
  //   this.element.onmouseleave = (event) => { this.onMouseLeave(event); };
  // }

  private updateRoomIcon(): void
  {
    if (this.room === "Doesn't exist")
    {
      if (this.icon !== "Doesn't exist")
      {
        this.icon.removeFromParent();
        this.icon = "Doesn't exist";
      }

      return;
    }

    this.icon = new SvgImage
    (
      {
        parent: this,
        name: "room_icon",
        widthPixels: this.room.icon.pixelSize,
        heightPixels: this.room.icon.pixelSize,
        imagePath: this.room.icon.path,
        isCentered: true
      }
    );
  }

  // ---------------- Event handlers --------------------

  // // ! Throws exception on error.
  // private onLeftClick(event: MouseEvent): void
  // {
  //   if (this.room === "Doesn't exist")
  //   {
  //     // ! Throws exception on error.
  //     createRoom(this.coords);
  //   }
  // }

  // // ! Throws exception on error.
  // private onRightClick(event: MouseEvent): void
  // {
  //   // ! Throws exception on error.
  //   deleteRoom(this.room);
  // }

  // // ! Throws exception on error.
  // private onMouseEnter(event: MouseEvent): void
  // {
  //   if (event.buttons === 1)   // Left mouse button down.
  //     // ! Throws exception on error.
  //     buildConnectionTo(this.coords);

  //   if (event.buttons === 2)   // Right mouse button down.
  //     // ! Throws exception on error.
  //     deleteRoom(this.room);
  // }

  // // ! Throws exception on error.
  // private onMouseLeave(event: MouseEvent): void
  // {
  //   if (event.buttons === 1)   // Left mouse button down.
  //   {
  //     rememberCoords(this.coords);

  //     if (this.room === "Doesn't exist")
  //     {
  //       // ! Throws exception on error.
  //       createRoom(this.coords);
  //     }
  //   }
  // }
}

// ----------------- Auxiliary Functions ---------------------

// function rememberCoords(coords: Coords): void
// {
//   MapEditor.setLastCoords(coords);
// }

// function connectWithLastCoords
// (
//   newCoords: Coords
// )
// : "Changes occured" | "No change"
// {
//   const lastCoords = MapEditor.getLastCoords();

//   if (lastCoords === "Not set")
//     return "No change";

//   if (!lastCoords.isAdjacentTo(newCoords))
//     return "No change";

//   return MapEditor.createConnectedRooms(lastCoords, newCoords);
// }

// // ! Throws exception on error.
// function buildConnectionTo(coords: Coords): void
// {
//   const result = connectWithLastCoords(coords);

//   if (result === "Changes occured")
//   {
//     // ! Throws exception on error.
//     Gui.updateMap();

//     // Gui.updateMap() will destroy all room svg components
//     // (including this one) and create new ones. If mouse
//     // pointer moves fast, it can leave the room svg element
//     // before new one is created so the onmouseleave() won't
//     // trigger and coords won't be remembered. So we do it here
//     // instead.
//     rememberCoords(coords);
//   }
// }

// // ! Throws exception on error.
// function createRoom(coords: Coords): void
// {
//   // ! Throws exception on error.
//   const result = MapEditor.ensureRoomExists(coords);

//   if (result === "Changes occured")
//     Gui.updateMap();
// }

// // ! Throws exception on error.
// function deleteRoom(room: Room | "Doesn't exist"): void
// {
//   if (room === "Doesn't exist")
//     return;

//   // ! Throws exception on error.
//   MapEditor.deleteRoom(room);
//   Gui.updateMap();
// }