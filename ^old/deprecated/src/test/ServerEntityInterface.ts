'use strict';

import * as EntityModule from '../test/EntityInterface';

declare module '../test/EntityInterface'
{
  export interface EntityInterface
  {
    serverId: string;
  }
}
