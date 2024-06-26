
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
          "hi, i'm fexi, the mascot",
          'of the fex engine',
        ],
        [
          'and this is not',
          'actually a videogame',
        ],
        [
          'well... i mean',
          "it's just an engine demo",
          'to showcase what the',
          'engine is able to do',
        ],
        [
          'i guess fex will',
          'throw out a game',
          'one of these days',
        ],
        [
          'but in the meanwhile,',
          'how about...',
        ],
        [
          'you help me to',
          'get out of here',
          'without falling',
          'into the water',
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
