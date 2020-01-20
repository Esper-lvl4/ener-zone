/* [action(type: banish, ...args)] */

import movement from '@/modules/effects/actions/movement';
import cardState from '@/modules/effects/actions/cardState';
import creation from '@/modules/effects/actions/creation';
import customActions from '@/modules/effects/actions/customActions';
import Options from '@/modules/effects/ActionOptions';

const actions = {
  ...movement,
  ...cardState,
  ...creation,
  ...customActions,
}

export default actions;