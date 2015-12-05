/*
  Part of BrutusNEXT

  Implements container for socket descriptors.
*/

import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {IdProvider} from '../shared/IdProvider';
import {SocketDescriptor} from '../server/SocketDescriptor';

// Import namespace 'net' from node.js
import * as net from 'net';

export class DescriptorManager extends IdProvider
{
  // ---------------- Public methods --------------------

  // Creates a socket descriptor, returns its unique string id.
  public addSocketDescriptor(socket: net.Socket): string
  {
    // generateId() is a method inherited from IdProvider.
    let newId = this.generateId();

    ASSERT_FATAL(!(newId in this.mySocketDescriptors),
      "Socket descriptor '" + newId + "' already exists");

    // Here we are creating a new property in mySocketDescriptors
    // (it is possible because mySocketDescriptors is a hashmap)
    this.mySocketDescriptors[newId] =
      new SocketDescriptor(socket, newId);

    return newId;
  }

  // Handle a socket error by closing the connection.
  public socketError(descriptorId: string)
  {
    this.getSocketDescriptor(descriptorId).socketError();

    // Remove the corresponding socket descriptor.
    this.deleteSocketDescriptor(descriptorId);
  }

  public socketClose(descriptorId: string)
  {
    let socketDescriptor = this.getSocketDescriptor(descriptorId);

    socketDescriptor.socketClose();

    this.deleteSocketDescriptor(descriptorId);
  }

  public getSocketDescriptor(id: string)
  {
    let socketDescriptor = this.mySocketDescriptors[id];
    ASSERT_FATAL(typeof socketDescriptor !== 'undefined',
      "Socket descriptor (" + id + ") no longer exists");

    return socketDescriptor;
  }

  // -------------- Protected class data ----------------

  // This hash map allows to access sockets using unique string ids.
  protected mySocketDescriptors: { [key: string]: SocketDescriptor } = {};

  // -------------- Protected methods -------------------

  protected deleteSocketDescriptor(descriptorId: string)
  {
    // Delete the property that traslates to the descriptor.
    delete this.mySocketDescriptors[descriptorId];
  }
}