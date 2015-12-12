/*
  Part of BrutusNEXT

  Unique identifier.
*/

import {ASSERT} from '../shared/ASSERT';
import {Server} from '../server/Server';

/*
/// Zatim to ze SaveableObjectu dedit nebudu. To by znamenalo, ze by se mi
/// idcka savovala/loadovala VZDYCKY, tj. by by load prepisoval stavajici
/// idcka nejakymi starymi. Kdyz to SaveableObject nebude, tak porad pujde
/// savnout idcko proste tim, ze ho dam do myData - ale budu si to moci
/// vybrat.

/// Otazka ale je, jestli mi v takovem bude fungovat load. Asi nebude, protoze
/// se nevytvori spravny typ. TODO: Uvidim, az narazim na to pripad, kdy to
/// budu potrebovat.

///import {SaveableObject} from '../shared/SaveableObject';

// Ids are able to save/load themselves to JSON file.
///export class Id extends SaveableObject
*/
export class Id
{
  // myStringID should be unique per boot.
  // myTypeOfId is the name of the contaier class that issued this id.
  constructor(protected myStringId: string, protected myTypeOfId: string)
  {
    /*
    // Don't forget to bump up version number if you add or remove
    // properties. You will also need to convert data in respective
    // .json files to conform to the new version.
    ///super({ version: 0 });
    */

    this.myTimeOfBoot = Server.timeOfBoot;
  }

  public get stringId() { return this.myStringId; }
  public get typeOfId() { return this.myTypeOfId; }
  public get timeOfBoot() { return this.myTimeOfBoot; }

  public equals(operand: Id)
  {
    ASSERT(operand.stringId !== "", "Attempt to compare to an invalid id");
    ASSERT(this.stringId !== "", "Attempt to compare an invalid id");

    if (this.stringId !== operand.stringId)
      return false;

    if (this.timeOfBoot !== operand.timeOfBoot)
      return false;

    ASSERT(this.typeOfId === operand.typeOfId,
      "Comapred ids are equal but they differ in type of id."
      +" That's not supposed to happen");

    return true;
  }

  // -------------- Protected class data ----------------

  // Time of boot is used in conjunction with a per-boot unique stringId, to achieve
  // universal uniqueness of stringId.
  protected myTimeOfBoot: Date = null;
}