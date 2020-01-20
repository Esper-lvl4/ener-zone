function ActionOptions(overwriter) {
  const obj = {
    target: null,
    targetCount: 1, 
    level: null, 
    power: null, 
    signiType: null,
    lrigType: null,
  };
  return Object.assign(obj, overwriter);
}

export default ActionOptions;