/*
  Part of BrutusNEXT

  Abstract ancestor for ClientApp and ServerApp.
*/

'use strict';

import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {Entities} from '../../../shared/lib/entity/Entities';
import {Prototypes} from '../../../shared/lib/entity/Prototypes';

export abstract class App
{
  // -------------- Static class data -------------------

  protected static instance: (App | null) = null;

  // ---------------- Protected data --------------------

  protected entities: (Entities | null) = null;
  protected prototypes: (Prototypes | null) = null;

  // --------------- Static accessors -------------------

  public static get entities()
  {
    return App.getInstance().entities;
  }

  public static get prototypes()
  {
    return App.getInstance().prototypes;
  }

  // ------------- Public static methods ---------------- 

  // Reports runtime error.
  // (Don't call this directly, use ERROR() instead.)
  public static reportError(message: string): void
  {
    // If ERROR() is called from within an initialization
    // of App instance, the instance of App doesn't exist
    // yet so we can only report it directly.
    if (!this.instance)
    {
      throw new Error
      (
        '[ERROR triggered prior to App.createInstance()]: ' + message
      );
    }
    else
    {
      App.getInstance().reportError(message);
    }
  }

  // Reports fatal runtime error.
  // (Don't call this directly, use FATAL_ERROR() instead.)
  public static reportFatalError(message: string): void
  {
    // If FATAL_ERROR() is called from within an initialization
    // of App instance, the instance of App doesn't exist yet so
    // we can only report it directly.  
    if (!this.instance)
    {
      throw new Error
      (
        '[ERROR triggered prior to App.createInstance()]: ' + message
      );
    }
    else
    {
      App.getInstance().reportFatalError(message);
    }
  }

  // Sends message to syslog.
  // (Don't call this directly, use Syslog.log() instead.)
  public static syslog
  (
    text: string,
    msgType: MessageType,
    adminLevel: AdminLevel
  )
  : void
  {
    App.getInstance().syslog(text, msgType, adminLevel);
  }

  // ------------ Protected static methods --------------

  // -> Returns ServerApp or ClientApp. In the server code,
  //    App.getInstance() is actually an instance of ServerApp
  //    and in client code, it's an instance of ClientApp.
  protected static getInstance(): App
  {
    if (!this.instance)
    {
      // We can't use ERROR() here because ERROR() is handled by App
      // which doesn't exist here.
      throw new Error("Instance of App doesn't exist yet");
    }

    return this.instance;
  }

  // --------------- Protected methods ------------------

  // Reports runtime error.
  protected abstract reportError(message: string): void;
  // Reports fatal runtime error.
  protected abstract reportFatalError(message: string): void;

  protected abstract syslog
  (
    message: string,
    msgType: MessageType,
    adminLevel: AdminLevel
  )
  : void;
}
