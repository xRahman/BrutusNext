/*
  Part of BrutusNEXT

  Abstract ancestor for ClientApp and ServerApp.
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
      // 'this.constructor.name' is the name of the class.
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
