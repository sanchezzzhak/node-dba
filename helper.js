exports.empty = function(...args) {
  return (
    args.filter((mixed) => {
      return (
        mixed === '' ||
        mixed === 0 ||
        mixed === '0' ||
        mixed === null ||
        mixed === false ||
        (Array.isArray(mixed) && mixed.length === 0)
      );
    }).length === args.length
  );
};

exports.isString = function(str) {
  return typeof str === 'string' || str instanceof String;
}

exports.merge = function(param1, param2) {
  return {...param1, ...param2};
}

exports.replaceCallback = function(pattern, callback, string) {
  [...string.matchAll(pattern)].forEach(value => {
    string = string.replace(value[0], callback(value));
  });
  return string;
}

exports.instanceOf = function(obj, right) {
  return (!Array.isArray(obj) && typeof obj === 'object' && obj instanceof
    right);
};

exports.isNumber = function(key) {
  return /^\d+$/.test(key);
}

exports.isset = function(obj) {
  return !(typeof obj === 'undefined' || obj === null || obj.length === 0);
};

exports.strncmp = function(str, search, pos) {
  return str.startsWith(search, pos);
};

/**
 * compare arrays a with b and get everything in b
 * @param a
 * @param b
 * @returns {*}
 */
exports.compareArrayExist = function(a, b) {
  return a.filter((n) => b.indexOf(n) !== -1);
};
/**
 * compare arrays a with b and get everything that is not in b
 * @param a
 * @param b
 * @returns {*}
 */
exports.compareArrayNotExist = function(a, b) {
  return a.filter((n) => b.indexOf(n) === -1);
};

exports.unique = function(value, index, self) {
  return self.indexOf(value) === index;
};

/**
 * @param arr1 {Array}
 * @returns {*}
 */
exports.arrayUnique = function(arr1) {
  return arr1.filter((v, i, a) => a.indexOf(v) === i);
};