/* Part of BrutusNext */

/*
  Class that keeps track of multiple requests to save the same file.
*/

import { Types } from "../../Shared/Utils/Types";

export class SavingQueue
{
  // ----------------- Private data ---------------------

  private readonly requestQueue: Types.ResolveFunction<void>[] = [];

  // ---------------- Public methods --------------------

  // Whoever initiated saving request needs to wait using
  // 'await saveAwaiter(promise)'. See FileSystem.saveAwaiter().
  public async addRequest(): Promise<void>
  {
    return new Promise<void>
    (
      (resolve, reject) => { this.requestQueue.push(resolve); }
    );
  }

  // Removes and returns one item from the start of the queue.
  public pollRequest(): Types.ResolveFunction<void> | "Queue is empty"
  {
    const firstElement = this.requestQueue.shift();

    if (firstElement === undefined)
      return "Queue is empty";

    return firstElement;
  }
}