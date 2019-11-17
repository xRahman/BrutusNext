import { REPORT } from "../Shared/Log/REPORT";

REPORT(new Error("test error"));

export namespace Test
{
  export function test()
  {
    REPORT(new Error("another test error"));
  }
}