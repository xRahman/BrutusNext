/*
  Part of BrutusNEXT

  Manages state of user interface
*/

import { Body } from "../../Client/Gui/Body";

export namespace Gui
{
  export enum State
  {
    INITIAL,
    LOGIN,
    REGISTER,
    TERMS,
    CHARSELECT,
    CHARGEN,
    GAME,
    ERROR   // Player is asked to reload browser tab to recover.
  }

  let state = State.INITIAL;

  // ! Throws exception on error.
  export function switchToState(newState: State): void
  {
    if (newState === State.INITIAL)
      throw Error("Attempt to set GUI state to 'INITIAL'");

    state = newState;

    Body.showWindowsByState(state);

    if (newState === State.ERROR)
    {
      // TODO: Better displaying of error message.
      alert("An error occured. Please reload the browser tab to log back in.");
    }
  }
}