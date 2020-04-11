/* eslint-disable no-console */
const fontSize = 18;
const font = `bold ${fontSize}px arial`;
const bottomMargin = 10;
const leftMargin = 10;
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
  logOnScreen(message, graphics, position, color = 'yellow', backColor = 'black') {
    const { renderingContext2D, canvasHeight } = graphics;
    const width = renderingContext2D.measureText(message).width + 4;
    const height = fontSize;

    renderingContext2D.font = font;

    const prevColor = renderingContext2D.fillStyle;
    renderingContext2D.fillStyle = backColor;
    renderingContext2D.globalAlpha = 0.75;
    renderingContext2D.fillRect(leftMargin - 2, canvasHeight - (bottomMargin + fontSize) * position - 2 - 16, width, height + 4);

    renderingContext2D.fillStyle = color;
    renderingContext2D.globalAlpha = 1;
    renderingContext2D.fillText(message, leftMargin, canvasHeight - (bottomMargin + fontSize) * position, 260);
    renderingContext2D.fillStyle = prevColor;
  },
};

export default FexDebug;
