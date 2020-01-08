/*
  Part of BrutusNEXT

  Login window
*/

import { Gui } from "../../../Client/Gui/Gui";
import { Body } from "../../../Client/Gui/Body";
import { CenteredTitledWindow } from
  "../../../Client/Gui/CenteredTitledWindow";

// export class LoginWindow extends FormWindow
export class LoginWindow extends CenteredTitledWindow
{
  constructor(parent: Body)
  {
    super(parent, "login_window", "&wWelcome to &gBrutus&GNext");

    this.visibility.set(Gui.State.LOGIN);
  }

// constructor()
// {
//   super({ windowParam: { name: 'login_window' }});

//   this.setTitle("&gWelcome to &RBrutus&YNext");

//   this.createLoginForm();
//   this.createEmptyLine();
//   this.createRegisterLink();

//   // Show this window when app is in this state.
//   this.flags.set(ClientApp.State.LOGIN);
// }

// --------------- Public accessors -------------------

// // ! Throws an exception on error.
// public getForm(): LoginForm
// {
//   if (!this.form)
//     throw new Error("Login form doesn't exist");

//   return this.form;
// }

// ----------------- Private data ---------------------

// private $registerLink: (JQuery | null) = null;

// ---------------- Protected data --------------------

// // ~ Overrides FormWindow.form.
// protected form: (LoginForm | null) = null;

// ---------------- Private methods -------------------

// private createLoginForm()
// {
//   if (this.form !== null)
//   {
//     ERROR("Login form already exists. Not creating it again");
//     return;
//   }

//   if (!this.$content)
//   {
//     ERROR("Failed to create form component in login window"
//       + " because $content element is missing");
//     return;
//   }

//   this.form = new LoginForm(this, { $parent: this.$content });
// }

// private createRegisterLink()
// {
//   let $parent = super.createTextContainer();

//   if (!$parent)
//   {
//     ERROR("Failed to create text container element."
//       + " It also means that $registerLink element"
//       + " won't be created");
//     return;
//   }

//   this.$createText({ $parent, text: "Don't have an account yet? " });

//   this.$registerLink = this.$createTextLink
//   (
//     {
//       $parent,
//       text: "Register",
//       click: (event: JQueryEventObject) => { this.onRegisterClick(event); }
//     }
//   );

//   this.$createText({ $parent, text: "." });
// }

// ---------------- Event handlers --------------------

// private onRegisterClick(event: JQueryEventObject)
// {
//   ClientApp.switchToState(ClientApp.State.REGISTER);
// }
}