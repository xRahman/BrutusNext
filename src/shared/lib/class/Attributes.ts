/*
  Part of BrutusNEXT

  Specifies structure of static class attributes.
*/

/*
  Default value (listed in comment) is used when attribute is not present.
*/

'use strict';

export interface Attributes
{
  // Property is saved to disk.
  //   Default: false
  saved?: boolean,
  // Property can be edited.
  //   Default: false
  edited?: boolean,
  // Property is included when object is sent from the server to the client.
  //   Default: false
  sentToClient?: boolean,
  // Property is included when object is send from the client to the server
  //   Default: false
  sentToServer?: boolean
}
