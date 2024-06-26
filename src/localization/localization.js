
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
  get PAUSE() {
    return localize({
      [lang.ENGLISH]: 'PAUSE',
      [lang.SPANISH]: 'PAUSA',
    });
  },
  get YOU_WON_THANKS_FOR_PLAYING() {
    return localize({
      [lang.ENGLISH]: 'YOU WON. THANKS FOR PLAYING :3',
      [lang.SPANISH]: 'GANASTE. GRACIAS POR JUGAR :3',
    });
  },
  get FEXI_INTRODUCTION_SPEECH() {
    return localize({
      [lang.ENGLISH]: [
        [
          "hi, i'm fexi, the mascot",
          'of the fex engine',
        ],
        [
          'seguramente fex',
          'ya te explico',
          'que este no es',
          'el videojuego',
        ],
        [
          'pero aun asi',
          'sigues esperando eso',
          'porque el hype',
          'no te deja escuchar',
        ],
        [
          'asi que mientras tanto...',
        ],
        [
          'ayudame a salir de aqui',
          'sin caer al agua',
        ],
        [
          ':)',
        ],
        [
          '<3',
        ],
      ],
      [lang.SPANISH]: [
        [
          'hola, soy fexi, la mascota',
          'del motor fex engine',
        ],
        [
          'seguramente fex',
          'ya te explico',
          'que este no es',
          'el videojuego',
        ],
        [
          'pero aun asi',
          'sigues esperando eso',
          'porque el hype',
          'no te deja escuchar',
        ],
        [
          'asi que mientras tanto...',
        ],
        [
          'ayudame a salir de aqui',
          'sin caer al agua',
        ],
        [
          ':)',
        ],
        [
          '<3',
        ],
      ],
    });
  },
};

export default Localization;
