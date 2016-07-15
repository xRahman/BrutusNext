// All classes that are dynamically loaded (basically all that
// are saved to or loaded from JSON) need to be listed here and
// their constructors added to 'global' object for load functions
// to be able to create instances of correct types.

import {Id} from "../shared/Id";
global['Id'] = Id;

import {EntityId} from "../game/EntityId";
global['EntityId'] = EntityId;

import {Character} from "../game/characters/Character";
global['Character'] = Character;

import {Area} from "../game/world/Area";
global['Area'] = Area;

import {Dimension} from "../game/world/Dimension";
global['Dimension'] = Dimension;

import {Realm} from "../game/world/Realm";
global['Realm'] = Realm;

import {Room} from "../game/world/Room";
global['Room'] = Room;

import {Sector} from "../game/world/Sector";
global['Sector'] = Sector;

import {World} from "../game/world/World";
global['World'] = World;