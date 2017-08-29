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
import {ChargenRequest} from '../../../shared/lib/protocol/ChargenRequest';
import {ChargenResponse} from '../../../shared/lib/protocol/ChargenResponse';

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
    this.createEmptyLine();
    this.createButtons();
  }

  // ----------------- Private data ---------------------

  private characterNameInput: CharacterNameInput = null;

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
  protected createRequest()
  {
    let request = new ChargenRequest();

    request.characterName = this.characterNameInput.getValue();

    return request;
  }

  // ~ Overrides Form.isRequestValid().
  protected isRequestValid(request: ChargenRequest)
  {
    let problem = request.getCharacterNameProblem();

    if (problem)
    {
      this.displayCharacterNameProblem(problem);
      return false;
    }

    return true;
  }

  // ~ Overrides Form.hideProblems();
  protected hideProblems()
  {
    super.hideProblems();

    this.characterNameInput.hideProblem();
  }

  protected displayCharacterNameProblem(problem: string)
  {
    this.characterNameInput.displayProblem(problem);
  }

  // ---------------- Private methods -------------------

  private focusCharacterNameInput()
  {
    this.characterNameInput.focus();
  }

  private createCharacterNameInput()
  {
    this.characterNameInput = new CharacterNameInput(this);
  }

  private createButtons()
  {
    let $parent = super.createButtonContainer();

    this.$createSubmitButton({ $parent });
    this.createCancelButton({ $parent });
  }

  private createCancelButton(param: Component.ButtonParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        sCssClass: Form.RIGHT_BUTTON_S_CSS_CLASS,
        text: 'Cancel',
        click: (event) => { this.onCancel(event); }
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