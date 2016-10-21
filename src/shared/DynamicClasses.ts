/*
  Part of BrutusNEXT

  All classes that are dynamically loaded (basically all that
  are saved to or loaded from JSON) need to be listed here and
  their constructors added to initDynamicClasses() function
  to be able to create instances of correct types.
*/

import {Script} from '../shared/prototype/Script';
import {FlagNames} from '../shared/flags/FlagNames';
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
  public static init(dynamicClasses: Map<any, any>)
  {
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
  }
}
