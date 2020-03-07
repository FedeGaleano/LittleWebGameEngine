const canvasToAskForRotation = document.createElement('canvas');
canvasToAskForRotation.id = 'askToRotatePhone';
canvasToAskForRotation.width = window.innerWidth;
canvasToAskForRotation.height = window.innerHeight;
canvasToAskForRotation.style.backgroundColor = '#1E1E1E';
canvasToAskForRotation.style.padding = canvasToAskForRotation.style.margin = 0;


// eslint-disable-next-line import/no-mutable-exports
let canvasWidth;
// eslint-disable-next-line import/no-mutable-exports
let canvasHeight;

// eslint-disable-next-line prefer-const
canvasWidth = canvasToAskForRotation.width;
// eslint-disable-next-line prefer-const
canvasHeight = canvasToAskForRotation.height;

document.body.appendChild(canvasToAskForRotation);
const renderingContext2D = canvasToAskForRotation.getContext('2d');
const scale = 4;
renderingContext2D.imageSmoothingEnabled = false;

export {
  renderingContext2D,
  scale,
  canvasWidth,
  canvasHeight,
};
