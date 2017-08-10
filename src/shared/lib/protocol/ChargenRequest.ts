/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Character creation request.
*/

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Packet} from '../../../shared/lib/protocol/Packet';
import {Classes} from '../../../shared/lib/class/Classes';

export class ChargenRequest extends Packet
{
  constructor()
  {
    super();

    this.version = 0;
  }

  public static get MIN_CHARACTER_NAME_LENGTH()
    { return  3;}
  public static get MAX_CHARACTER_NAME_LENGTH()
    { return  12;}

  // ----------------- Public data ----------------------

  public characterName: string = null;

  // ---------------- Public methods --------------------

  // -> Returns 'null' if character name is ok,
  //    othwrwise returns the first found reason why it's not.
  public getCharacterNameProblem()
  {
    let problem = null;

    if (!this.characterName)
      return "Character name must not be empty.";

    if (problem = this.getInvalidCharacterProblem())
      return problem;

    if (problem = this.getNameLengthProblem())
      return problem;

    return null;
  }

  public normalizeCharacterName()
  {
    // Uppercase the first character of 'characterName',
    // lowercase the rest.
    this.characterName = Utils.upperCaseFirstCharacter(this.characterName);
  }

  // ---------------- Private methods -------------------

  private getInvalidCharacterProblem()
  {
    let regExp = /[^A-Za-z]/;

    if (regExp.test(this.characterName))
      return "Character name can only contain english letters.";

    return null;
  }

  private getNameLengthProblem()
  {
    if (this.characterName.length < ChargenRequest.MIN_CHARACTER_NAME_LENGTH)
    {
      return "Character name must be at least"
        + " " + ChargenRequest.MIN_CHARACTER_NAME_LENGTH
        + " characters long.";
    }

    if (this.characterName.length > ChargenRequest.MAX_CHARACTER_NAME_LENGTH)
    {
      return "Character name cannot be longer than"
        + " " + ChargenRequest.MAX_CHARACTER_NAME_LENGTH
        + " characters.";
    }

    return null;
  }
}

Classes.registerSerializableClass(ChargenRequest);