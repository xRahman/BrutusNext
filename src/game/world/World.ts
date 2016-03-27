/*
  Part of BrutusNEXT

  World
  (a single game entity containing everything else, namely a list of realms).
*/

'use strict';

import {ASSERT} from '../../shared/ASSERT'
import {Id} from '../../shared/Id';
import {Game} from '../../game/Game';
import {GameEntity} from '../../game/GameEntity';
import {Realm} from '../../game/world/Realm';

export class World extends GameEntity
{
  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  // --------------- Public accessors -------------------

  // -------------- Protected accessors -----------------

  protected get SAVE_DIRECTORY() { return "./data/"; }

  // ---------------- Public methods --------------------

  public addNewRealm(realmName: string): Id
  {
    let newRealm = new Realm();

    newRealm.name = realmName;

    let newRealmId = Game.realmList.addEntityUnderNewId(newRealm);

    // Add new realm id to the list of entities contained in the world.
    this.insertEntity(newRealmId);

    return newRealmId;
  }

  // -------------- Protected class data ----------------

  // --------------- Protected methods ------------------

  // What file is the world saved to.
  protected getSaveFileName(): string
  {
    return "world.json";
  }

  // ---------------- Private methods -------------------
}

/*
// Add constructor of this class as a property of global object,
// so it's instances can be created dynamically in runtime.
global['World'] = World;
*/