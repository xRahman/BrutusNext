/*
  Part of BrutusNext

  Augments javascript Object type with utility functions
*/

import { Types } from "../../Shared/Utils/Types";

// We are augmenting global namespace.
declare global
{
  export interface Object
  {
    // Recursively copies properties from 'default' object.
    applyDefaults(defalt: object): void
  }
}

// Arrow functions can't be used to extend Number prototype
// because they capture global 'this' instead of the Number
// that we are extending. So we need to disable respective
// eslint rule.
/* eslint-disable @typescript-eslint/unbound-method */

Object.prototype.applyDefaults = function applyDefaults
(
  defaults: Types.Object
)
: void
{
  for (const propertyName in defaults)
  {
    if (!defaults.hasOwnProperty(propertyName))
      continue;

    const defaultValue = defaults[propertyName];
    const targetValue = (this as Types.Object)[propertyName];

    if (defaultValue === undefined)
      continue;

    if (targetValue === undefined)
    {
      (this as Types.Object)[propertyName] = defaultValue;
      continue;
    }

    const sourceIsPrimitiveType = Types.isPrimitiveType(defaultValue);
    const targetIsPrimitiveType = Types.isPrimitiveType(targetValue);

    if (!sourceIsPrimitiveType && !targetIsPrimitiveType)
      targetValue.applyDefaults(defaultValue);
  }
};

// Ensure this file is treated as a module.
export {};