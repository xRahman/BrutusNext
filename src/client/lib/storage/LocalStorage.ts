/*
  Part of BrutusNEXT

  HTML 5 local storage.
*/

'use strict';

export class LocalStorage
{

  // Note: 'BrutusNext_' prefix is probably not necessary because
  //   local storage is per origin (per domain and protocol) but
  //   it shouldn't hurt even so.

  public static get REMEMBER_ME_ENTRY()
    { return 'BrutusNext_RememberMe'; }
  public static get REMEMBER_ME_VALUE()
    { return 'RememberMe'; }
  public static get EMAIL_ENTRY()
    { return 'BrutusNext_UserEmail'; }
  // The key is intentionally not named 'password'.
  public static get PASSWORD_ENTRY()
    { return 'BrutusNext_LoginKey'; }

  // ---------------- Public methods --------------------

  public static read(entry: string): string
  {
    return localStorage.getItem(entry)
  }

  public static write(entry: string, value: string)
  {
    localStorage.setItem(entry, value);
  }

  public static delete(entry: string)
  {
    localStorage.removeItem(entry);
  }

  public static isAvailable()
  {
    // Check if Html 5 local storage is available.
    return Storage !== undefined;
  }
}
