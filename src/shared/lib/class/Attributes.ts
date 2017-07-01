/*
  Part of BrutusNEXT

  Specifies structure of static property attributes.
*/

/*
  Default value (listed in comment) is used when attribute is not present
  (see Serializable.isToBeSerialized() for details).
*/

/// Všechno by asi mělo mít default: true, protože classy mohou obsahovat
/// obyčejné objekty, do kterých nejde zapisovat atributy. Tj. atributy
/// plain objectů by se měly defaultně serializovat.
/*
 I když, v zásadě i obyč struktury by mohly mít static atributy - ty
 totiž taky mohou být strukturované.
 Tj:
   public objectProperty { x: 2 }
 může mít static property:
   private static objectProperty =
   {
     x: Attributes
     {
       saved: false
     }
   }

   - tohle bych ovšem musel přidat do Attributable.
*/

'use strict';

/*
TODO:
{
  saved,
  edited,
  sentBrief,  // Sent to client in brief mode.
  sentFull,   // Sent to client in full mode.
  received    // Received from client.
}
*/

export interface Attributes
{
  // Property is saved to disk.
  //   Default: true
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
