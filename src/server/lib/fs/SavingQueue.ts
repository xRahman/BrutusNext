/*
  Part of BrutusNEXT

  Keeps track of multiple requests to save the same file.
*/

/*
  Note:
    It would make sense to 'deduplicate' saving requests (beside the one
    currencly beeing processed), because it doesn't make much sense to
    resave the same file multiple times. But I'm not going to implement
    it right now, because it wouldn't be trivial and it will probably be
    extremely rare scenario anyways.
*/

'use strict';

import {ERROR} from '../../../server/lib/error/ERROR';

// 3rd party modules.
let FastPriorityQueue = require('fastpriorityqueue');

export class SavingQueue
{
  //------------------ Private data ---------------------

  // FastPriorityQueue of resolve callbacks.
  private requests = null;

  // ---------------- Public methods --------------------

  // -> Returns Promise which the caller need to use to wait for his turn.
  //    (by using 'await saveAwaiter(promise);')
  public addRequest(): Promise<{}>
  {
    // Callback function used to finish waiting before processing
    // next saving request.
    let resolveCallback = null;

    // First we are going to create a new Promise object and
    // remember it's 'resolve' callback so we can later resolve
    // it ourselves.
    //   Explanation: Whoever initiated saving request needs to
    // wait using 'await saveAwaiter(promise);'. We will finish
    // this wait by calling respective resolve callback for this
    // promise so the caller proceeds with his own saving.
    let promise = new Promise
    (
      (resolve, reject) =>
      {
        // Here we just remember the resolve callback function
        // so we can call it later ourselves to resolve the promise.
        resolveCallback = resolve;
      }
    );

    // Now we can add 'resolveCallback' to the queue.  
    if (this.requests === null)
      this.requests = new FastPriorityQueue();

    this.requests.add(resolveCallback);

    return promise;
  }

  // Retrieves one item from the start of the queue.
  // Note:
  //   You should call hasMoreRequest() to ensure that there
  //   is something to pop before calling popRequest().
  // -> Returns null if there no item to pop from the queue.
  public pollRequest()
  {
    if (!this.hasMoreRequests())
    {
      ERROR("Attempt to pop request from SavingRecord"
        + " which contains no more requests");
      return null;
    }

    // Removes one item from the srat of the queue.
    return this.requests.poll();
  }

  public hasMoreRequests(): boolean
  {
    if (this.requests === null)
      return false;

    return this.requests.isEmpty() === false;
  }
}