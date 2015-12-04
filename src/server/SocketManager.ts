/*
  Part of BrutusNEXT

  Implements container for sockets.
*/

import * as net from 'net';  // Import namespace 'net' from node.js
import {ASSERT} from '../shared/ASSERT';
import {ASSERT_FATAL} from '../shared/ASSERT';
import {IdProvider} from '../shared/IdProvider';
import {SocketDescriptor} from '../server/SocketDescriptor';

export class SocketManager extends IdProvider
{
  // Creates a socket descriptor, returns its unique string id.
  public addSocketDescriptor(socket: net.Socket): string
  {
    let stringId = this.generateId();

    ASSERT_FATAL(!(stringId in this.mySocketDescriptors),
      "Something very bad happened: Socket descriptor with id "
      + stringId + "already exists");

    // Here we are creating a new property in mySocketDescriptors
    // named < value of 'id'>.
    // (it is possible because mySocketDescriptors is hashmap)
    this.mySocketDescriptors[stringId] =
      new SocketDescriptor(socket, stringId);

    // We also need to add socket reference directly to mySocketReferences,
    // so we can find which socket has triggered a particular event
    this.mySocketReferences.push(socket);

    // And finaly we also need to remember which string id within
    // mySocketDescriptors corresponds to the socket reference.
    // (we will do it indirectly by remembering which string id pairs to the
    // array index of our socket reference)
    let indexOfSocketReference = this.mySocketReferences.indexOf(socket);
    this.myReferenceToDescriptorMap[indexOfSocketReference] = stringId;

    return stringId;
  }

  // Handle a socket error by closing the connection.
  public socketError(socket: net.Socket)
  {
    /// TODO: Mozna poslat nejake info hraci, ze se stalo neco zleho.
    /// (zatim naprosto netusim, pri jake prilezitosti muze socket error
    /// nastat)

    // Remove the corresponding socket descriptor.
    this.deleteSocketDescriptor(socket);
  }

  public getSocketById(id: string)
  {
    let socketDescriptor = this.mySocketDescriptors[id];
    ASSERT_FATAL(typeof socketDescriptor !== 'undefined',
      "Socket with id " + id + " no longer exists");

    return socketDescriptor.socket;
  }

  public getSocketStringId(socket: net.Socket): string
  {
    let index = this.mySocketReferences.indexOf(socket);
    ASSERT_FATAL(index >= 0 && index < this.mySocketReferences.length,
      "There is no record for given socket");

    ASSERT_FATAL(index in this.myReferenceToDescriptorMap,
      "There is no record for given socket reference");
 
    let descriptorId = this.myReferenceToDescriptorMap[index]

    ASSERT_FATAL(descriptorId in this.mySocketDescriptors,
      "There is no descriptor matching given socket");

    return descriptorId;
  }

  // This hash map allows to access sockets using unique string ids.
  protected mySocketDescriptors: { [key: string]: SocketDescriptor } = {};
  // We also need to store sockets directly within an array, because
  // we need to be able to identify which socket generated an event.
  // (first we find out which index in mySocketReferences corresponds to the
  // given reference to socket, next we get corresponding unique string id
  // using myReferenceToDescriptorMap).
  protected mySocketReferences: Array<net.Socket> = [];
  // This map tells us what unique string id (pointing to mySocketDescriptors)
  // corresponds to a given index within mySocketReferences[] array.
  protected myReferenceToDescriptorMap: { [key: number]: string } = {};

  protected deleteSocketDescriptor(socket: net.Socket)
  {
    let index = this.mySocketReferences.indexOf(socket);

    ASSERT_FATAL(index >= 0 && index < this.mySocketReferences.length,
      "There is no record for given socket");

    let descriptorId = this.myReferenceToDescriptorMap[index];

    // Delete the property that traslates to the descriptor.
    delete this.mySocketDescriptors[descriptorId];

    // Delete the property that traslates to the descriptor.
    delete this.myReferenceToDescriptorMap[index];

    // Remove 1 item from the array at specified index.
    this.mySocketReferences.splice(index, 1);
  }

  /*
  /// TODO
  /// Otazka je, kdy budu mazat sockety - dost mozna jen ze socket eventu,
  /// v tom pripade bych je mazal podle reference na socket, ne podle idcka.
  public deleteSocketDescriptor(id: string)
  {
    let descriptor = this.mySocketDescriptors[id];

    if (!ASSERT(typeof descriptor !== 'undefined',
      "Attempt to remove socket with id: " + id + " which doesn't exist."))
      return;

    delete this.mySocketDescriptors[id];

    /// TODO: Zrusit socket taky z mySocketReferences a myReferenceToDescriptorMap
    /// (jen je otazka, jak to dohledat...)
    /// mazat z poli se bude nejak takhle:
    ///
    /// var i = sockets.indexOf(socket);
	  /// if (i != -1) {
		///   sockets.splice(i, 1);
  }
  */
}