/*
  Part of BrutusNEXT

  Keeps the list of admin characters and their admin levels.
*/

'use strict';

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
*/

import {ERROR} from '../shared/error/ERROR';
import {AdminLevel} from '../server/AdminLevel';
import {Syslog} from '../server/Syslog';
import {Game} from '../game/Game';
import {GameEntity} from '../game/GameEntity';
import {Character} from '../game/character/Character';
import {AutoSaveableObject} from '../shared/fs/AutoSaveableObject';

export class Admins extends AutoSaveableObject
{
  // Hashmap<[ string, AdminLevel ]>
  //   Key: entity id
  //   Value: admin level.
  private adminList = new Map();

  // ---------------- Public methods --------------------

  public onCharacterEnteringGame(character: Character)
  {
    /// TODO
    /// Pokud he character immortal, ak mu setnout referenci
    // na Server.admins, aby přes ni mohl promotovat, demotovat a tak.
  }

  public onCharacterCreation(character: Character)
  {
    // If there is no other character with admin rights when
    // a new character is created, make this new character
    // a Creator.
    if (this.isEmpty())
      this.setAdminLevel(character, AdminLevel.CREATOR);

    // TODO Hláška do logu (info je asi zbytečné).

    // TODO: setnout charu referenci
    // na Server.admins, aby přes ni mohl promotovat, demotovat a tak.
  }

  public getAdminLevel(entity: GameEntity): AdminLevel
  {
    if (entity === null || entity === undefined)
    {
      ERROR("Invalid entity");
      return;
    }

    let level = this.adminList.get(entity.getId());

    if (level === undefined)
      return AdminLevel.MORTAL;

    if (level === AdminLevel.MORTAL)
    {
      // There should only be entities with admin level
      // higher than 'MORTAL' in this.adminList. The fact
      // that an entity has admin level 'MORAL' is implied
      // by it not being present in the list.
      ERROR("Entity " + entity.getErrorIdString()
        + " exists in Admins but it's admin level is"
        + " " + AdminLevel[AdminLevel.MORTAL] + "."
        + " Removing it from Admins");

      this.adminList.delete(entity.getId());
    }

    return level;
  }

  // Promote target one adminLevel hiher if possible.
  public promote(actor: GameEntity, target: GameEntity)
  {
    if (!this.actionSanityCheck(actor, target, "promote"))
      return;

    let actorAdminLevel = this.getAdminLevel(target);
    let targetAdminLevel = this.getAdminLevel(target);

    if (targetAdminLevel === AdminLevel.CREATOR)
    {
      actor.send(target.name + " already has"
        + " the highest possible admin level.");
      return;
    }

    if (actorAdminLevel <= targetAdminLevel)
    {
      actor.send("You can't promote " + target.name +
        " to higher admin level than your own.");
      return;
    }

    let newLevel = targetAdminLevel + 1;

    this.announceAction(actor, target, "promote", newLevel);
    this.setAdminLevel(target, newLevel);
  }

  // Demote target one adminLevel lower if possible.
  public demote(actor: GameEntity, target: GameEntity)
  {
    if (!this.actionSanityCheck(actor, target, "demote"))
      return;

    let actorAdminLevel = this.getAdminLevel(target);
    let targetAdminLevel = this.getAdminLevel(target);

    if (actorAdminLevel <= targetAdminLevel)
    {
      actor.send("You can only demote targets"
        + " below your own admin level.");
      return;
    }

    if (targetAdminLevel === AdminLevel.MORTAL)
    {
      actor.send(target.name + " already has"
        + " the lowest possible admin level.");
      return;
    }

    let newLevel = targetAdminLevel - 1;

    this.announceAction(actor, target, "deomote", newLevel);
    this.setAdminLevel(target, targetAdminLevel - 1);
  }

  // ---------------- Private methods -------------------

  // -> Returns true if there are no characters with admin rights.
  private isEmpty() { return this.adminList.size === 0; }

  // Sets specified admin level to a character. Doesn't check
  // if actor is allowed to do such promotion.
  private setAdminLevel(target: GameEntity, level: AdminLevel)
  {
    if (target === null || target === undefined)
    {
      ERROR("Invalid target");
      return false;
    }

    // If target already is an admin, remove him from the list.
    if (this.adminList.has(target.getId()))
      this.adminList.delete(target.getId());

    // And add him with a new admin level
    // (MORTALS are not added, the fact that they are not
    //  present in adminList signifies that they are MORTALS).
    if (level > AdminLevel.MORTAL)
      this.adminList.set(target.getId(), level);
  }

  public actionSanityCheck
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
        + " entity " + actor.getErrorIdString + " who is"
        + " not an admin");
      return;
    }
  }

  private announceAction
  (
    actor: GameEntity,
    target: GameEntity,
    action: string,
    level: AdminLevel
  )
  {
    let message = target.name + " has been " + action + "d"
      + " to level " + AdminLevel[level];

    // Send info message to all online players.
    Game.send(message);

    // Send info message to syslog.
    Syslog.log
    (
      message,
      Syslog.msgType.SYSTEM_INFO,
      AdminLevel.IMMORTAL
    );
  }
}