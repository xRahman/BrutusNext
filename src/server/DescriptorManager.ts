/*
  Part of BrutusNEXT

  Container for socket descriptors.
*/

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {Id} from '../shared/Id';
import {IdContainer} from '../shared/IdContainer';
import {SocketDescriptor} from '../server/SocketDescriptor';

// Import namespace 'net' from node.js
import * as net from 'net';

export class DescriptorManager extends IdContainer<SocketDescriptor>
{
  // ---------------- Public methods --------------------
 
  // Creates a socket descriptor, returns its unique id.
  public addSocketDescriptor(socket: net.Socket): Id
  {
    // generateId() is a method inherited from IdProvider.
    let newId = this.addItem(new SocketDescriptor(socket));
    this.getItem(newId).id = newId;

    return newId;
  }

  // Handle a socket error by closing the connection.
  public socketError(descriptorId: Id)
  {
    this.getItem(descriptorId).socketError();

    // Remove the corresponding socket descriptor.
    this.deleteItem(descriptorId);
  }

  public socketClose(descriptorId: Id)
  {
    let socketDescriptor = this.getItem(descriptorId);

    socketDescriptor.socketClose();

    this.deleteItem(descriptorId);
  }
  
  public getSocketDescriptor(id: Id)
  {
    return this.getItem(id);
  }
}