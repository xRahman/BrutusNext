/*
  Part of BrutusNext

  A class that processes and sends packets
*/

// TODO: Tohle by možná mohl bejt namepsace...
// K čemu je vlastně PacketHandler dobrej? Možná jsem chtěl
// oddělit ze Socketu metody, který nesouvisej s websocketem?
// - v Socket.onMessage() se volá deserializeAndProcessPacket().
//   Možná by dávalo větší smysl, kdyby byl naopak packet handler
//   zděděnej ze Socketu a přetížil si onMessage()?
//   - ze Socketu je zděděná Connection, ta by asi mít metody na
//     zpracování packetu nemusela... Leda bych měl Connection¨
//     a z ní zděděnou PlayerConnection (protože současná Connection
//     beztak jen dělá něco s Playerem).

import { REPORT } from "../../Shared/Log/REPORT";
import { Serializable } from "../../Shared/Class/Serializable";
import { Packet } from "../../Shared/Protocol/Packet";

export abstract class PacketHandler
{
  // ---------------- Public methods --------------------

  public async deserializeAndProcessPacket(data: string)
  {
    /// DEBUG:
    // console.log(data);

    try
    {
      const packet = Serializable.deserialize(data).dynamicCast(Packet);

      await this.processPacket(packet);
    }
    catch (error)
    {
      REPORT(error, `Failed to deserialize incoming packet.`
        + ` Packet data: "${data}"`);
    }
  }

  // --------------- Protected methods ------------------

  protected abstract send(packet: Packet): void;

  // ---------------- Private methods -------------------

  private async processPacket(packet: Packet)
  {
    try
    {
      await packet.process(this);
    }
    catch (error)
    {
      REPORT(error, "Failed to process incoming packet");
    }
  }
}