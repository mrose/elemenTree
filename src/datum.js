import _get from 'lodash-es/get';
import _isFunction from 'lodash-es/isFunction';

// wrap a class around an object, assuring an id and other necessary attributes
class Datum {
  constructor(data = {}, id) {
    Object.assign(this, data);

    if (!this.id) {
      Object.defineProperty(this, 'id', {
        configurable: false,
        enumerable: true,
        writable: false,
        value: id
      });
    }
  }

  static factory(data = {}, id) {
    return new Proxy(new Datum(data, id), new DatumHandler());
  }

  get(fieldName, resolve = true) {
    let f = _get(this.data, fieldName);
    return !_isFunction(f) ? f : resolve ? f() : f;
  }
}

class DatumHandler {
  /** proxy for prop missing
   *
   * @param target {Datum}
   * @param code {String}
   * @returns {*}
   */
  get(target, prop) {
    //        const own = ["get"];
    //        if (_.includes(own, prop)) return target[prop];

    return target.get(prop);
  }
}
