/*
  Part of BrutusNEXT

  TODO
*/

/*
/// Ok, tak ne. Na deduplikaci requestu se vykaslu, je to moc slozity
/// a v praxi se nejspis beztak nikdy nestane, ze by to bylo potreba.
  Each SavingRecord corresponds to a single save file (with full path).
  If more the two requests to save the same object (to save the same file)
  came, we don't really want to save the object multiple times.
    We need to save it once more, because there might be changes in data
  that are already saved (even though the whole saving is not yet done),
  but there is no point in resaving the same file more than once.
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';

// 3rd party modules.
let FastPriorityQueue = require('fastpriorityqueue');

export class SavingRecord
{
  // FastPriorityQueue of resolve callbacks.
  public requests = null;

  // 'resolveCallback' is a function used to finish
  // waiting before processing next request.
  // -> Returns Promise which the caller need to use to wait for his turn.
  //    (by using 'await saveAwaiter(promise);')
  public addRequest(): Promise<void>
  {
    let resolveCallback = null;

    // First we are going to create a new Promise object and
    // remember it's 'resolve' callback so we can later resolve
    // it ourselves.
    //   Explanation: Whoever initiated saving request needs to
    // wait using 'await saveAwaiter(promise);'. We will finish
    // this wait by calling respective resolve callback for this
    // promise so the caller starts his own saving.
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

  // You should call hasMoreRequest() to ensure that there
  // is something to pop before calling popRequest().
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