/*
  Part of BrutusNEXT

  Chargen form.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {MudColors} from '../../../client/gui/MudColors';
import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Connection} from '../../../client/lib/connection/Connection';
import {Component} from '../../../client/gui/Component';
import {Form} from '../../../client/gui/form/Form';
import {ChargenRequest} from '../../../shared/lib/protocol/ChargenRequest';
import {ChargenResponse} from '../../../shared/lib/protocol/ChargenResponse';

export class ChargenForm extends Form
{
  // ----------------- Private data ---------------------

  private $characterNameInput: JQuery = null;
  private $characterNameProblem: JQuery = null;

  // ---------------- Public methods --------------------

  // ~ Overrides Form.create().
  public create(param: Component.FormParam = {})
  {
    Utils.applyDefaults(param, { name: 'chargen_form' });

    super.create(param);

    this.createLabel({ text: 'Character Name' });
    this.createCharacterNameInput();
    this.createNameProblemNotice();

    this.createEmptyLine();

    this.createButtons();
  }

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

  // ~ Overrides Form.onShow().
  public onShow()
  {
    super.onShow();

    this.resetForm();
    this.enableSubmitButton();
    this.hideProblems();
    this.focusCharacterNameInput();
  }

  // --------------- Protected methods ------------------

  // ~ Overrides Form.createSubmitButton().
  protected createSubmitButton(param: Component.SubmitButtonParam = {})
  {
    this.applyDefaults
    (
      param,
      {
        text: 'Create Character',
        sCssClass: Form.LEFT_BUTTON_S_CSS_CLASS
      }
    );

    return super.createSubmitButton(param);
  }

  // ~ Overrides Form.createRequest().
  protected createRequest()
  {
    let request = new ChargenRequest();

    request.characterName = this.$characterNameInput.val();

    return request;
  }

  // ~ Overrides Form.isRequestValid().
  protected isRequestValid(request: ChargenRequest)
  {
    let problem = null;

    if (problem = request.getCharacterNameProblem())
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

    // if (this.$characterNameProblem)
    //   this.$characterNameProblem.hide();

    if (this.$characterNameProblem)
    {
      this.createText
      (
        {
          $parent: this.$characterNameProblem,
          text: Component.EMPTY_LINE_TEXT,
          insertMode: Component.InsertMode.REPLACE
        }
      );
    }
  }

  protected createNameProblemNotice()
  {
    this.$characterNameProblem = this.createEmptyLine
    (
      { name: 'name_problem_notice'}
    );
  }

  protected displayCharacterNameProblem(problem: string)
  {
    if (!this.$characterNameProblem)
    {
      ERROR("Invalid $characterNameProblem element");
      return;
    }

    this.createText
    (
      {
        $parent: this.$characterNameProblem,
        text: MudColors.PROBLEM_TEXT_COLOR + problem,
        insertMode: Component.InsertMode.REPLACE
      }
    );

    this.$characterNameProblem.show();
    this.focusCharacterNameInput();
  }

  // ---------------- Private methods -------------------

  private focusCharacterNameInput()
  {
    if (!this.$characterNameInput)
    {
      ERROR("$characterNameInput doesn't exist so it won't be focused");
      return;
    }

    this.$characterNameInput.focus();
  }

  private createCharacterNameInput()
  {
    this.$characterNameInput = super.createTextInput
    (
      {
        name: 'character_name_input',
        placeholder: 'Enter Character Name',
        /// We are not letting browser to validate 'minLenght'
        /// because 'minLength' validation does't work anyways
        /// after setting value to the input element.
        ///minLength: ChargenRequest.MIN_CHARACTER_NAME_LENGTH,
        maxLength: ChargenRequest.MAX_CHARACTER_NAME_LENGTH,
        required: true,
        input: (event) => { this.onCharacterNameInput(event); }
      }
    );
  }

  private createButtons()
  {
    let $parent = super.createButtonContainer();

    this.createSubmitButton({ $parent });
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

    return this.createButton(param);
  }

  // Note that this is also enforced in
  // ChargenRequest.getInvalidCharacterProblem().
  private removeInvalidCharacters($element: JQuery)
  {
    let oldValue = $element.val();
    let newValue = "";
    let regexp = ChargenRequest.VALID_CHARACTERS_REGEXP;

    if (oldValue)
      newValue = oldValue.replace(regexp, '');

    $element.val(newValue);
  }

  private upperCaseFirstCharacter($element: JQuery)
  {
    let oldValue = $element.val();
    let newValue = "";

    if (oldValue)
      newValue = Utils.upperCaseFirstCharacter(oldValue);

    $element.val(newValue);

    $element.attr('valid', 'invalid');

    // let element = <any>$element[0];

    // element.setCustomValidity("Name is too short");
  }

  // ---------------- Event handlers --------------------

  // This handler is called whenever user types into
  // 'character name' input.
  private onCharacterNameInput(event: JQueryEventObject)
  {
    // Remember original selection (and cursor) position.
    let element = <HTMLInputElement>this.$characterNameInput[0];
    let selectionStart = element.selectionStart;
    let selectionEnd = element.selectionEnd;

    // Note: Setting value to an input element breaks automatic
    //   value validation on the browser (I didn't manage to find
    //   a true solution so I disabled validating 'minLenght' as
    //   a workaround).
    this.removeInvalidCharacters(this.$characterNameInput);
    this.upperCaseFirstCharacter(this.$characterNameInput);

    // Restore original selection (and cursor) position.
    element.setSelectionRange(selectionStart, selectionEnd);

    return true;
  }

  private onCancel(event: JQueryEventObject)
  {
    ClientApp.setState(ClientApp.State.CHARSELECT);
  }
}