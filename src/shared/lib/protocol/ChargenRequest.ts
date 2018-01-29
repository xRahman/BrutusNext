/*
  Part of BrutusNEXT

  Part of client-server communication protocol.

  Character creation request.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {Request} from '../../../shared/lib/protocol/Request';
import {Classes} from '../../../shared/lib/class/Classes';

export class ChargenRequest extends Request
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

  public static get VALID_CHARACTERS_REGEXP()
    { return /[^A-Za-z]/gi; }

  // ----------------- Public data ----------------------

  public characterName: (string | null) = null;

  // ---------------- Public methods --------------------

  // -> Returns 'null' if character name is ok,
  //    othwrwise returns the first found reason why it's not.
  public getCharacterNameProblem()
  {
    let problem: (string | null) = null;

    if (!this.characterName)
      return "Name must not be empty.";

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

  // Note that this is also enforced in
  // ChargenForm.removeInvalidCharacters().
  private getInvalidCharacterProblem()
  {
    let regExp = ChargenRequest.VALID_CHARACTERS_REGEXP;

    if (regExp.test(this.characterName))
      return "Name can only contain english letters.";

    return null;
  }

  private getNameLengthProblem()
  {
    if (this.characterName.length < ChargenRequest.MIN_CHARACTER_NAME_LENGTH)
    {
      return "Name must be at least"
        + " " + ChargenRequest.MIN_CHARACTER_NAME_LENGTH
        + " characters long.";
    }

    if (this.characterName.length > ChargenRequest.MAX_CHARACTER_NAME_LENGTH)
    {
      return "Name cannot be longer than"
        + " " + ChargenRequest.MAX_CHARACTER_NAME_LENGTH
        + " characters.";
    }

    return null;
  }
}

Classes.registerSerializableClass(ChargenRequest);