/*
  Part of BrutusNext

  Queue of requests to save the same file
*/

import { Types } from "../../Shared/Utils/Types";

export class SavingQueue
{
  // ----------------- Private data ---------------------

  private readonly requestQueue: Array<Types.ResolveFunction<void>> = [];

  // ---------------- Public methods --------------------

  public async addNewRequest(): Promise<void>
  {
    return new Promise<void>
    (
      (resolve, reject) => { this.requestQueue.push(resolve); }
    );
  }

  public pullNextRequest()
  : { startSaving: Types.ResolveFunction<void> } | "Queue is empty"
  {
    const nextRequestCallback = this.requestQueue.shift();

    if (nextRequestCallback === undefined)
      return "Queue is empty";

    return { startSaving: nextRequestCallback };
  }
}