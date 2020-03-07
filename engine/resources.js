const resourceLoadingData = [
  { path: 'fede-engine-title.png', resourceName: 'titleImage' },
  { path: 'rotate.png', resourceName: 'rotationImage' },
  { path: 'TRY_01.png', resourceName: 'tryImage' },
];

const resources = {};

function loadResources() {
  return Promise.all(
    resourceLoadingData.map(({ path, resourceName }) => {
      const img = new Image();
      img.src = `res/${path}`;
      return new Promise((resolve) => {
        img.onload = () => {
          resources[resourceName] = img;
          resolve();
        };
      });
    }),
  );
}

export { loadResources, resources };
