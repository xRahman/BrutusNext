/*
  Part of BrutusNEXT

  Abstract ancestor for ClientApp and ServerApp.
*/

/*
  App is a singleton. We could implement it by using
  only static methods and data so we wouln't need to
  ensure that there is only one instance. We can't do
  that, though, because we need polymorphism in order
  to call server or client version of some methods from
  shared code (by calling App.method()). So we need a
  singleton instance after all.

  The good new is that we don't need stuff like
  'createInstance()' - all we need is an initialized
  static property 'instance'. It can only exist once
  because it is static and it is only assigned once
  because static properties are only inicialized once.
  This way we also don't need to ensure that an instance
  exists every time we want to use it, because when you
  import and App module, initializer is certainly executed.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {Entities} from '../../../shared/lib/entity/Entities';
import {Prototypes} from '../../../shared/lib/entity/Prototypes';

export abstract class App
{
  // -------------- Static class data -------------------

  // This needs to be inicialized in descendants.
  protected static instance: App;

  // ---------------- Protected data --------------------

  protected isRunning = false;

  protected abstract entities: Entities;
  protected abstract prototypes: Prototypes;

  // --------------- Static accessors -------------------

  public static get entities() { return this.instance.entities; }
  public static get prototypes() { return this.instance.prototypes; }

  // ------------- Public static methods ----------------

  // Don't call this directly, use ERROR() instead.
  public static reportException(error: Error)
  {
    this.instance.reportException(error);
  }

  // Don't call this directly, use ERROR() instead.
  public static reportError(message: string): void
  {
    this.instance.reportError(message);
  }

  // Don't call this directly, use ERROR() instead.
  public static reportFatalError(message: string): void
  {
    this.instance.reportFatalError(message);
  }

  // Sends message to syslog.
  // (Don't call this directly, use Syslog.log() instead.)
  public static log
  (
    text: string,
    msgType: MessageType,
    adminLevel: AdminLevel
  )
  : void
  {
    this.instance.log(text, msgType, adminLevel);
  }

  // --------------- Protected methods ------------------

  protected abstract reportException(error: Error): void;
  protected abstract reportError(message: string): void;
  protected abstract reportFatalError(message: string): void;

  protected abstract log
  (
    message: string,
    msgType: MessageType,
    adminLevel: AdminLevel
  )
  : void;

  protected isAlreadyRunning(): boolean
  {
    if (this.isRunning)
    {
      // 'this.constructor.name' is the name of the class
      // (ClientApp or ServerApp).
      ERROR("Attempt to run " + this.constructor.name
        + " which is already running");
      return true;
    }

    this.isRunning = true;

    return false;
  }

  protected initClasses()
  {
    // Create an instance of each entity class registered in
    // Classes so they can be used as prototype objects
    // for root prototype entities.
    this.entities.createRootObjects();
  }
}
