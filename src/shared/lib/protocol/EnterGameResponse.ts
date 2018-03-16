/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Server response to character selection request.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Entity} from '../../../shared/lib/entity/Entity';
import {Serializable} from '../../../shared/lib/class/Serializable';
import {Move} from '../../../shared/lib/protocol/Move';
import {Request} from '../../../shared/lib/protocol/Request';
import {Response} from '../../../shared/lib/protocol/Response';
import {EnterGameRequest} from '../../../shared/lib/protocol/EnterGameRequest';
import {SerializedEntity} from '../../../shared/lib/protocol/SerializedEntity';
import {Classes} from '../../../shared/lib/class/Classes';

export abstract class EnterGameResponse extends Response
{
  constructor()
  {
    super();

    this.version = 0;
  }

  // --------------- Public accessors -------------------

  public getResult() { return this.result; }

  // ----------------- Public data ----------------------

  /*
  // Is the request accepted?
  public result = EnterGameResponse.Result.UNDEFINED;
  */

  // // Where did the character entered game.
  // public characterMove: (Move | null) = null;

  // // Serialized data of 'loadLocation' entity.
  // public serializedLoadLocation: (SerializedEntity | null) = null;

  // ---------------- Protected data --------------------

  // ----------------- Private data --------------------- 

  private result: EnterGameResponse.Result = "UNDEFINED";

  // ---------------- Public methods --------------------

  public addProblem(problem: EnterGameRequest.Problem)
  {
    if (this.result === "UNDEFINED")
    {
      this.result = { status: "REJECTED", problems: [ problem ] };
      return;
    }

    if (this.result.status === "ACCEPTED")
    {
      throw new Error
      (
        "Attempt to add problem to response"
        + " which has already been accepted."
        + " Response will not be sent"
      );
    }

    // Even if the response already is "REJECTED",
    // we can still add more problems to it.
    this.result.problems.push(problem);
  }

  public accept(loadLocation: Entity, characterMove: Move)
  {
    if (this.result !== "UNDEFINED")
    {
      throw new Error
      (
        "Attempt to accept response which has"
        + " already been accepted or rejected."
        + " Response will not be sent"
      );
    }

    this.result =
    {
      status: "ACCEPTED",
      characterMove: characterMove,
      serializedLoadLocation: this.serializeLoadLocation(loadLocation);
    };
  }

  public serializeLoadLocation(loadLocation: Entity): SerializedEntity
  {
    if (!loadLocation.isValid())
      throw new Error("Invalid 'loadLocation'. Response will not be sent");

    let serializedLoadLocation = new SerializedEntity();

    serializedLoadLocation.serialize
    (
      loadLocation,
      Serializable.Mode.SEND_TO_CLIENT
    );
  }
}

// ------------------ Type declarations ----------------------

export module EnterGameResponse
{
  export type Undefined = "UNDEFINED";

  export type Accepted =
  {
    status: "ACCEPTED";
    characterMove: Move;
    serializedLoadLocation: SerializedEntity;
  }

  export type Rejected =
  {
    status: "REJECTED";
    problems: EnterGameRequest.Problems;
  }

  export type Result = Undefined | Accepted | Rejected;
}