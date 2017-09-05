/*
  Part of BrutusNEXT

  Shared container entity interface.
*/

'use strict';

import {Entity} from '../../shared/lib/entity/Entity';
import {ContainerData} from '../../shared/game/ContainerData';

export interface ContainerEntity extends Entity
{
  data: ContainerData;
}