/* ==================== Deprecated Code ===================== */

// export abstract class Component
// {
//   // Appends <spans> created from 'text' to html content of '$component'
//   // ('text' can contain mud color codes. It it doesn't and no 'baseColor'
//   //  is provided, text color of $component will be used).
//   protected static appendText
//   (
//     $component: JQuery,
//     text: string,
//     baseColor = null
//   )
//   {
//     $component.append
//     (
//       MudColors.htmlize(text, baseColor)
//     );

//     // if (text.indexOf('&') !== -1)
//     // {
//     //   $component.append
//     //   (
//     //     MudColors.htmlize(text, baseColor)
//     //   );
//     // }
//     // else
//     // {
//     //   // let $span = $(document.createElement('span'))

//     //   // $span.text(text);
//     //   // $component.append($span);

//     //   /// TODO: Použít baseColor, pokud není null.
//     //   /// TODO: Nevolat createSpan, vyrobit ho na přímo (zaremovaným
//     //   ///  kódem o kus výš).
//     //   Component.createSpan
//     //   (
//     //     text,
//     //     {
//     //       $container: $component
//     //     }
//     //   )
//     // }

//     // /// Tohle se nejspíš nepoužívá (svg elementy se vyrábí přes knihovnu d3).
//     // protected static createSvg(id: string, gCssClass, sCssClass: string): JQuery
//     // {
//     //   let element = document.createElement('svg');

//     //   return this.initElement(element, $container, id, gCssClass, sCssClass);
//     // }

//     /// Not used anymore.
//   // protected static createSpan
//   // (
//   //   text: string = null,
//   //   {
//   //     $container = null,
//   //     gCssClass = Component.NO_GRAPHICS_G_CSS_CLASS,
//   //     sCssClass = null
//   //   }:
//   //   {
//   //     $container?: JQuery;
//   //     gCssClass?: string;
//   //     sCssClass?: string;
//   //   }
//   //   = {}
//   // )
//   // : JQuery
//   // {
//   //   let $element = $(document.createElement('span'));

//   //   this.initElement($element, $container, gCssClass, sCssClass);

//   //   if (text !== null)
//   //     this.setText($element, text);

//   //   return $element;
//   // }

//   /// Deprecated. Use Component.setTextLink() instead.
//   // // Generic clickable text link
//   // // (note that it's <button>, not <a href=...>).
//   // protected static createTextLink
//   // (
//   //   {
//   //     $container = null,
//   //     gCssClass = Component.LINK_TEXT_G_CSS_CLASS,
//   //     sCssClass = null,
//   //     text = null
//   //   }:
//   //   {
//   //     $container?: JQuery;
//   //     gCssClass?: string;
//   //     sCssClass?: string;
//   //     text: string;
//   //   },
//   //   param: Component.ButtonParam = null
//   // )
//   // : JQuery
//   // {
//   //   // Use <button> instead of <a href=...> because we
//   //   // are going to handle the clicks ourselves.
//   //   return this.createButton
//   //   (
//   //     {
//   //       $container,
//   //       gCssClass,
//   //       sCssClass,
//   //       text
//   //     },
//   //     param
//   //   );
//   // }

//   /// Ve skutečnosti asi vůbec nechci používat href, ale button bez grafiky...
//   /// 
//   // protected static createHref
//   // (
//   //   id: string,
//   //   gCssClass: string,
//   //   sCssClass: string
//   // )
//   // : JQuery
//   // {
//   //   let element = document.createElement('a');

//   //   return this.initElement(element, $container, id, gCssClass, sCssClass);
//   // }

//   /// Deprecated. Use Component.setText() instead.
//   // Generic non-clickable text.
//   // protected static createText
//   // (
//   //   {
//   //     $container = null,
//   //     gCssClass = Component.NO_GRAPHICS_G_CSS_CLASS,
//   //     sCssClass = null,
//   //     text = null
//   //   }:
//   //   {
//   //     $container?: JQuery;
//   //     gCssClass?: string;
//   //     sCssClass?: string;
//   //     text: string;
//   //   }
//   // )
//   // : JQuery
//   // {
//   //   let $text = this.createSpan
//   //   (
//   //     {
//   //       $container,
//   //       gCssClass,
//   //       sCssClass
//   //     }
//   //   );

//   //   $text.text(text);

//   //   return $text;
//   // }
//   }

//   // // Applies values of 'attributes' to input element.
//   // private static applyInputAttributes
//   // (
//   //   $element: JQuery,
//   //   attributes: Component.InputAttributes
//   // )
//   // {
//   //   if (!$element || !attributes)
//   //     return;

//   //   if (attributes.required !== undefined)
//   //     $element.prop('required', attributes.required);

//   //   if (attributes.placeholder !== undefined)
//   //     $element.attr('placeholder', attributes.placeholder);

//   //   if (attributes.readonly !== undefined)
//   //     $element.prop('readOnly', attributes.readonly);

//   //   if (attributes.disabled !== undefined)
//   //     this.setDisabled($element, attributes.disabled);

//   //   if (attributes.size !== undefined)
//   //     $element.attr('size', attributes.size);

//   //   if (attributes.maxLength !== undefined)
//   //     $element.attr('maxLength', attributes.maxLength);

//   //   if (attributes.minLength !== undefined)
//   //     $element.attr('minLength', attributes.minLength);

//   //   if (attributes.autocomplete !== undefined)
//   //     $element.attr('autocomplete', attributes.autocomplete);

//   //   if (attributes.spellcheck !== undefined)
//   //     $element.prop('spellcheck', attributes.spellcheck);

//   //   if (attributes.checked !== undefined)
//   //     $element.prop('checked', attributes.checked);

//   //   // Apparently 'autocapitalize' only works for virtual keybords at the
//   //   // moment in Chrome (and doesn't work in other browsers except Safari
//   //   // at all) so it's useless right now.
//   //   /// if (attributes.autocapitalize !== undefined)
//   //   ///   element.setAttribute('autocapitalize', attributes.autocapitalize);

//   //   if (attributes.autocorrect !== undefined)
//   //     $element.attr('autocorrect', attributes.autocorrect);

//   //   // // Standard attributes.

//   //   // if (attributes.required !== undefined)
//   //   //   element.required = attributes.required;

//   //   // if (attributes.placeholder !== undefined)
//   //   //   element.placeholder = attributes.placeholder;

//   //   // if (attributes.readonly !== undefined)
//   //   //   element.readOnly = attributes.readonly;

//   //   // // if (attributes.disabled !== undefined)
//   //   // //   element.disabled = attributes.disabled;

//   //   // if (attributes.size !== undefined)
//   //   //   element.size = attributes.size;

//   //   // if (attributes.maxLength !== undefined)
//   //   //   element.maxLength = attributes.maxLength;

//   //   // if (attributes.minLength !== undefined)
//   //   //   element.minLength = attributes.minLength;

//   //   // if (attributes.autocomplete !== undefined)
//   //   //   element.autocomplete = attributes.autocomplete;

//   //   // if (attributes.spellcheck !== undefined)
//   //   //   element.spellcheck = attributes.spellcheck;

//   //   // if (attributes.checked !== undefined)
//   //   //   element.checked = attributes.checked

//   //   // // Nonstandard attributes (so they can't be simply assigned
//   //   // // and must byt set using setAttribute()).

//   //   // // Apparently 'autocapitalize' only works for virtual keybords at the
//   //   // // moment in Chrome (and doesn't work in other browsers except Safari
//   //   // // at all) so it's useless right now.
//   //   // /// if (attributes.autocapitalize !== undefined)
//   //   // ///   element.setAttribute('autocapitalize', attributes.autocapitalize);

//   //   // if (attributes.autocorrect !== undefined)
//   //   //   element.setAttribute('autocorrect', attributes.autocorrect);
//   // }

//   // private static applyButtonAttributes
//   // (
//   //   $element: JQuery,
//   //   attributes: Component.ButtonAttributes
//   // )
//   // {
//   //   if (!$element || !attributes)
//   //     return;

//   //   // Note that there is difference between attribute 'disabled'
//   //   // and property 'disabled'. Attribute 'disabled' only specifies
//   //   // initial value of 'disabled' property of the element, property
//   //   // 'disabled' reflects actual state of the element.
//   //   if (attributes && attributes.disabled !== undefined)
//   //     this.setDisabled($element, attributes.disabled);
//   // }

//   // private static applyTextAreaAttributes
//   // (
//   //   $element: JQuery,
//   //   attributes: Component.TextAreaAttributes
//   // )
//   // {
//   //   if (!$element || !attributes)
//   //     return;

//   //   if (attributes && attributes.rows)
//   //     $element.attr('rows', attributes.rows);

//   //   if (attributes.spellcheck !== undefined)
//   //     $element.prop('spellcheck', attributes.spellcheck);

//   //   // Nonstandard attributes (so they can't be simply assigned
//   //   // and must byt set using setAttribute()).

//   //   if (attributes.autocorrect !== undefined)
//   //     $element.attr('autocorrect', attributes.autocorrect);

//   //   // if (attributes && attributes.rows)
//   //   //   element.rows = attributes.rows;

//   //   // if (attributes.spellcheck !== undefined)
//   //   //   element.spellcheck = attributes.spellcheck;

//   //   // // Nonstandard attributes (so they can't be simply assigned
//   //   // // and must byt set using setAttribute()).

//   //   // if (attributes.autocorrect !== undefined)
//   //   //   element.setAttribute('autocorrect', attributes.autocorrect);
//   // }
// }