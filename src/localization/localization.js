
import FexGlobals from '../../engine/utils/FexGlobals.js';
import FexUtils from '../../engine/utils/FexUtils.js';

const lang = FexUtils.availableLanguages;

function localize(texts) {
  return texts[FexGlobals.language.get()];
}

const Localization = {
  get PRESS_ENTER_TO_START() {
    return localize({
      [lang.ENGLISH]: 'PRESS ENTER TO START',
      [lang.SPANISH]: 'PRESIONE INTRO PARA EMPEZAR',
    });
  },
};

export default Localization;
