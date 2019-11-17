/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Ancestor of server response packets.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Packet} from '../../../shared/lib/protocol/Packet';
import {Request} from '../../../shared/lib/protocol/Request';

export abstract class Response extends Packet
{
  // --------------- Public accessors -------------------

  // public setProblems(problems: Request.Problems)
  // {
  //   if (problems !== null && this.problems !== null)
  //   {
  //     ERROR("Attempt to set 'problems' object to response"
  //       + " packet that already has 'problems' object."
  //       + " Problems are not set");
  //     return;
  //   }

  //   this.problems = problems;

  //   /// TODO: Vymyslet, kam dát kontrolu tečky na konci problem
  //   /// stringů. Tady by to sice šlo, ale nestačí to, protože
  //   /// 'problems' se vypisují už na klientu bez toho, že by se
  //   /// setovaly do response packetu.
  //   // if (problems === "")
  //   // {
  //   //   ERROR("Attempt to set empty string to this.problem."
  //   //     + "Setting 'null' instead");
  //   //   this.problems = null;
  //   //   return;
  //   // }

  //   // // Make sure that 'problem' string ends with period.
  //   // if (problems.slice(-1) !== '.')
  //   // {
  //   //   ERROR("Missing '.' at the end of problem string. Adding"
  //   //     + " it automatically (but you should fix it anyways)");
  //   //   problems += '.';
  //   // }

  //   // this.problems = problems;
  // }

  // public getProblem()
  // {
  //   return this.problems;
  // }

    // ----------------- Private data ---------------------

  // // Description of problems found in request or related to it's processing.
  // private problems: (Request.Problems | null) = null;


  // -------------- Protected methods -------------------

  /// To be deleted (this should not be needed anymore).
  // protected reportInvalidResponse(action: string)
  // {
  //   ERROR("Received " + action + " response with unspecified result."
  //       + " Someone problably forgot to set 'packet.result' when"
  //       + " sending " + action + " response from the server");
  // }
}