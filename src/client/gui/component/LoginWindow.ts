/*
  Part of BrutusNEXT

  Input of login credentials.
*/

'use strict';

import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Window} from '../../../client/gui/component/Window';

import $ = require('jquery');

export class LoginWindow extends Window
{
  /*
  constructor()
  {
    super();
  }
  */

  protected static get CSS_CLASS() { return 'LoginWindow'; }
  protected static get CONTENT_CSS_CLASS() { return 'LoginWindowContent'; }
  protected static get LABEL_CSS_CLASS() { return 'LoginWindowLabel'; }
  protected static get INPUT_CSS_CLASS() { return 'LoginWindowInput'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  // 'id' parameter of html element
  // (overrides Component.id).
  protected id = 'loginwindow';

  //------------------ Private data ---------------------

  ///private input = new ScrollWindowInput(this);
  ///public output = new ScrollWindowOutput();

  private $accountNameInput = null;
  private $passwordInput = null;

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  public getAccountNameInputId() { return this.id + '_accname'; }
  public getPasswordInputId() { return this.id + '_password'; }

  // ---------------- Public methods --------------------

  // -> Returns created jquery element.
  public create()
  {
    super.create();

    // LoginWindow uses css class .LoginWindow along with .Window.
    this.$window.addClass(LoginWindow.CSS_CLASS);

    // Login Window doesn't have a title bar.
    this.$titleBar.hide();

    return this.$window;
  }

  // --------------- Protected methods ------------------

  // --- Element-generating methods ---

  // ~ Overrides Window.createContent().
  // -> Returns created html element.
  protected createContent()
  {
    let $content = super.createContent();

    $content.addClass(LoginWindow.CONTENT_CSS_CLASS);

    this.appendLabel($content, 'accountname', 'Account Name');
    this.appendTextInput($content, 'Enter Account Name');
    this.appendLabel($content, 'password', 'Password');
    this.appendPasswordInput($content, 'Enter Password');

    return $content;
  }

  // ---------------- Private methods -------------------

  private appendLabel($content: JQuery, id: string, text: string)
  {
    let $label = this.createLabel
    (
      id + '_label',
      LoginWindow.LABEL_CSS_CLASS
    );
    $label.text(text);
    $content.append($label);
  }

  private appendTextInput($content: JQuery, text: string)
  {
    this.$accountNameInput = this.createTextInput
    (
      'accountname_input',
      LoginWindow.INPUT_CSS_CLASS
    );
    this.$accountNameInput.attr('required', true);
    this.$accountNameInput.attr('placeholder', text);
    $content.append(this.$accountNameInput);
  }

  private appendPasswordInput($content: JQuery, text: string)
  {
    this.$passwordInput = this.createPasswordInput
    (
      'password_input',
      LoginWindow.INPUT_CSS_CLASS
    );
    this.$passwordInput.attr('required', true);
    this.$passwordInput.attr('placeholder', text);
    $content.append(this.$passwordInput);
  }

  // ---------------- Event handlers --------------------

}