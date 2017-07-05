/*
  Part of BrutusNEXT

  Abstract ancestor of component containing a form.
*/

'use strict';

import {Component} from '../../client/gui/Component';

import $ = require('jquery');

export abstract class Form extends Component
{
  protected static get S_CSS_CLASS()
    { return 'S_Form'; }
  protected static get LABEL_S_CSS_CLASS()
    { return 'S_Form_Label'; }
  protected static get LABEL_CONTAINER_S_CSS_CLASS()
    { return 'S_Form_LabelContainer'; }
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

  protected $form = null;

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
  )
  {
    this.$form = Component.createForm
    (
      {
        $container,
        gCssClass,
        sCssClass,
        name
      }
    );

    // Register 'submit' event handler.
    this.$form.submit
    (
      (event: Event) => { this.onSubmit(event); }
    );
  }

  protected createLabel
  (
    {
      text,
      sCssClass = Form.LABEL_S_CSS_CLASS
    }:
    {
      text?: string;
      sCssClass?: string;
    }
  )
  {
    let $container = Component.createDiv
    (
      {
        $container: this.$form,
        sCssClass: Form.LABEL_CONTAINER_S_CSS_CLASS
      }
    );

    return Component.createLabel
    (
      {
        $container: $container,
        gCssClass: Component.NO_GRAPHICS_G_CSS_CLASS,
        sCssClass: sCssClass,
        text: text
      }
    );
  }

  protected createTextInput
  (
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
  )
  {
    return Component.createTextInput
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
        /// Doesn't work in browsers yet
        /// (account names should be case insensitive anyways).
        /// autocapitalize: 'words',
        autocorrect: 'off',
        // 'autocomplete' value could be 'username' for LoginForm but
        //  we have 'remember me' option so there is no need for it.
        autocomplete: 'off',
        spellcheck: false
      }
    );
  }

  protected createPasswordInput
  (
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
  )
  {
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
  }

  protected createEmailInput
  (
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
  )
  {
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
  }

  protected createCheckboxInput
  (
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
      container_sCssClass?: string;
      label_sCssClass?: string;
      checkbox_sCssClass?: string;
    }
  )
  {
    let $container = Component.createDiv
    (
      {
        $container: this.$form,
        sCssClass: Form.LABEL_CONTAINER_S_CSS_CLASS
      }
    );

    let $label = Component.createLabel
    (
      {
        $container: $container,
        sCssClass: label_sCssClass,
        text: null  // No text yet because we want checkbox to be first.
      }
    );

    let $checkbox = Component.createCheckboxInput
    (
      {
        $container: $label,
        sCssClass: checkbox_sCssClass,
        name: name,
      },
      {
        checked: checked
      }
    );

    // Use append() because text() would delete the checkbox.
    $label.append(text);

    return $checkbox;
  }

  protected createButtonContainer
  (
    {
      sCssClass = Form.BUTTON_CONTAINER_S_CSS_CLASS
    }:
    {
      sCssClass?: string;
    }
    = {}
  )
  {
    return Component.createDiv
    (
      {
        $container: this.$form,
        sCssClass: sCssClass
      }
    );
  }

  protected createSubmitButton
  (
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
  )
  {
    return Component.createSubmitButton
    (
      {
        $container: $container,
        sCssClass: sCssClass,
        name: 'submit_button',
        text: text
      }
    );
  }

  /// To be deleted.
  /*
  protected createEmptyLine
  (
    {
      sCssClass = Form.EMPTY_LINE_S_CSS_CLASS
    }:
    {
      sCssClass?: string;
    }
    = {}
  )
  {
    return Component.createDiv
    (
      {
        $container: this.$form,
        sCssClass: sCssClass
      }
    );
  }
  */

  // ---------------- Private methods -------------------

  // ---------------- Event handlers --------------------

  protected abstract onSubmit(event: Event);
}