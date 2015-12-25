/*
  Part of BrutusNEXT

  Container for socket descriptors.
*/

'use strict';

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {IdContainer} from '../shared/IdContainer';
import {SocketDescriptor} from '../server/SocketDescriptor';
import {PlayerConnection} from '../server/PlayerConnection';

// Import namespace 'net' from node.js
import * as net from 'net';

export class PlayerConnectionManager extends IdContainer<PlayerConnection>
{
  // Creates a socket descriptor, returns its unique id.
  public addPlayerConnection(socketDescriptor: SocketDescriptor): Id
  {
    let newId = this.addNewItem(new PlayerConnection(socketDescriptor));

    // Player connections are not persistent (if player disconnects and
    // connects again, he will have new connectionId), so there is no point
    // in saving playerConnectionIds.
    newId.isSaved = false;

    return newId;
  }

  // Closes the player connection and removes if from the manager.
  public dropPlayerConnection(connectionId: Id)
  {
    let playerConnection = this.getItem(connectionId);

    playerConnection.close();

    this.deleteItem(connectionId);
  }

  public getPlayerConnection(id: Id): PlayerConnection
  {
    return this.getItem(id);
  }
}