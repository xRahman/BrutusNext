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

  public getNextRequest()
  : { startSaving: Types.ResolveFunction<void> } | "Queue is empty"
  {
    const nextRequestCallback = this.requestQueue.shift();

    if (nextRequestCallback === undefined)
      return "Queue is empty";

    return { startSaving: nextRequestCallback };
  }
}