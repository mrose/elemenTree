/*
ex:
@toggle("selected", someObservableMap)
class SummaryRow extends Item {};

    range consists of a min integer and a max integer
    min must be either zero or one, the minimum number of elements allowed in the oMap
    max must be a number higher than zero (a max of zero would be always empty)
    typical toggling, (the default) has zero or more records selected
    a range of [1,1]  = one is always selected. like a radio button with a default
    a range of [0,1] = either zero or 1
 */

// decorator
export function toggle(name, oMap, range = [], key = 'id') {
  const min = range[0] || 0;
  const max = range[1] || Number.MAX_SAFE_INTEGER;

  if (!_.includes([0, 1], min)) {
    throw 'the first element of the range array must be one or zero';
  }

  if (!Number.isInteger(max)) {
    throw 'the second element of the range array must be an integer';
  }

  if (max <= 0) {
    throw 'the second element of the range array must be greater than zero';
  }

  if (max > Number.MAX_SAFE_INTEGER) {
    throw `the second element of the range array must be ${Number.MAX_SAFE_INTEGER} or lower`;
  }

  function decorate(target) {
    function isToggled() {
      return oMap.has(target[key]);
    }

    // returns boolean indicating that key exists in the oMap
    function toggle(value = true) {
      if (isToggled()) {
        if (min === 1) return true;

        runInAction(() => oMap.delete(target[key]));
        return false;
      }

      if (max === 1) {
        runInAction(() => oMap.replace({ [target[key]]: value }));
        return true;
      }

      if (max > oMap.size) {
        runInAction(() => oMap.set(target[key], value));
        return true;
      }
    }

    Object.defineProperty(target, `is${_.capitalize(name)}`, {
      enumerable: true,
      value: isToggled,
    });

    Object.defineProperty(target, `toggle${_.capitalize(name)}`, {
      enumerable: true,
      value: toggle,
    });

    return target;
  }

  return decorate;
}
