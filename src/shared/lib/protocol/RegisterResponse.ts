/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Server response to register request.
*/

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Classes} from '../../../shared/lib/class/Classes';

export class RegisterResponse extends Serializable
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // Is the request accepted?
  public accepted = false;

  // Description of problem if the request is denied.
  public problem: string = null;

  /// Tohle nebude tak jednoduché
  /// - Account je entita, takže může být na víc částí (předci zvlášť).
  /// TODO
  ///public account: Account = null;
}

Classes.registerSerializableClass(RegisterResponse);