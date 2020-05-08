/* eslint-disable no-console */
const debugInfo = { };
const generalInfo = {};
const fontSize = 18;
const font = `bold ${fontSize}px arial`;
const bottomMargin = 10;
const leftMargin = 10;


function renderOnScreen(message, graphics, position, color = 'yellow', backColor = 'black', padding = 0) {
  const { renderingContext2D, canvasHeight } = graphics;
  const width = renderingContext2D.measureText(message).width + 4;
  const height = fontSize;

  renderingContext2D.font = font;

  const prevColor = renderingContext2D.fillStyle;
  renderingContext2D.fillStyle = backColor;
  renderingContext2D.globalAlpha = 0.75;
  renderingContext2D.fillRect(leftMargin + padding - 2, canvasHeight - (bottomMargin + fontSize) * position - 2 - 16, width, height + 4);

  renderingContext2D.fillStyle = color;
  renderingContext2D.globalAlpha = 1;
  renderingContext2D.fillText(message, leftMargin + padding, canvasHeight - (bottomMargin + fontSize) * position, 260);
  renderingContext2D.fillStyle = prevColor;
}

function renderDebugInfoOnScreen(graphics) {
  const keys = Object.keys(debugInfo);

  keys.forEach((key, index) => {
    renderOnScreen(`${key}: ${debugInfo[key]}`, graphics, 7 + index, 'cyan', 'black', 20);
  });

  renderOnScreen('Debug Info', graphics, 7 + keys.length, 'cyan');
}

const FexDebug = {
  logOnConsole(message, ...extra) {
    console.log(`
___________________
FexDebugger[log]:
___________________

${message}
`, ...extra, `
___________________
    `);
  },
  render(graphics) {
    renderOnScreen('General Info', graphics, 6);
    renderOnScreen(`scale: ${graphics.scale}`, graphics, 5, 'yellow', 'black', 20);
    renderOnScreen(`w: ${graphics.canvas.width}`, graphics, 4, 'yellow', 'black', 20);
    renderOnScreen(`h: ${graphics.canvas.height}`, graphics, 3, 'yellow', 'black', 20);
    renderOnScreen(`orient: ${window.screen.orientation.type}`, graphics, 2, 'yellow', 'black', 20);
    renderOnScreen(`FPS: ${generalInfo.fps}`, graphics, 1, 'yellow', 'black', 20);
    renderDebugInfoOnScreen(graphics);
  },
  setGeneralInfo(info) {
    Object.assign(generalInfo, info);
  },
  logOnScreen(key, message) {
    debugInfo[key] = message;
  },
  chargeHeavily(count = 1000) {
    console.log('\n');
    for (let i = 0; i < count; ++i) {
      console.log(i);
    }
    console.log('\n');
  },
};

export default FexDebug;
