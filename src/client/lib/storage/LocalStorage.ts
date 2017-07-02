/*
  Part of BrutusNEXT

  HTML 5 local storage.
*/

'use strict';

export class LocalStorage
{
  public static get EMAIL_ENTRY()    { return 'BrutusNextUserEmail'; }
  public static get PASSWORD_ENTRY() { return 'BrutusNextUserPassword'; }

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
