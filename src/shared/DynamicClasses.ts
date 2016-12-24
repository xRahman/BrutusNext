/*
  Part of BrutusNEXT

  All classes that are dynamically loaded (basically all that
  are saved to or loaded from JSON) need to be listed here and
  their constructors added to init() function to be allow creating
  of their instances.
*/

import {Server} from '../server/Server';
import {Script} from '../shared/prototype/Script';
import {FlagNames} from '../shared/flags/FlagNames';
import {Prototype} from '../shared/prototype/Prototype';
import {NameLockRecord} from '../shared/entity/NameLockRecord';
import {Connection} from '../server/connection/Connection';
import {Account} from '../server/account/Account';
import {Character} from '../game/character/Character';
import {Area} from '../game/world/Area';
import {Dimension} from '../game/world/Dimension';
import {Realm} from '../game/world/Realm';
import {Room} from '../game/world/Room';
import {Sector} from '../game/world/Sector';
import {World} from '../game/world/World';

export class DynamicClasses
{
  // Key:   class name
  // Value: class constructor
  public static constructors = new Map<string, any>();

  public static init()
  {
    // Classes need to be listed in order of inheritance (ancestors first).
    /// - už asi ne
    this.set(Script);
    this.set(FlagNames);
    this.set(Prototype);
    this.set(NameLockRecord);
    this.set(Connection);
    this.set(Account);
    this.set(Character);
    this.set(World);
    this.set(Realm);
    this.set(Dimension);
    this.set(Sector);
    this.set(Area);
    this.set(Room);
  }

  private static set(Class: any)
  {
    DynamicClasses.constructors.set(Class.name, Class);
  }
}
