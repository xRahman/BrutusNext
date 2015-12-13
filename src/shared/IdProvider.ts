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

import {Id} from '../shared/Id';

export class IdProvider
{
  // Use "" as an 'invalid' id value.
  public static generateId(typeOfId: string): Id
  {
    // This little gymnastics is probably not necessary, but I will
    // definitely sleep better knowing that there is no way we could
    // ever run out of ids (except if we run out of memory).
    if (IdProvider.myLastIssuedId[IdProvider.myLastIssuedId.length - 1]
      // Number.MAX_SAFE_INTEGER constant can't be used for some reason.
      // So let's just use it's value.
      >= 9007199254740991)
    {
      // The idea is that when we run out of numbers in an integer,
      // we just add more.
      IdProvider.myLastIssuedId.push(0);
    } else
    {
      IdProvider.myLastIssuedId[IdProvider.myLastIssuedId.length - 1]++;
    }

    let stringId = "";

    // And concatenate hexadecimal string representations of all used
    // integer values.
    for (let i = 0; i < IdProvider.myLastIssuedId.length; i++)
      stringId += IdProvider.myLastIssuedId[i].toString(16)

    return new Id(stringId, typeOfId);
  }

  protected static myLastIssuedId: Array<number> = [ 0 ];
}