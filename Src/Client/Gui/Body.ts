/*
  Part of BrutusNext

  Wraps <body> element
*/

/*
  Windows are created inside a <body> element so they are
  handled by this class.
*/

import { MapEditor } from "../../Client/Editor/MapEditor";
import { Gui } from "../../Client/Gui/Gui";
import { Window } from "../../Client/Gui/Window";
import { LoginWindow } from "../../Client/Gui/Login/LoginWindow";
import { GroupWindow } from "../../Client/Gui/Game/GroupWindow";
import { RoomWindow } from "../../Client/Gui/Game/RoomWindow";
import { MapWindow } from "../../Client/Gui/Game/MapWindow";
import { ChatWindow } from "../../Client/Gui/Game/ChatWindow";
import { CombatWindow } from "../../Client/Gui/Game/CombatWindow";
import { SpamWindow } from "../../Client/Gui/Game/SpamWindow";
import { Component } from "../../Client/Gui/Component";

const windows = new Set<Window>();

export class Body extends Component
{
  private static readonly body = new Body();

  public static createWindows(): void
  {
    windows.add(new LoginWindow(this.body));

    // Game windows.
    windows.add(new GroupWindow(this.body));
    windows.add(new RoomWindow(this.body));
    windows.add(new MapWindow(this.body));
    windows.add(new ChatWindow(this.body));
    windows.add(new CombatWindow(this.body));
    windows.add(new SpamWindow(this.body));
  }

  public static showWindowsByState(state: Gui.State): void
  {
    for (const window of windows)
      window.showByState(state);
  }

  constructor()
  {
    super("No parent", document.body, "body");

    this.element.onmouseup = (event) => { this.onMouseUp(event); };
  }

  private onMouseUp(event: MouseEvent): void
  {
    MapEditor.resetLastCoords();
  }
}