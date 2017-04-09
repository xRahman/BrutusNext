/*
  Part of BrutusNEXT

  All classes that are dynamically loaded (basically all that
  are saved to or loaded from JSON) need to be listed here and
  their constructors added to init() function to be allow creating
  of their instances.
*/

export class ClassFactory
{
  // Key:   class name
  // Value: class constructor
  public static constructors = new Map<string, any>();

  public static registerClass<T>(Class: { new (...args: any[]): T })
  {
    ClassFactory.constructors.set(Class.name, Class);
  }
}
