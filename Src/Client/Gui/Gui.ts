/*
  Part of BrutusNEXT

  Manages state of user interface
*/

import { Body } from "../../Client/Gui/Html/Body";

export namespace Gui
{
  // This needs to be enum because values are used as bitvector flags.
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
      /// TODO: Better displaying of error message
      //  (probably output it to error window).
      alert("An error occured. Please reload the browser tab to log back in.");
    }
  }
}