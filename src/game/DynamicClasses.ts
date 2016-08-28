if (global['dynamicClasses'] === undefined)
  global['dynamicClasses'] = {};

// All classes that are dynamically loaded (basically all that
// are saved to or loaded from JSON) need to be listed here and
// their constructors added to 'global' object for load functions
// to be able to create instances of correct types.

import {Script} from '../shared/Script';
global['dynamicClasses']['Script'] = Script;

import {FlagNames} from '../shared/FlagNames';
global['dynamicClasses']['FlagNames'] = FlagNames;

import {Connection} from '../server/Connection';
global['dynamicClasses']['Connection'] = Connection;

import {Account} from '../server/Account';
global['dynamicClasses']['Account'] = Account;

import {Character} from '../game/characters/Character';
global['dynamicClasses']['Character'] = Character;

import {Area} from '../game/world/Area';
global['dynamicClasses']['Area'] = Area;

import {Dimension} from '../game/world/Dimension';
global['dynamicClasses']['Dimension'] = Dimension;

import {Realm} from '../game/world/Realm';
global['dynamicClasses']['Realm'] = Realm;

import {Room} from '../game/world/Room';
global['dynamicClasses']['Room'] = Room;

import {Sector} from '../game/world/Sector';
global['dynamicClasses']['Sector'] = Sector;

import {World} from '../game/world/World';
global['dynamicClasses']['World'] = World;
