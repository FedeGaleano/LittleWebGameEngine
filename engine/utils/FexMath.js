const FexMath = {
  precision(inputValue, precision) {
    return Math.round(inputValue * (10 ** precision)) / (10 ** precision);
  },
};

export default FexMath;
