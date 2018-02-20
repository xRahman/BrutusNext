/*
  Part of BrutusNEXT

  Character (player or mob).
*/
define(["require", "exports", "../../../shared/lib/error/ERROR", "../../../shared/lib/utils/Time", "../../../shared/lib/admin/AdminLevel", "../../../server/lib/admin/Admins", "../../../server/game/Game", "../../../server/game/GameEntity", "../../../shared/game/character/CharacterData", "../../../server/game/character/Characters", "../../../shared/lib/class/Classes", "../../../shared/lib/protocol/Move"], function (require, exports, ERROR_1, Time_1, AdminLevel_1, Admins_1, Game_1, GameEntity_1, CharacterData_1, Characters_1, Classes_1, Move_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class Character extends GameEntity_1.GameEntity {
        /// TODO: Tohle by asi nemělo být tady - admin levely jsou externě
        /// v Admins.
        // private adminLevel = AdminLevel.MORTAL;
        constructor() {
            super();
            this.timeOfCreation = null;
            // ----------------- Private data --------------------- 
            // Character is placed into this entity when entering game.
            this.loadLocation = null;
            // ----------------- Public data ----------------------
            this.data = new CharacterData_1.CharacterData(this);
            // Don't forget to bump up version number if you add or remove
            // SaveableObjects. You will also need to convert data in respective
            // .json files to conform to the new version.
            this.version = 0;
        }
        // --------------- Public accessors -------------------
        getLoadLocation() {
            return this.loadLocation;
        }
        getTimeOfCreation() {
            if (this.timeOfCreation === null) {
                ERROR_1.ERROR("Time of creation has not been inicialized"
                    + " on character " + this.getErrorIdString());
                return Time_1.Time.UNKNOWN_TIME_STRING;
            }
            return this.timeOfCreation.toLocaleString();
        }
        getAdminLevel() {
            return Admins_1.Admins.getAdminLevel(this);
        }
        // ---------------- Public methods --------------------
        // Sets birthroom (initial location), CHAR_IMMORTALITY flag.
        init() {
            let myAdminLevel = this.getAdminLevel();
            if (myAdminLevel === null) {
                ERROR_1.ERROR("'null' admin level");
                return;
            }
            if (Game_1.Game.world === null) {
                ERROR_1.ERROR("'null' Game.world");
                return;
            }
            if (myAdminLevel > AdminLevel_1.AdminLevel.MORTAL) {
                // Immortals enter game in System Room.
                this.loadLocation = Game_1.Game.world.systemRoom;
                ///this.characterFlags.set(CharacterFlags.GOD_PROTECTION);
            }
            else {
                // Mortals enter game in Tutorial Room.
                this.loadLocation = Game_1.Game.world.tutorialRoom;
            }
            /// Tohle by tu asi být nemělo - do roomy se character
            /// insertne až ve chvíli, kdy s ním player logne do hry.
            //this.loadLocation.insert(this);
        }
        // -> Returns Move instance describing performed move action,
        //    Returns 'null' on error.
        enterWorld() {
            if (this.getLocation() !== null) {
                ERROR_1.ERROR("Attempt to enter game with character "
                    + this.getErrorIdString() + " which already"
                    + " has a location. Location is not changed");
                return null;
            }
            let loadLocation = this.getLoadLocation();
            if (!loadLocation || !loadLocation.isValid()) {
                ERROR_1.ERROR("Invalid 'loadLocation' on character"
                    + " " + this.getErrorIdString() + "."
                    + " Character is not placed into the world");
                return null;
            }
            let myId = this.getId();
            let loadLocationId = loadLocation.getId();
            if (myId === null) {
                ERROR_1.ERROR("'null' id");
                return null;
            }
            if (loadLocationId === null) {
                ERROR_1.ERROR("'null' loadLocationId");
                return null;
            }
            // TODO: Zařadit char do namelistů, atd.
            // (možná se to bude dělat v rámci insertu, uvidíme).
            loadLocation.insert(this);
            return new Move_1.Move(myId, loadLocationId);
        }
        // Announce to the room that player is entering game as this character.
        announcePlayerEnteringGame() {
            // if (this.isPlayerCharacter())
            // {
            // Send a message to the room that a player has just entered game.
            // this.sendToRoom("&BZuzka &Whas entered the game. &wBe ready.");
            // }
        }
        // Announce to the room that player is leaving game.
        announcePlayerLeavingGame() {
            // if (this.isPlayerCharacter())
            // {
            // Send a message to the room that a player has just left game.
            // this.sendToRoom("&Zuzka has left the game.");
            // }
        }
        // Announce to the room that player has reconnected to this entity.
        announcePlayerReconnecting() {
            // TODO
            // if (this.isPlayerCharacter())
            // {
            // Send a message to the room that a player has just reconnected.
            // }
        }
        // ---------------- Protected data --------------------
        // --------------- Protected methods ------------------
        // ~ Overrides Entity.addToNameLists().
        addToNameLists() {
            Characters_1.Characters.add(this);
            /// TODO
        }
        // ~ Overrides Entity.addToAbbrevLists().
        addToAbbrevLists() {
            /// TODO
        }
        // ~ Overrides Entity.removeFromNameLists().
        removeFromNameLists() {
            Characters_1.Characters.remove(this);
            /// TODO
        }
        // ~ Overrides Entity.removeFromAbbrevLists().
        removeFromAbbrevLists() {
            /// TODO
        }
        // --------------- Private methods --------------------
        // ---------------- Command handlers ------------------
        /*
        /// Testing
        protected doStand(argument)
        {
          console.log("Executed command 'stand': " + this.x);
        }
      
        /// Testing
        protected doSit(argument)
        {
          console.log("Haf haf! 'sit': " + this.x);
        }
        */
        // ---------------- Event Handlers -------------------
        // Triggers when an entity is instantiated.
        onLoad() {
            // Calling Time() without parameters initializes it to current time.
            this.timeOfCreation = new Time_1.Time();
        }
    }
    exports.Character = Character;
    Classes_1.Classes.registerEntityClass(Character);
});
//# sourceMappingURL=Character.js.map