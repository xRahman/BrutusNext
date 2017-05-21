export class NameList
{
  // ---------------- Public methods --------------------

  /// Deprecated
  // public async loadNamedEntity
  // (
  //   name: string,
  //   cathegory: NamedEntity.NameCathegory
  // )
  // {
  //   // First check if entity is already loaded in memory. 
  //   let entity = this.getEntityByName(name);

  //   // If it is already loaded, there is no point in loading it again.
  //   if (entity !== undefined)
  //   {
  //     if (entity === null)
  //     {
  //       ERROR("'null' found in entity list while attempting"
  //         + " to load named entity '" + name + "'. Entity is"
  //         + " not loaded");
  //       return null;
  //     }

  //     if (!entity.isValid())
  //     {
  //       ERROR("Attempt to load named entity '" + name + "'"
  //         + " which already exists but is not valid. This"
  //         + " can happen for example if you forget to update"
  //         + " removeFromLists() method, so when entity is"
  //         + " removed from Entities (and thus becomes"
  //         + " invalid), it is not removed from entity list."
  //         + " entity is not loaded");
  //       return null;
  //     }

  //     ERROR("Attempt to load named entity '" + name + "'"
  //       + " which already exists. Returning existing entity");
  //     return entity;
  //   }

  //   // Second parameter of loadNamedEntity is used for dynamic type cast.
  //   entity = await ServerApp.entityManager.loadNamedEntity
  //   (
  //     name,
  //     cathegory
  //   );

  //   if (!Entity.isValid(entity))
  //   {
  //     ERROR("Failed to load named entity '" + name + "'");
  //     return null;
  //   }

  //   if (name !== entity.getName())
  //   {
  //     ERROR("Entity name saved in file (" + entity.getName() + ")"
  //       + " doesn't match save file name (" + name + ")."
  //       + " Entity is not loaded");
  //       return null;
  //   }

  //   this.add(entity);

  //   return entity;
  // }
}