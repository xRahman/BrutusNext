/*
  Part of BrutusNEXT

  Implements generator of unique ids.
*/

export class IdProvider
{
  public generateId(): string
  {
    this.myLastIssuedId++;

    // String id is simply a hexadecimal representation of an integer.
    return this.myLastIssuedId.toString(16);
  }

  protected myLastIssuedId: number = 0;
}