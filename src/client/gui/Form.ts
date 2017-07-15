/*
  Part of BrutusNEXT

  Abstract ancestor of component containing a form.
*/

'use strict';

import {Utils} from '../../shared/lib/utils/Utils';
import {Component} from '../../client/gui/Component';

import $ = require('jquery');

export abstract class Form extends Component
{
  protected static get S_CSS_CLASS()
    { return 'S_Form'; }
  protected static get TEXT_S_CSS_CLASS()
    { return 'S_Form_Text'; }
  // protected static get LABEL_CONTAINER_S_CSS_CLASS()
  //   { return 'S_Form_LabelContainer'; }
  protected static get INPUT_S_CSS_CLASS()
    { return 'S_Form_Input'; }
  protected static get CHECKBOX_S_CSS_CLASS()
    { return 'S_Form_Checkbox'; }
  // protected static get CHECKBOX_CONTAINER_S_CSS_CLASS()
  //   { return 'S_Form_CheckboxContainer'; }
  protected static  get BUTTON_CONTAINER_S_CSS_CLASS()
    { return 'S_Form_ButtonContainer'; }
  /// To be deleted.
  // protected static get EMPTY_LINE_S_CSS_CLASS()
  //   { return 'S_Form_EmptyLine'; }

  // -------------- Static class data -------------------

  //----------------- Protected data --------------------

  protected $form: JQuery = null;
  protected $submitButton: JQuery = null;

  //------------------ Private data ---------------------

  // --------------- Static accessors -------------------

  // ---------------- Static methods --------------------

  // --------------- Public accessors -------------------

  // ---------------- Public methods --------------------

  public onShow() {}
  public onHide() {}

  // --------------- Protected methods ------------------

  protected create
  (
    param: Component.FormParam
    /*
    {
      $container = null,
      name,
      gCssClass,
      sCssClass = Form.S_CSS_CLASS
    }:
    {
      $container: JQuery;
      name: string;
      gCssClass?: string;
      sCssClass?: string;
    }
    */
  )
  {
    Utils.applyDefaults
    (
      param,
      {
        sCssClass: Form.S_CSS_CLASS
      }
    );

    this.$form = this.createForm(param);

    // Register 'submit' event handler.
    this.$form.submit
    (
      (event: Event) => { this.onSubmit(event); }
    );
  }

  protected createLabel
  (
    param: Component.LabelParam = {}
    /*
    {
      text,
      sCssClass = Form.LABEL_S_CSS_CLASS
    }:
    {
      text?: string;
      sCssClass?: string;
    }
    */
  )
  {
    Utils.applyDefaults
    (
      param,
      {
        $parent: this.$form,
        sCssClass: Form.TEXT_S_CSS_CLASS
      }
    );

    return super.createLabel(param);
  }

  protected createTextInput
  (
    param: Component.TextInputParam = {}
    /*
    {
      name,
      placeholder,
      minLength,
      maxLength,
      sCssClass = Form.INPUT_S_CSS_CLASS,
      gCssClass = Component.INPUT_G_CSS_CLASS
    }:
    {
      name: string;
      placeholder: string;
      minLength: number;
      maxLength: number;
      sCssClass?: string;
      gCssClass?: string;
    }
    */
  )
  {
    Utils.applyDefaults
    (
      param,
      {
        $parent: this.$form,
        sCssClass: Form.INPUT_S_CSS_CLASS,
        autocorrect: Component.Autocorrect.OFF,
        autocomplete: Component.Autocomplete.OFF,
        spellcheck: false
      }
    );

    return super.createTextInput(param);

    // return Component.createTextInput
    // (
    //   {
    //     $container: this.$form,
    //     sCssClass: sCssClass,
    //     gCssClass: gCssClass,
    //     name: name,
    //   },
    //   {
    //     required: true,
    //     placeholder: placeholder,
    //     minLength: minLength,
    //     maxLength: maxLength,
    //     /// Doesn't work in browsers yet
    //     /// (account names should be case insensitive anyways).
    //     /// autocapitalize: 'words',
    //     autocorrect: 'off',
    //     // 'autocomplete' value could be 'username' for LoginForm but
    //     //  we have 'remember me' option so there is no need for it.
    //     autocomplete: 'off',
    //     spellcheck: false
    //   }
    // );
  }

  protected createPasswordInput
  (
    param: Component.PasswordInputParam = {}
    /*
    {
      name,
      placeholder,
      minLength,
      maxLength,
      sCssClass = Form.INPUT_S_CSS_CLASS,
      gCssClass = Component.INPUT_G_CSS_CLASS
    }:
    {
      name: string;
      placeholder: string;
      minLength: number;
      maxLength: number;
      sCssClass?: string;
      gCssClass?: string;
    }
    */
  )
  {
    Utils.applyDefaults
    (
      param,
      {
        $parent: this.$form,
        sCssClass: Form.INPUT_S_CSS_CLASS,
        required: true,
        autocorrect: Component.Autocorrect.OFF,
        autocomplete: Component.Autocomplete.OFF,
        spellcheck: false
      }
    );

    return super.createPasswordInput(param);
    /*
    return Component.createPasswordInput
    (
      {
        $container: this.$form,
        sCssClass: sCssClass,
        gCssClass: gCssClass,
        name: name,
      },
      {
        required: true,
        placeholder: placeholder,
        minLength: minLength,
        maxLength: maxLength,
        autocorrect: 'off',
        autocomplete: 'off',
        spellcheck: false
      }
    );
    */
  }

  protected createEmailInput
  (
    param: Component.EmailInputParam = {}
    /*
    {
      name,
      placeholder,
      sCssClass = Form.INPUT_S_CSS_CLASS
    }:
    {
      name: string;
      placeholder: string;
      sCssClass?: string;
    }
    */
  )
  {
    Utils.applyDefaults
    (
      param,
      ///<Component.PasswordInputParam>
      {
        $parent: this.$form,
        sCssClass: Form.INPUT_S_CSS_CLASS,
        required: true,
        autocorrect: Component.Autocorrect.OFF,
        // 'autocomplete' value could be 'email' but we have
        // 'remember me' option so there is no need for it.
        autocomplete: Component.Autocomplete.OFF,
        spellcheck: false
      }
    );

    return super.createEmailInput(param);
    /*
    return Component.createEmailInput
    (
      {
        $container: this.$form,
        sCssClass: sCssClass,
        name: name
      },
      {
        required: true,
        placeholder: placeholder,
        autocorrect: 'off',
        // 'autocomplete' value could be 'email' but user only needs
        // to type email once when creating an account so I'll leave
        // it off.
        autocomplete: 'off',
        spellcheck: false
      }
    );
    */
  }

  protected createCheckbox
  (
    checkboxParam: Component.CheckboxInputParam,
    labelParam: Component.LabelParam = {}
    /*
    {
      name,
      text,
      checked,
      ///container_sCssClass = Form.CHECKBOX_CONTAINER_S_CSS_CLASS,
      label_sCssClass = Form.LABEL_S_CSS_CLASS,
      checkbox_sCssClass = Form.CHECKBOX_S_CSS_CLASS
    }:
    {
      name: string;
      text: string;
      checked: boolean;
      ///container_sCssClass?: string;
      label_sCssClass?: string;
      checkbox_sCssClass?: string;
    }
    */
  )
  {
    Utils.applyDefaults
    (
      checkboxParam,
      { sCssClass: Form.CHECKBOX_S_CSS_CLASS }
    );

    Utils.applyDefaults
    (
      labelParam,
      {
        $parent: this.$form,
        sCssClass: Form.TEXT_S_CSS_CLASS
      }
    );

    // Put checkbox inside a label so mouse clicks
    // on label text will toggle the checkbox.
    checkboxParam.$parent = this.createLabel(labelParam);

    // We want checkbox to be placed before the text.
    checkboxParam.insertMode = Component.InsertMode.PREPEND;

    return this.createCheckboxInput(checkboxParam);

    // /*
    // let $container = Component.createDiv
    // (
    //   {
    //     $container: this.$form,
    //     //sCssClass: Form.LABEL_CONTAINER_S_CSS_CLASS
    //     sCssClass: Form.LABEL_S_CSS_CLASS
    //   }
    // );
    // */

    // let $label = Component.createLabel
    // (
    //   {
    //     $container: this.$form,
    //     sCssClass: label_sCssClass,
    //     text: null  // No text yet because we want checkbox to be first.
    //   }
    // );

    // let $checkbox = Component.createCheckboxInput
    // (
    //   {
    //     $container: $label,
    //     sCssClass: checkbox_sCssClass,
    //     name: name,
    //   },
    //   {
    //     checked: checked
    //   }
    // );

    // // Use appendText() because setText() would delete the checkbox.
    // Component.appendText($label, text);

    // return $checkbox;
  }

  protected createButtonContainer
  (
    param: Component.DivParam = {}
    /*
    {
      sCssClass = Form.BUTTON_CONTAINER_S_CSS_CLASS
    }:
    {
      sCssClass?: string;
    }
    = {}
    */
  )
  {
    Utils.applyDefaults
    (
      param,
      {
        $parent: this.$form,
        sCssClass: Form.BUTTON_CONTAINER_S_CSS_CLASS
      }
    );

    return this.createDiv(param);
  }

  protected createSubmitButton
  (
    param: Component.SubmitButtonParam = {}
    /*
    {
      $container,
      text,
      sCssClass = Component.FULL_WIDTH_BUTTON_S_CSS_CLASS
    }:
    {
      $container: JQuery;
      text: string;
      sCssClass?: string;
    }
    */
  )
  {
    Utils.applyDefaults
    (
      param,
      {
        sCssClass: Component.FULL_WIDTH_BLOCK_S_CSS_CLASS
      }
    );

    this.$submitButton = super.createSubmitButton(param);

    return this.$submitButton;
  }

  protected createEmptyLine(param: Component.DivParam = {})
  {
    Utils.applyDefaults
    (
      param,
      {
        $parent: this.$form,
        sCssClass: Form.TEXT_S_CSS_CLASS
      }
    );

    return super.createEmptyLine(param);
  }

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------

  protected abstract onSubmit(event: Event);
}