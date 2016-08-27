/*
  Part of BrutusNEXT

  World
  (a single game entity containing everything else, namely a list of realms).
*/

'use strict';

import {ASSERT} from '../../shared/ASSERT';
///import {EntityId} from '../../shared/EntityId';
import {SaveableObject} from '../../shared/SaveableObject';
import {Server} from '../../server/Server';
import {Game} from '../../game/Game';
import {GameEntity} from '../../game/GameEntity';
import {Realm} from '../../game/world/Realm';

export class World extends GameEntity
{
  // --------------- Public accessors -------------------

  // -------------- Protected accessors -----------------

  protected static get SAVE_DIRECTORY() { return "./data/"; }

  // ---------------- Public class data -----------------

  public systemRealm = null;
  public systemArea = null;
  public systemRoom = null;
  // The room newly created player characters spawn to.
  public tutorialRoom = null;

  // -------------- Protected class data ----------------

  constructor()
  {
    super();

    // Don't forget to bump up version number if you add or remove
    // SaveableObjects. You will also need to convert data in respective
    // .json files to conform to the new version.
    this.version = 0;
  }

  // ---------------- Public methods --------------------

  public createSystemRealm()
  {
    // Create a new realm prototype.
    Game.prototypeManager.createPrototype('SystemRealm', 'Realm');
    this.systemRealm = Game.createEntity('System Realm', 'SystemRealm');

    // --- System Area ---

    // Create a new area prototype.
    Game.prototypeManager.createPrototype('SystemArea', 'Area');
    this.systemArea = Game.createEntity('System Area', 'SystemArea');

    // --- System Room ---

    // Create a new room prototype.
    Game.prototypeManager.createPrototype('SystemRoom', 'Room');
    this.systemRoom = Game.createEntity('System Room', 'SystemRoom');

    // --- Tutorial Room ---

    // Create a new room prototype.
    Game.prototypeManager.createPrototype('TutorialRoom', 'Room');
    this.systemRoom = Game.createEntity('Tutorial Room', 'TutorialRoom');
  }

  // --------------- Protected methods ------------------

  // What file is the world saved to.
  protected getSaveFileName(): string
  {
    return "world.json";
  }

  // ---------------- Private methods -------------------
}