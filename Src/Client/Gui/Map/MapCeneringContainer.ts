/*
  Part of BrutusNEXT

  Svg component that centers the map in map window
*/

/*
  Note that "overflow: visible;" must be set in css of
  this component or it will clip three quarters of the map.
*/

import { Component } from "../../../Client/Gui/Component";
import { SvgGComponent } from "../../../Client/Gui/SvgGComponent";
import { SvgImageComponent } from "../../../Client/Gui/SvgImageComponent";
import { SvgComponent } from "../../../Client/Gui/SvgComponent";

export class MapCenteringContainer extends SvgComponent
{
  private readonly rooms: SvgGComponent;
  private readonly room: SvgImageComponent;

  constructor(parent: Component, name = "map_centering_container")
  {
    super(parent, name);

    this.setRelativePosition(50, 50);

    this.rooms = new SvgGComponent(this);
    this.room = new SvgImageComponent(this.rooms, "room");

    this.rooms.setTransform("scale(25)");

    // Size of room element in pixels on the screen if
    // map scale factor is 1.0. Size of used svg image
    // doesn't matter, it will be scaled to this sceen
    // size.
    const roomPixelSize = 16;

    this.room.setImage("Images/Rooms/Circle.svg");
    this.room.setSize(roomPixelSize, roomPixelSize);
    // Translate the room so it's origin is in the middle.
    this.room.setTransform
    (
      `translate(${-roomPixelSize / 2}, ${-roomPixelSize / 2})`
    );
  }
}