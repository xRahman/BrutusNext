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
import {PrototypeRecord} from '../shared/PrototypeRecord';
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
    this.set(Script);
    this.set(FlagNames);
    this.set(PrototypeRecord);
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

    /*
    DynamicClasses.set(Script);
    DynamicClasses.set(FlagNames);
    DynamicClasses.set(NameLockRecord);
    DynamicClasses.set(Connection);
    DynamicClasses.set(Account);
    DynamicClasses.set(Character);
    DynamicClasses.set(Area);
    DynamicClasses.set(Dimension);
    DynamicClasses.set(Realm);
    DynamicClasses.set(Room);
    DynamicClasses.set(Sector);
    DynamicClasses.set(World);
    */

    /*
    dynamicClasses.set('Script', Script);
    dynamicClasses.set('FlagNames', FlagNames);
    dynamicClasses.set('IdRecord', NameLockRecord);
    dynamicClasses.set('Connection', Connection);
    dynamicClasses.set('Account', Account);
    dynamicClasses.set('Character', Character);
    dynamicClasses.set('Area', Area);
    dynamicClasses.set('Dimension', Dimension);
    dynamicClasses.set('Realm', Realm);
    dynamicClasses.set('Room', Room);
    dynamicClasses.set('Sector', Sector);
    dynamicClasses.set('World', World);
    */
  }

  private static set(Class: any)
  {
    DynamicClasses.constructors.set(Class.name, Class);
  }
}
