
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
      [lang.SPANISH]: 'PRESIONE ENTRAR PARA EMPEZAR',
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
          "hi! i'm fexi, the mascot",
          'of the fex engine,',
          'a little javascript game engine',
          'with no 3rd party libraries.',
        ],
        [
          'and this is a demo',
          'to showcase what this',
          'little engine is capable of',
        ],
        [
          'so, to see it,',
          'how about...',
        ],
        [
          'you help me get',
          'out of here',
          'without falling',
          'into the water',
        ],
        [
          ':)',
        ],
      ],
      [lang.SPANISH]: [
        [
          'hola!  soy fexi, la mascota',
          'del motor fex engine',
        ],
        [
          'hola!  soy fexi, la mascota',
          'del motor fex engine',
          'un motor de juegos en javascript',
          'sin bibliotecas de 3ros.',
        ],
        [
          'y esta es una demo',
          'para mostrar de lo que este',
          'pequeño motor es capaz',
        ],
        [
          'así que, para verlo,',
          'que tal sí...',
        ],
        [
          'me ayudas a ',
          'salir de aquí',
          'sin caer al agua',
        ],
        [
          ':)',
        ],
      ],
    });
  },
};

export default Localization;
