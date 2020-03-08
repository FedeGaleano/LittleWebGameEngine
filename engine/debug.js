/* eslint-disable no-console */
const FexDebug = {
  log(message, ...extra) {
    console.log(`
___________________
FexDebugger[log]:
___________________

${message}
`, ...extra, `
___________________
    `);
  },
};

export default FexDebug;
