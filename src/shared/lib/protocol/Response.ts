/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Ancestor of server response packets.
*/

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Packet} from '../../../shared/lib/protocol/Packet';

export class Response extends Packet
{
  // ----------------- Private data ---------------------

  // Description of problem if the request is denied.
  private problem: string = null;

  // --------------- Public accessors -------------------

  public setProblem(problem: string)
  {
    if (problem === "")
    {
      ERROR("Attempt to set empty string to this.problem."
        + "Setting 'null' instead");
      this.problem = null;
      return;
    }

    // Make sure that 'problem' string ends with period.
    if (problem.slice(-1) !== '.')
    {
      ERROR("Missing '.' at the end of problem string. Adding"
        + " it automatically (but you should fix it anyways)");
      problem += '.';
    }

    this.problem = problem;
  }

  public getProblem()
  {
    return this.problem;
  }
}