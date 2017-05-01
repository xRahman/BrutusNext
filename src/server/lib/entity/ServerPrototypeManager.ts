/*
  Part of BrutusNEXT

  Contains references to hardcoded prototype entities
  (which are the roots of prototype trees).
*/

'use strict';


export class PrototypeManager extends SharedPrototypeManager
{
  // Creates root prototype entities if they don't exist yet or loads
  // them from disk. Then recursively loads all prototype entities
  // inherited from them.
  public async initPrototypes(hardcodedEntityClasses: Array<string>)
  {
    await this.initRootPrototypes();

    await this.loadDescendantPrototypes();
  }

  private async initRootPrototypes(hardcodedEntityClasses: Array<string>)
  {
    for (let className of hardcodedEntityClasses)
    {
      /// TODO: Check if entity 'className' exists (check if such
      /// nameLockFile exists).

      /// TODO: Create new entity based on entity with id 'className'
      // if it doesn't exist.

      /// TODO: Load it from file if it does exist.

      /// TODO: Add the prototype entity to this
    }
  }

  private async loadDescendantPrototypes()
  {
    /// TODO: Recursively load descendantPrototypes of all
    /// root prototypes.
  }
}