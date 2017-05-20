/*
  Part of BrutusNEXT

  Keeps track of all saving to physical files so we can prevent
  simultaneous saving to the same file (which could lead to files
  not being saved correctly).
*/

/*
'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {SavingQueue} from '../../../server/lib/fs/SavingQueue';

export class SavingManager
{
  //------------------ Private data ---------------------

  // Hashmap<[ string, SavingRecord ]>
  //   Key: full save path
  //   Value: SavingQueue
  private static savingQueues = new Map<string, SavingQueue>();

  // ---------------- Static methods --------------------

  // -> Returns Promise if file is being saved right now so
  //      the caller needs to wait (using the returned Promise).
  //    Returns null if this file isn't beeing saved right now
  //      so it is possible to start saving right away.
  public static requestSaving(path: string): Promise<{}>
  {
    let queue = SavingManager.savingQueues.get(path);

    if (queue === undefined)
    {
      // Nobody is saving to the path yet.
      queue = new SavingQueue();

      // Note: We don't push a resolve callback for the first
      // request, because it will be processed right away.
      this.savingQueues.set(path, queue);

      return null;
    }
    
    // Someone is already saving to the path.
    return queue.addRequest();
  }

  public static finishSaving(path: string)
  {
    let queue = SavingManager.savingQueues.get(path);

    if (queue === undefined)
    {
      ERROR("Attempt to report finished saving of file"
        + " " + path + " which is not registered as"
        + " being saved");
      // We can't really do much if we don't have a saving record.
      return;
    }

    if (!queue.hasMoreRequests())
    {
      // By deleting the savingRecord from hashmap, we mark
      // 'path' as not being saved right now.
      if (!SavingManager.savingQueues.delete(path))
      {
        ERROR("Failed to remove savingRecord for file"
          + " " + path + " from SavingRegister");
      }

      return;
    }

    // There are more requests in the queue for path.

    // Retrieve the first item from the queue.
    let resolveCallback = queue.pollRequest();

    if (resolveCallback === null || resolveCallback === undefined)
    {
      ERROR("Invalid resolve callback in savingRecord for file"
        + " " + path);
      return;
    }

    // By calling the resolve callback we finish savingAwaiter()
    // asynchronous function of whoever called us. That should
    // lead to the next saving to proceed.
    //   Note: 'savingRecord' stays in the queue even if
    // there are no more requets in it's queue to indicate
    // that 'path' is being saved right now. It will
    // be removed from SavingRegister.savingProcesses when
    // reportFinishedSaving is called again (presuming there
    // won't be any more save requets for this path until
    // the saving is finished).
    resolveCallback();
  }
}
*/