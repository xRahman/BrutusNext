/*
  Part of BrutusNEXT

  Keeps the list of admin characters and their admin levels.
*/

'use strict';

/*
  IMPORTANT: Right now, adminLevels hashmap cannot store references
  to entities, because there may be multiple references to the same
  entity (for example if player quits and logs back in). So we have
  to keep string ids instead of references to ensure that each
  admin is present only once.
TODO: Tohle už neplatí - mohou sice existovat dvě reference na stejnou
  entitu, ale ta stará je invalidovaná a nedá se použít.
*/

/*
  TODO: Aby nešlo ze skriptu provádět akce, na které skript nemá
  práva (třeba setovat někomu nějaké staty), tak to asi bude potřeba
  udělat výrazně složitěji:
  1) instance admins: Admins by měla být vždy private v nějaké nadřazené
     třídě (Server, GameEntity), takže potomci (konkrétní game entita)
     se na ni nedostanou jinak než přes existující metodu.
  2) Před provedením akce entita zavolá svou protected metodu, která
     zavolá this.admins.getTicket(this);
     - Podstatné je, že ta metoda přistupuje na proměnnou this.admins, která
       jinak není vidět, protože to je private proměnná předka. A následně
       že tomu volání předává this, tj. zaručeně referenci na entitu, která
       o povolení žádá (protože kdyby šlo přistupovat na admis nějak jinak,
       třeba přes Server.admins, tak by šlo zavolat
       Server.admins.getTicket(creator_na_kterého_jsem_sehanl_referenci)).
    - Tohle se musí udělat ze žádající entity (proto ten ticket), protože
      pouze voláním vlastní protected metody, která přistoupí na private
      proměnnou předka, na kterou se jinak nelze dostat, jde zajistit,
      že žádost opravdu vyvolal ten, kdo to o sobě tvrdí.
    - A ověření se naopak musí udělat u entity, na které se akce provádí.
   3) Vlastnímu volání akce se předá odkaz na ticket. Objekt, na kterém se
      akce provádí, pak stejným způsobem (přes privátní odkaz na admins)
      zkontroluje, že ticket je platný, a že akci volá stejná entita, která
      si zažádala o ticket).
- problém je, že tohle nejspíš pořád půjde obejít tím, že si někdo sežene
  referenci na nějakého admina a zavolá příkaz přes ni.
*/

import {ERROR} from '../../../shared/lib/error/ERROR';
import {AdminLevel} from '../../../shared/lib/admin/AdminLevel';
import {Syslog} from '../../../shared/lib/log/Syslog';
import {Message} from '../../../server/lib/message/Message';
import {MessageType} from '../../../shared/lib/message/MessageType';
import {Game} from '../../../server/game/Game';
import {GameEntity} from '../../../server/game/GameEntity';
import {Character} from '../../../server/game/character/Character';
import {ServerApp} from '../../../server/lib/app/ServerApp';

export class Admins
{
  // Hashmap<[ string, AdminLevel ]>
  //   Key: entity id
  //   Value: admin level.
  private adminLevels = new Map();

  // ------------- Public static methods ---------------- 

  public static onCharacterCreation(character: Character)
  {
    let admins = ServerApp.admins;

    // If there is no other character with admin rights when
    // a new character is created, make this new character
    // a Creator.
    if (Admins.isEmpty())
    {
      const level = AdminLevel.CREATOR;

      Admins.setAdminLevel(character, level);

      Syslog.log
      (
        character.getName() + " is the first character created"
          + " on this server and is thus promoted to admin"
          + " level " + AdminLevel[level],
        MessageType.SYSTEM_INFO,
        AdminLevel.IMMORTAL
      );
    }

    // TODO Hláška do logu (info je asi zbytečné).

    // TODO: setnout charu referenci
    // na Server.admins, aby přes ni mohl promotovat, demotovat a tak.
  }

  public static getAdminLevel(entity: GameEntity): AdminLevel | null
  {
    if (entity === null || entity === undefined)
    {
      ERROR("Invalid entity");
      return null;
    }

    let adminLevels = ServerApp.admins.adminLevels;

    let level = adminLevels.get(entity.getId());

    if (level === undefined)
      return AdminLevel.MORTAL;

    if (level === AdminLevel.MORTAL)
    {
      // There should only be entities with admin level
      // higher than 'MORTAL' in this.adminList. The fact
      // that an entity has admin level 'MORTAL' is implied
      // by it not being present in the list.
      ERROR("Entity " + entity.getErrorIdString()
        + " exists in Admins but it's admin level is"
        + " " + AdminLevel[AdminLevel.MORTAL] + "."
        + " Removing it from Admins");

      adminLevels.delete(entity.getId());
    }

    return level;
  }

  // Promote target one admin level higher if possible.
  public static promote(actor: GameEntity, target: GameEntity)
  {
    if (!this.isActorValid(actor, target, "promote"))
      return;

    let actorAdminLevel = this.getAdminLevel(target);
    let targetAdminLevel = this.getAdminLevel(target);

    if (targetAdminLevel === AdminLevel.CREATOR)
    {
      actor.receive(target.getName() + " already has"
        + " the highest possible admin level.",
        MessageType.COMMAND);
      return;
    }

    if (actorAdminLevel === null || targetAdminLevel === null)
    {
      ERROR("Unexpected 'null' value");
      actor.receive
      (
        "An error occured while processing your command.",
        MessageType.COMMAND
      );
      return;
    }

    if (actorAdminLevel <= targetAdminLevel)
    {
      actor.receive("You can't promote " + target.getName() +
        " to higher admin level than your own.",
        MessageType.COMMAND);
      return;
    }

    let newLevel = targetAdminLevel + 1;

    this.announceAction(actor, target, "promote", newLevel);
    this.setAdminLevel(target, newLevel);
  }

  // Demote target one admin level lower if possible.
  public static demote(actor: GameEntity, target: GameEntity)
  {
    if (!this.isActorValid(actor, target, "demote"))
      return;

    let actorAdminLevel = this.getAdminLevel(target);
    let targetAdminLevel = this.getAdminLevel(target);

    if (actorAdminLevel === null || targetAdminLevel === null)
    {
      ERROR("Unexpected 'null' value");
      actor.receive
      (
        "An error occured while processing your command.",
        MessageType.COMMAND
      );
      return;
    }

    if (actorAdminLevel <= targetAdminLevel)
    {
      actor.receive("You can only demote"
        + "  characters below your own admin level.",
        MessageType.COMMAND);
      return;
    }

    if (targetAdminLevel === AdminLevel.MORTAL)
    {
      actor.receive(target.getName() + " already has"
        + " the lowest possible admin level.",
        MessageType.COMMAND);
      return;
    }

    let newLevel = targetAdminLevel - 1;

    this.announceAction(actor, target, "demote", newLevel);
    this.setAdminLevel(target, targetAdminLevel - 1);
  }

  // ---------------- Public methods --------------------

  public onCharacterEnteringGame(character: GameEntity)
  {
    /// TODO
    /// Pokud je character immortal, ak mu setnout referenci
    // na Server.admins, aby přes ni mohl promotovat, demotovat a tak.
  }

  // ------------- Private static methods ---------------

  // -> Returns true if there are no characters with admin rights.
  private static isEmpty()
  {
    return ServerApp.admins.adminLevels.size === 0;
  }

  // Sets specified admin level to a character. Doesn't check
  // if actor is allowed to do such promotion.
  private static setAdminLevel(target: GameEntity, level: AdminLevel)
  {
    if (target === null || target === undefined)
    {
      ERROR("Invalid target");
      return false;
    }

    let adminLevels = ServerApp.admins.adminLevels;

    // If target already is an admin, remove him from the list.
    if (adminLevels.has(target.getId()))
      adminLevels.delete(target.getId());

    // And add him with a new admin level
    // (MORTALS are not added, the fact that they are not
    //  present in adminList signifies that they are MORTALS).
    if (level > AdminLevel.MORTAL)
      adminLevels.set(target.getId(), level);
  }

  private static isActorValid
  (
    actor: GameEntity,
    target: GameEntity,
    action: string
  )
  : boolean
  {
    if (actor === null || actor === undefined)
    {
      ERROR("Invalid actor");
      return false;
    }

    if (target === null || target === undefined)
    {
      ERROR("Invalid target");
      return false;
    }

    let actorAdminLevel = this.getAdminLevel(target);

    if (actorAdminLevel === AdminLevel.MORTAL)
    {
      ERROR("Attempt to use '" +  action + "' command by"
        + " " + actor.getErrorIdString() + " who is"
        + " not an admin");
      return false;
    }

    return true;
  }

  private static announceAction
  (
    actor: GameEntity,
    target: GameEntity,
    action: string,
    level: AdminLevel
  )
  {
    let message = target.getName() + " has been " + action + "d"
      + " to level " + AdminLevel[level];

    // Send info message to all online players.
    Message.sendToAllIngameConnections
    (
      message,
      MessageType.INFO,
      AdminLevel.MORTAL
    );

    // Send info message to syslog.
    Syslog.log
    (
      message,
      MessageType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );
  }
}