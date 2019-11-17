/*
  Part of BrutusNEXT

  Part of client-server communication protocol.
  Specifies format of room data.
*/

'use strict';

import {ERROR} from '../../shared/lib/error/ERROR';
import {ContainerData} from '../../shared/game/ContainerData';

export class GameEntityData extends ContainerData
{
  // ----------------- Public data ----------------------

  /// Tohle asi fakt dává smysl v XxxData, chmura...
  /// - tak asi ne, to by tu muselo být i idčko a to už vůbec
  ///   nedává smysl. Nejspíš to bude tak, že properties zděděné
  ///   z Entity se posílat budou (což je ok, client-side entity
  ///   je má určitě taky).
  /*
  public name: (string | null) = null;
  */

  public description = "Unfinished entity.";
    /// 'true' nejspíš bude defaultní hodnota.
    /*
    private static description: Attributes =
    {
      saved: true,
      edited: true
    }
    */

  // ---------------- Public methods --------------------

  // Recursively calls 'eventHandler' method on all prototypes
  // in the prototype chain.
  // (This saves the need to call super.handler() in all
  //  event handlers.)
  public triggerEvent(eventHandler: string, instance: GameEntityData = this)
  {
    // See Entity.triggerEvent for description of the algorithm.

    if (!eventHandler)
    {
      ERROR("Invalid event handler name");
      return;
    }

    let prototype = Object.getPrototypeOf(this);

    // Recursively traverse prototype chain.
    if (prototype && prototype['triggerEvent'])
      prototype.triggerEvent(eventHandler, instance);

    this.handleEvent(eventHandler, instance);
  }

  // --------------- Private methods --------------------

  private handleEvent(trigger: string, instance: any)
  {
    if (this.hasOwnProperty(trigger))
    {
      let triggerFunction = (this as any)[trigger];

      if (typeof triggerFunction !== 'function')
      {
        ERROR("Attempt to call trigger handler '" + trigger + "'"
          + " which is not a function");
        return;
      }

      // Call trigger function with 'instance' as this.
      triggerFunction.call(instance);
    }
  }

  // ---------------- Event Handlers -------------------

  /// TEST
  // protected onLoad() { console.log('GameEntityData.onLoad()'); }
}