/*
  Part of BrutusNEXT

  Svg reprezentation of a room on the map
*/

import { Coords } from "../../../Shared/Class/Coords";
import { Room } from "../../../Client/World/Room";
import { Editor } from "../../../Client/Editor/Editor";
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
    this.registerEventListeners();
  }

  // ---------------- Private methods -------------------

  private registerEventListeners(): void
  {
    this.element.onclick = (event) => { this.onLeftClick(event); };
    this.element.oncontextmenu = (event) => { this.onRightClick(event); };
    this.element.onmouseenter = (event) => { this.onMouseEnter(event); };
    this.element.onmouseleave = (event) => { this.onMouseLeave(event); };
  }

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

  protected onLeftClick(event: MouseEvent): void
  {
    if (this.room === "Doesn't exist")
    {
      // ! Throws exception on error.
      const result = Editor.ensureRoomExists(this.coords);

      if (result === "Changes occured")
        Gui.updateMap();
    }
  }

  protected onRightClick(event: MouseEvent): void
  {
    if (this.room !== "Doesn't exist")
    {
      // ! Throws exception on error.
      Editor.deleteRoom(this.room);
      Gui.updateMap();
    }
  }

  protected onMouseEnter(event: MouseEvent): void
  {
    if (event.buttons === 1)   // Left mouse button down.
    {
      const result = connectWithLastCoords(this.coords);

      if (result === "Changes occured")
      {
        // Gui.updateMap() will destroy all room svg components
        // (including this one) and create new ones. If mouse
        // moves fast, it can leave the room svg element before
        // new one is create so the coords won't be remembered
        // and the next room won't connect to this one. To prevent
        // it we remember current coords when a new room is created.
        rememberCoords(this.coords);
        Gui.updateMap();
      }
    }
  }

  protected onMouseLeave(event: MouseEvent): void
  {
    if (event.buttons === 1)   // Left mouse button down.
    {
      // DEBUG
      console.log("Remembering coords", this.coords);

      rememberCoords(this.coords);
    }
  }
}

// ----------------- Auxiliary Functions ---------------------

function rememberCoords(coords: Coords): void
{
  Editor.lastSelectedCoords = coords;
}

function connectWithLastCoords
(
  newCoords: Coords
)
: "Changes occured" | "No change was required"
{
  if (Editor.lastSelectedCoords === "Not set")
    return "No change was required";

  const lastCoords = Editor.lastSelectedCoords;

  if (!Coords.areAdjacent(lastCoords, newCoords))
    return "No change was required";

  return Editor.createConnectedRooms(lastCoords, newCoords);
}