const FexUtils = {
  deviceHasTouch() {
    return 'ontouchstart' in document.documentElement;
  },
  availableLanguages: {
    ENGLISH: 'english',
    SPANISH: 'spanish',
  },
};

export default FexUtils;
