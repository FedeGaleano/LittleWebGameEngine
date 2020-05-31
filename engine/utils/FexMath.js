const defaultPrecision = 2;

const FexMath = {
  precision(inputValue, precision = defaultPrecision) {
    return Math.round(inputValue * (10 ** precision)) / (10 ** precision);
  },
  signedBoolean(condition) {
    return condition ? 1 : -1;
  },
};

export default FexMath;
