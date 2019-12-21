/*
  Part of BrutusNext

  Object-related utility functions.
*/

import { Types } from "../../Shared/Utils/Types";

// Recursively copies properties of 'defaults' object to 'target' object.
export function applyDefaults(target: object, defaults: object): void
{
  for (const propertyName in defaults)
  {
    if (!defaults.hasOwnProperty(propertyName))
      continue;

    const defaultValue = defaults[propertyName];
    const targetValue = target[propertyName];

    if (defaultValue === undefined)
      continue;

    if (targetValue === undefined)
    {
      target[propertyName] = defaultValue;
      continue;
    }

    const sourceIsPrimitiveType = Types.isPrimitiveType(defaultValue);
    const targetIsPrimitiveType = Types.isPrimitiveType(targetValue);

    if (!sourceIsPrimitiveType && !targetIsPrimitiveType)
    {
      applyDefaults(targetValue, defaultValue);
    }
  }
}