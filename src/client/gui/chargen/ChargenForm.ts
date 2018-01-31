/*
  Part of BrutusNEXT

  Chargen form.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Connection} from '../../../client/lib/connection/Connection';
import {Component} from '../../../client/gui/Component';
import {Form} from '../../../client/gui/form/Form';
import {CharacterNameInput} from
  '../../../client/gui/chargen/CharacterNameInput';
import {ChargenWindow} from '../../../client/gui/chargen/ChargenWindow';
import {Request} from '../../../shared/lib/protocol/Request';
import {ChargenRequest} from '../../../shared/lib/protocol/ChargenRequest';
import {ChargenResponse} from '../../../client/lib/protocol/ChargenResponse';

export class ChargenForm extends Form
{
  constructor
  (
    protected parent: ChargenWindow,
    param: Component.FormParam = {}
  )
  {
    super
    (
      parent,
      Utils.applyDefaults(param, { name: 'chargen_form' })  
    );

    this.createCharacterNameInput();
    this.$createEmptyLine();
    this.createButtons();
  }

  // ----------------- Private data ---------------------

  private characterNameInput: (CharacterNameInput | null) = null;

  // ---------------- Public methods --------------------

  public displayProblem(response: ChargenResponse)
  {
    switch (response.result)
    {
      case ChargenResponse.Result.UNDEFINED:
        ERROR("Received chargen response with unspecified result."
          + " Someone problably forgot to set 'packet.result'"
          + " when sending chargen response from the server");
        break;

      case ChargenResponse.Result.CHARACTER_NAME_PROBLEM:
        this.displayCharacterNameProblem(response.getProblem());
        break;

      case ChargenResponse.Result.FAILED_TO_CREATE_CHARACTER:
        this.displayError(response.getProblem());
        break;

      case ChargenResponse.Result.OK:
        ERROR("displayProblem() called with 'Result: OK'");
        break;

      default:
        ERROR("Unknown register response result");
        break;
    }
  }

  // ~ Overrides Component.onShow().
  public onShow()
  {
    super.onShow();

    this.reset();
    this.enableSubmitButton();
    this.hideProblems();
    this.focusCharacterNameInput();
  }

  // --------------- Protected methods ------------------

  // ~ Overrides Form.createSubmitButton().
  protected $createSubmitButton(param: Component.SubmitButtonParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        text: 'Create Character',
        sCssClass: Form.LEFT_BUTTON_S_CSS_CLASS
      }
    );

    return super.$createSubmitButton(param);
  }

  // ~ Overrides Form.createRequest().
  // -> Returns 'null' if request couldn't be created
  //    or there is nothing to request yet.
  protected createRequest(): Request | null
  {
    if (!this.characterNameInput)
    {
      ERROR("Failed to create request because 'characterNameInput'"
        + " component is missing");
      return null;
    }

    let characterName = this.characterNameInput.getValue();

    if (!characterName)
      return null;

    let request = new ChargenRequest();

    request.characterName = characterName;

    return request;
  }

  // ~ Overrides Form.isRequestValid().
  protected isRequestValid(request: ChargenRequest)
  {
    let problem = request.checkCharacterName();

    if (problem)
    {
      /// FIXME: Hnusný side effect, tohle tu nemá co dělat.
      this.displayCharacterNameProblem(problem);
      return false;
    }

    return true;
  }

  // ~ Overrides Form.hideProblems();
  protected hideProblems()
  {
    super.hideProblems();

    if (!this.characterNameInput)
    {
      ERROR("Missing component 'characterNameInput'");
      return;
    }

    this.characterNameInput.hideProblem();
  }

  protected displayCharacterNameProblem(problem: string | null)
  {
    if (!this.characterNameInput)
    {
      ERROR("Missing component 'characterNameInput'");
      return;
    }

    if (problem)
      this.characterNameInput.displayProblem(problem);
  }

  // ---------------- Private methods -------------------

  private focusCharacterNameInput()
  {
    if (!this.characterNameInput)
    {
      ERROR("Invalid component 'characterNameInput'");
      return;
    }

    this.characterNameInput.focus();
  }

  private createCharacterNameInput()
  {
    if (this.characterNameInput)
    {
      ERROR("Character name input already exists. Not creating it again");
      return;
    }

    this.characterNameInput = new CharacterNameInput(this);
  }

  private createButtons()
  {
    let $parent = super.$createButtonContainer();

    if (!$parent)
    {
      ERROR("Failed to create button container");
      return;
    }

    this.$createSubmitButton({ $parent });
    this.$createCancelButton({ $parent });
  }

  private $createCancelButton(param: Component.ButtonParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        sCssClass: Form.RIGHT_BUTTON_S_CSS_CLASS,
        text: 'Cancel',
        click: (event: JQueryEventObject) => { this.onCancel(event); }
      }
    );

    return this.$createButton(param);
  }

  // ---------------- Event handlers --------------------

  private onCancel(event: JQueryEventObject)
  {
    this.parent.backToCharselect();
  }
}