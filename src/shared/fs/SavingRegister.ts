/*
  Part of BrutusNEXT

  TODO
*/

'use strict';

import {ERROR} from '../../shared/error/ERROR';
import {SavingRecord} from '../../shared/fs/SavingRecord';

export class SavingRegister
{
  // Hashmap<[ string, SavingRecord ]>
  //   Key: full save path
  //   Value: SavingRecord
  public static savingProcesses = new Map();

  // -> Returns Promise if file is being saved right now so
  //      the caller needs to wait (using the returned Promise).
  //    Returns null if this file isn't beeing saved right now
  //      so it is possible to start saving right away.
  public static requestSaving(filePath: string): Promise<void>
  {
    let savingRecord = SavingRegister.savingProcesses.get(filePath);

    if (savingRecord === undefined)
    {
      // Nobody is saving to the filePath yet.
      savingRecord = new SavingRecord();

      // Note: We don't push a resolve callback for the first
      // request, because it will be processed right away.
      this.savingProcesses.set(filePath, savingRecord);
      return null;
    }
    
    // Someone is already saving to the filePath.
    return savingRecord.addRequest();
  }

  public static reportFinishedSaving(filePath: string)
  {
    let savingRecord: SavingRecord =
      SavingRegister.savingProcesses.get(filePath);

    if (savingRecord === undefined)
    {
      ERROR("Attempt to report finished saving of file"
        + " " + filePath + " which is not registered as"
        + " being saved");
      // We can't really do much if we don't have a saving record.
      return;
    }

    if (savingRecord.hasMoreRequests() === false)
    {
      // By deleting the savingRecord from hashmap, we mark
      // 'filePath' as not being saved right now.
      if (!SavingRegister.savingProcesses.delete(filePath))
      {
        ERROR("Failed to remove savingRecord for file"
          + " " + filePath + " from SavingRegister");
      }

      return;
    }

    // There are more saving requets in the queue for filePath.

    // Retrieve the first item from the queue.
    let resolveCallback = savingRecord.pollRequest();

    if (resolveCallback === null || resolveCallback === undefined)
    {
      ERROR("Invalid resolve callback in savingRecord for file"
        + " " + filePath);
      return;
    }

    // By calling the resolve callback we finish savingAwaiter()
    // asynchronous function of whoever called us. That should
    // lead to the next saving to proceed.
    //   Note: 'savingRecord' stays in the queue even if
    // there are no more requets in it's queue to indicate
    // that 'filePath' is being saved right now. It will
    // be removed from SavingRegister.savingProcesses when
    // reportFinishedSaving is called again (presuming there
    // won't be any more save requets for this filePath untill
    // the saving is finished).
    resolveCallback();
  }
}