const FexUtils = {
  deviceHasTouch() {
    return 'ontouchstart' in document.documentElement;
  },
};

export default FexUtils;
