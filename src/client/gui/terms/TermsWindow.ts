/*
  Part of BrutusNEXT

  Terms window.
*/

'use strict';

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

  protected static get S_CSS_CLASS()
    { return 'S_TermsWindow'; }
  protected static get TERMS_S_CSS_CLASS()
    { return 'S_TermsWindow_Terms'; }

  // ---------------- Public methods --------------------

  // // ~ Overrides Window.create()
  // public create()
  // {
  //   super.create
  //   (
  //     {
  //       windowParam:
  //       {
  //         name: 'terms_window',
  //         sCssClass: TermsWindow.S_CSS_CLASS
  //       },
  //       contentParam:
  //       {
  //         sCssClass: TitledWindow.CONTENT_S_CSS_CLASS
  //       }
  //     }
  //   );

  //   this.setTitle("Terms of Use");

  //   this.createTermsText();
  //   this.createAcceptButton();
  // }

  // --------------- Protected methods ------------------

  // ---------------- Private methods -------------------

  private createTermsText()
  {
    /// TEST:
    let termsText = "Don't be a jerk, please.";
    
    this.createDiv
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
    return this.createButton
    (
      {
        $parent: this.$content,
        sCssClass: Component.FULL_WIDTH_BLOCK_S_CSS_CLASS,
        text: 'Accept',
        click: (event) => { this.onAcceptClick(event); }
      }
    );
  }

  // ---------------- Event handlers --------------------

  private onAcceptClick(event: JQueryEventObject)
  {
    console.log("Clicked on Accept button");
    ClientApp.setState(ClientApp.State.REGISTER);
  }
}