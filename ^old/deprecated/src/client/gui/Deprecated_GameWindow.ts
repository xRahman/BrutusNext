/*
  Part of BrutusNEXT

  Abstract ancestor of game windows.
*/

// 'use strict';

// import {Utils} from '../../shared/lib/utils/Utils';
// import {TitledWindow} from '../../client/gui/TitledWindow';

// export class GameWindow extends TitledWindow
// {
//   protected static get TITLE_S_CSS_CLASS()
//     { return 'S_GameWindow_Title'; }

//   // -------------- Static class data -------------------

//   //----------------- Protected data --------------------

//   //------------------ Private data ---------------------

//   // --------------- Static accessors -------------------

//   // ---------------- Static methods --------------------

//   // --------------- Public accessors -------------------

//   // ---------------- Public methods --------------------

//   // ~ Overrides Window.create().
//   public create(param: Window.CreateParam = {})
//   {
//     Utils.applyDefaults
//     (
//       param,
//       {
//         windowCss:   { sClass: GameWindow.S_CSS_CLASS },
//         titleBarCss: { sClass: GameWindow.TITLE_BAR_S_CSS_CLASS },
//         titleCss:    { sClass: GameWindow.TITLE_S_CSS_CLASS }
//       }
//     );

//     super.create(param);
//   }

//   // --------------- Protected methods ------------------

//   // ---------------- Private methods -------------------

//   // ---------------- Event handlers --------------------

// }