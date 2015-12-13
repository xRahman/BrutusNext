/*
  Part of BrutusNEXT

  Container for socket descriptors.
*/

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
    // generateId() is a method inherited from IdProvider.
    let newId = this.addItem(new PlayerConnection(socketDescriptor));
    this.getItem(newId).id = newId;

    return newId;
  }

  // This should only be called from PlayerConnection.close();
  //   Removes the connection from the manager but does not close the link. You
  // need yo call PlayerConnection.close() to correctly close the connection.
  public removePlayerConnection(connectionId: Id)
  {
    let playerConnection = this.getItem(connectionId);

    this.deleteItem(connectionId);
  }

  public getPlayerConnection(id: Id)
  {
    return this.getItem(id);
  }
}