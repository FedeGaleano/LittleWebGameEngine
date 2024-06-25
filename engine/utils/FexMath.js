const defaultPrecision = 2;

const FexMath = {
  precision(inputValue, precision = defaultPrecision) {
    return Math.round(inputValue * (10 ** precision)) / (10 ** precision);
  },
  signedBoolean(condition) {
    return condition ? 1 : -1;
  },
  boundExpression(expression, minValue, maxValue) {
    return Math.max(Math.min(expression, maxValue), minValue);
  },
  modulus(operand, base) {
    return ((operand % base) + base) % base;
  },
};

export default FexMath;
