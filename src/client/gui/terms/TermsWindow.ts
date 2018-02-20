/*
  Part of BrutusNEXT

  Terms window.
*/

'use strict';

import {ERROR} from '../../../shared/lib/error/ERROR';
import {Utils} from '../../../shared/lib/utils/Utils';
import {ClientApp} from '../../../client/lib/app/ClientApp';
import {Component} from '../../../client/gui/Component';
import {TitledWindow} from '../../../client/gui/window/TitledWindow';
import {StandaloneWindow} from '../../../client/gui/window/StandaloneWindow';

export class TermsWindow extends StandaloneWindow
{
  constructor()
  {
    super
    (
      {
        windowParam:
        {
          name: 'terms_window',
          sCssClass: TermsWindow.S_CSS_CLASS
        },
        contentParam:
        {
          sCssClass: TitledWindow.CONTENT_S_CSS_CLASS
        }
      }
    );

    this.setTitle("Terms of Use");

    this.createTermsText();
    this.createAcceptButton();

    // Show this window when app is in this state.
    this.flags.set(ClientApp.State.TERMS);
  }

  // -------------- Static class data -------------------

  protected static get S_CSS_CLASS()
    { return 'S_TermsWindow'; }
  protected static get TERMS_S_CSS_CLASS()
    { return 'S_TermsWindow_Terms'; }

  // ---------------- Private methods -------------------

  private createTermsText()
  {
    /// TEST:
    let termsText = "Don't be a jerk, please.";

    if (this.$content === null)
    {
      ERROR("Unexpected 'null' value");
      return false;
    }
    
    this.$createDiv
    (
      {
        text: termsText,
        $parent: this.$content,
        sCssClass: TermsWindow.TERMS_S_CSS_CLASS
      }
    );
  }

  private createAcceptButton()
  {
    if (this.$content === null)
    {
      ERROR("Unexpected 'null' value");
      return null;
    }

    return this.$createButton
    (
      {
        $parent: this.$content,
        sCssClass: Component.FULL_WIDTH_BLOCK_S_CSS_CLASS,
        text: 'Accept',
        click: (event: JQueryEventObject) => { this.onAcceptClick(event); }
      }
    );
  }

  private backToRegister()
  {
    ClientApp.setState(ClientApp.State.REGISTER);
  }

  // ---------------- Event handlers --------------------

  private onAcceptClick(event: JQueryEventObject)
  {
    this.backToRegister();
  }

    // ~ Overrides StandaloneWindow.onKeyDown().
  // Handles 'keydown' event fired on html document
  // (it means that this handler runs even if this
  //  window desn't have focus).
  public onKeyDown(event: JQueryEventObject)
  {
    let key = event.which;

    switch (key)
    {
      case 13:  // 'Enter'
      case 27:  // 'Escape'
        this.backToRegister();
        break;
    }
  }
}