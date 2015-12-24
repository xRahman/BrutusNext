/*
  Part of BrutusNEXT

  Implements generator of unique ids.
*/

/*
  Don't use this class alone, extend your container from IdContainer<T>
  and pass it an instance of IdProvider.
*/

/// TODO:
/// 1) Zmenit to na static class a univerzalne unikatni idcka
/// (to taky znamena, ze se instance IdProvideru nebude muset predavat
/// IdContainerum, protoze si vsichni budou brat idcka ze stejneho zdroje)
/// 2) zmenit typ idcka ze stringu na class Id (nebo mozna IdType),
/// kde bude:
/// - stringove ID,
/// - typ IDcka (ROOM_ID, SOCKET_DESCRIPTOR_ID, atd.)
/// - boot timestamp
/// (v kazdem bootu se budou idcka pridelovat od 1, ale ve spojeni s boot
/// timestampem budou vsechna idcka unikatni i pres boot - coz bude fajn
/// treba pri porovnavani, kdo byl zdrojem affectu)

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Mudlog} from '../server/Mudlog';
import {Id} from '../shared/Id';
import {SaveableObject} from '../shared/SaveableObject';

// Built-in node.js modules.
import * as fs from 'fs';  // Import namespace 'fs' from node.js

export class IdProvider extends SaveableObject
{
  constructor()
  {
    super();

    this.loadLastIssuedId();
  }

  // -------------- Public static data ------------------

  static get LAST_ISSUED_ID_FILE() { return "./data/LastIssuedId.json"; }

  // ---------------- Public methods --------------------

  // Use 'Id.NULL' as an 'invalid' id value. Don't use 'null' because
  // it would prevent loading your ids from file.
  public generateId(typeOfId: string, type: string): Id
  {
    ASSERT_FATAL(this.myLoadedFromFile === true,
      "Attempt to generate an id before IdProvider has loaded"
      + "lastIssuedId from file");

    // This little gymnastics is probably not necessary, but I will
    // definitely sleep better knowing that there is no way we could
    // ever run out of ids (except if we run out of memory).
    if (this.myLastIssuedId[this.myLastIssuedId.length - 1]
    // Number.MAX_SAFE_INTEGER constant can't be used for some reason.
    // So let's just use it's value.
      >= 9007199254740991)
    {
      // The idea is that when we run out of numbers in an integer,
      // we just add more.
      this.myLastIssuedId.push(0);
    } else
    {
      this.myLastIssuedId[this.myLastIssuedId.length - 1]++;
    }

    let stringId = "";

    // And concatenate hexadecimal string representations of all used
    // integer values.
    for (let i = 0; i < this.myLastIssuedId.length; i++)
      stringId += this.myLastIssuedId[i].toString(16);

    return new Id(stringId, type);
  }

  public async saveLastIssuedId()
  {
    // saveToFile() is inherited from SaveableObject.
    // It calls saveToJsonString() (also inherited from SaveableObject),
    // which calls saveToJsonObject() which we have overriden to only
    // save lastIssuedId.
    await this.saveToFile(IdProvider.LAST_ISSUED_ID_FILE);
  }

  // Load is synchronous.
  // It should only be called at the start of the server and it needs to be
  // done before any ids are issued.
  // (issuing is ids is locked untill loadLastIssuedId() is called)
  public loadLastIssuedId()
  {
    let jsonString = "";

    try
    {
      // Here we need synchronous reading because myLastIssuedId needs
      // to be loaded from file before any id is ever issued.
      jsonString = fs.readFileSync(IdProvider.LAST_ISSUED_ID_FILE, 'utf8');
    }
    catch (error)
    {
      Mudlog.log(
        "Error loading file '"
        + IdProvider.LAST_ISSUED_ID_FILE + "': "
        + error.code,
        Mudlog.msgType.SYSTEM_ERROR,
        Mudlog.levels.IMMORTAL);

      // Throw the exception so the mud will get terminated with error
      // message.
      throw error;
    }

    // loadFromJsonString() is inherited from SaveableObject.
    // It calls loadFromJsonObject() which we have overriden.
    this.loadFromJsonString(jsonString);

    ASSERT_FATAL(this.myLastIssuedId !== null
      && this.myLastIssuedId !== undefined,
      "Error loading lastIssuedId from file");

    // Remove the lock preventing issuing of new ids.
    this.myLoadedFromFile = true;
  }

  // -------------- Protected class data ----------------

  ///protected myLastIssuedId: Array<number> = [0];
  protected myLastIssuedId: Array<number> = null;

  // This lock prevents us from issuing new ids before myLastIssuedId is
  // loaded from file (from last boot).
  protected myLoadedFromFile = false;

  // -------------- Protected methods -------------------

  // Overrides SaveableObject::saveToFile() to not to save
  // lastIssuedId (because it's done by this method so it would
  // lead endless recursion and stack overflow.
  protected async saveToFile(filePath: string)
  {
    await this.saveContentsToFile(filePath);
  }

  // Overrides SaveableObject::loadFromJsonObject() to only
  // save lastIssuedId.
  protected saveToJsonObject(): Object
  {
    let jsonObject: Object = {};

    // We only save lastIssuedId.
    jsonObject['lastIssuedId'] = this.myLastIssuedId;

    return jsonObject;
  }

  // Overrides loadFromJsonObject() from SaveableObject to only
  // load lastIssuedId.
  protected loadFromJsonObject(jsonObject: Object)
  {
    let property = 'lastIssuedId';

    ASSERT_FATAL('lastIssuedId' in jsonObject,
      "Property 'lastIssuedId' exists in object but not in JSON data");

    this.myLastIssuedId = jsonObject['lastIssuedId'];
  }
}