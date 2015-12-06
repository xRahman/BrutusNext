/*
  Part of BrutusNEXT

  Implements generator of unique ids.
*/

/*
  Don't use this class alone, extend your container from IdContainer<T>
  and pass it an instance of IdProvider.
*/

export class IdProvider
{
  // Use "" as an 'invalid' id value.
  public generateId(): string
  {
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
      stringId += this.myLastIssuedId[i].toString(16)

    console.log("Issuing unique id: '" + stringId + "'");

    return stringId;
  }

  protected myLastIssuedId: Array<number> = [ 0 ];
}