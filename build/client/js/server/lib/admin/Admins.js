/*
  Part of BrutusNEXT

  Keeps the list of admin characters and their admin levels.
*/
define(["require", "exports", "../../../shared/lib/error/ERROR", "../../../shared/lib/admin/AdminLevel", "../../../shared/lib/log/Syslog", "../../../server/lib/message/Message", "../../../shared/lib/message/MessageType", "../../../server/lib/app/ServerApp"], function (require, exports, ERROR_1, AdminLevel_1, Syslog_1, Message_1, MessageType_1, ServerApp_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class Admins {
        constructor() {
            // Hashmap<[ string, AdminLevel ]>
            //   Key: entity id
            //   Value: admin level.
            this.adminLevels = new Map();
        }
        // ------------- Public static methods ---------------- 
        static onCharacterCreation(character) {
            let admins = ServerApp_1.ServerApp.admins;
            // If there is no other character with admin rights when
            // a new character is created, make this new character
            // a Creator.
            if (Admins.isEmpty()) {
                const level = AdminLevel_1.AdminLevel.CREATOR;
                Admins.setAdminLevel(character, level);
                Syslog_1.Syslog.log(character.getName() + " is the first character created"
                    + " on this server and is thus promoted to admin"
                    + " level " + AdminLevel_1.AdminLevel[level], MessageType_1.MessageType.SYSTEM_INFO, AdminLevel_1.AdminLevel.IMMORTAL);
            }
            // TODO Hláška do logu (info je asi zbytečné).
            // TODO: setnout charu referenci
            // na Server.admins, aby přes ni mohl promotovat, demotovat a tak.
        }
        static getAdminLevel(entity) {
            if (entity === null || entity === undefined) {
                ERROR_1.ERROR("Invalid entity");
                return null;
            }
            let adminLevels = ServerApp_1.ServerApp.admins.adminLevels;
            let level = adminLevels.get(entity.getId());
            if (level === undefined)
                return AdminLevel_1.AdminLevel.MORTAL;
            if (level === AdminLevel_1.AdminLevel.MORTAL) {
                // There should only be entities with admin level
                // higher than 'MORTAL' in this.adminList. The fact
                // that an entity has admin level 'MORTAL' is implied
                // by it not being present in the list.
                ERROR_1.ERROR("Entity " + entity.getErrorIdString()
                    + " exists in Admins but it's admin level is"
                    + " " + AdminLevel_1.AdminLevel[AdminLevel_1.AdminLevel.MORTAL] + "."
                    + " Removing it from Admins");
                adminLevels.delete(entity.getId());
            }
            return level;
        }
        // Promote target one admin level higher if possible.
        static promote(actor, target) {
            if (!this.isActorValid(actor, target, "promote"))
                return;
            let actorAdminLevel = this.getAdminLevel(target);
            let targetAdminLevel = this.getAdminLevel(target);
            if (targetAdminLevel === AdminLevel_1.AdminLevel.CREATOR) {
                actor.receive(target.getName() + " already has"
                    + " the highest possible admin level.", MessageType_1.MessageType.COMMAND);
                return;
            }
            if (actorAdminLevel === null || targetAdminLevel === null) {
                ERROR_1.ERROR("Unexpected 'null' value");
                actor.receive("An error occured while processing your command.", MessageType_1.MessageType.COMMAND);
                return;
            }
            if (actorAdminLevel <= targetAdminLevel) {
                actor.receive("You can't promote " + target.getName() +
                    " to higher admin level than your own.", MessageType_1.MessageType.COMMAND);
                return;
            }
            let newLevel = targetAdminLevel + 1;
            this.announceAction(actor, target, "promote", newLevel);
            this.setAdminLevel(target, newLevel);
        }
        // Demote target one admin level lower if possible.
        static demote(actor, target) {
            if (!this.isActorValid(actor, target, "demote"))
                return;
            let actorAdminLevel = this.getAdminLevel(target);
            let targetAdminLevel = this.getAdminLevel(target);
            if (actorAdminLevel === null || targetAdminLevel === null) {
                ERROR_1.ERROR("Unexpected 'null' value");
                actor.receive("An error occured while processing your command.", MessageType_1.MessageType.COMMAND);
                return;
            }
            if (actorAdminLevel <= targetAdminLevel) {
                actor.receive("You can only demote"
                    + "  characters below your own admin level.", MessageType_1.MessageType.COMMAND);
                return;
            }
            if (targetAdminLevel === AdminLevel_1.AdminLevel.MORTAL) {
                actor.receive(target.getName() + " already has"
                    + " the lowest possible admin level.", MessageType_1.MessageType.COMMAND);
                return;
            }
            let newLevel = targetAdminLevel - 1;
            this.announceAction(actor, target, "demote", newLevel);
            this.setAdminLevel(target, targetAdminLevel - 1);
        }
        // ---------------- Public methods --------------------
        onCharacterEnteringGame(character) {
            /// TODO
            /// Pokud je character immortal, ak mu setnout referenci
            // na Server.admins, aby přes ni mohl promotovat, demotovat a tak.
        }
        // ------------- Private static methods ---------------
        // -> Returns true if there are no characters with admin rights.
        static isEmpty() {
            return ServerApp_1.ServerApp.admins.adminLevels.size === 0;
        }
        // Sets specified admin level to a character. Doesn't check
        // if actor is allowed to do such promotion.
        static setAdminLevel(target, level) {
            if (target === null || target === undefined) {
                ERROR_1.ERROR("Invalid target");
                return false;
            }
            let adminLevels = ServerApp_1.ServerApp.admins.adminLevels;
            // If target already is an admin, remove him from the list.
            if (adminLevels.has(target.getId()))
                adminLevels.delete(target.getId());
            // And add him with a new admin level
            // (MORTALS are not added, the fact that they are not
            //  present in adminList signifies that they are MORTALS).
            if (level > AdminLevel_1.AdminLevel.MORTAL)
                adminLevels.set(target.getId(), level);
        }
        static isActorValid(actor, target, action) {
            if (actor === null || actor === undefined) {
                ERROR_1.ERROR("Invalid actor");
                return false;
            }
            if (target === null || target === undefined) {
                ERROR_1.ERROR("Invalid target");
                return false;
            }
            let actorAdminLevel = this.getAdminLevel(target);
            if (actorAdminLevel === AdminLevel_1.AdminLevel.MORTAL) {
                ERROR_1.ERROR("Attempt to use '" + action + "' command by"
                    + " " + actor.getErrorIdString() + " who is"
                    + " not an admin");
                return false;
            }
            return true;
        }
        static announceAction(actor, target, action, level) {
            let message = target.getName() + " has been " + action + "d"
                + " to level " + AdminLevel_1.AdminLevel[level];
            // Send info message to all online players.
            Message_1.Message.sendToAllIngameConnections(message, MessageType_1.MessageType.INFO, AdminLevel_1.AdminLevel.MORTAL);
            // Send info message to syslog.
            Syslog_1.Syslog.log(message, MessageType_1.MessageType.SYSTEM_INFO, AdminLevel_1.AdminLevel.IMMORTAL);
        }
    }
    exports.Admins = Admins;
});
//# sourceMappingURL=Admins.js.map