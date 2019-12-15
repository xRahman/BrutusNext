/*
  Part of BrutusNext

  FastPriotityQueue wrapper
*/

import { Serializable } from "../../Shared/Class/Serializable";

// 3rd party modules.
import { TypedPriorityQueue } from "typedpriorityqueue";

export class PriorityQueue<T> extends Serializable
{
  // TODO: Konstruktor TypedPriorityQueue musí dostat porovnávací
  // funkci. Ta by asi měla bejt přímo na tom, co se do fronty dává
  // (když do ní budu dávat například akce, tak Action by měla mít
  //  property 'timestamp' a metodu 'comparator', která porovná
  //  timestampy dvou akcí).
  private readonly queue = new TypedPriorityQueue<T>();

  public get size(): number { return this.queue.size; }

  public add(item: T): void { this.queue.add(item); }

  // Removes item from the top of the queue and returns it.
  public poll(): T | "Queue is empty"
  {
    const item = this.queue.poll();

    if (item === undefined)
      return "Queue is empty";

    return item;
  }

  // Returns item at the top of the queue but doesn't remove it from the queue.
  public peek(): T | "Queue is empty"
  {
    const item = this.queue.peek();

    if (item === undefined)
      return "Queue is empty";

    return item;
  }

  // Optimizes memory usage (optional).
  public trim(): void { this.queue.trim(); }

  public isEmpty(): boolean { return this.queue.isEmpty(); }

  // -------------- Protected methods -------------------

  // // ~ Overrides Serializable.customSerializeProperty().
  // protected customSerializeProperty(param: Serializable.SerializeParam): any
  // {
  //   /// TODO: Tohle je nahozené provizorně, není to vůbec testované.
  //   /// Nejspíš bude potřeba použít queue.forEach(callback) a vyrobit
  //   /// ručně array k savnutí.

  //   if (param.property === this.queue)
  //   {
  //     return this.queue.toJSON();
  //   }

  //   return "Property isn't serialized customly";
  // }

  // // ~ Overrides Serializable.customDeserializeProperty().
  // protected customDeserializeProperty(param: Serializable.DeserializeParam)
  // {
  //   if (param.propertyName === "queue")
  //   {
  //     /// TODO: Zřejmě bude potřeba použít heapify(array).
  //   }

  //   return "Property isn't deserialized customly";
  // }
}