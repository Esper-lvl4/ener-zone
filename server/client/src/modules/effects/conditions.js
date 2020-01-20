/* {cond()} */

import general from '@/modules/effects/conditions/general';
import trait from '@/modules/effects/conditions/trait';
import nestedTrait from '@/modules/effects/conditions/nestedTrait';
import temporalTrait from '@/modules/effects/conditions/temporalTrait';

const conditions = {
  ...general,
  ...trait,
  ...nestedTrait,
  ...temporalTrait,
};

export default conditions;