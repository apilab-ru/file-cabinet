function insertScript(src: string): Promise<void> {
  const scriptElement = document.createElement('script');

  scriptElement.src = chrome.extension.getURL(src);
  console.log('xxx link', scriptElement.src);

  scriptElement.setAttribute('defer', '');

  return new Promise<void>((resolve, reject) => {
    scriptElement.addEventListener('load', () => {
      resolve();
    });
    scriptElement.addEventListener('error', () => {
      reject();
    });
    console.log('xxx doc', document);
    document.body.appendChild(scriptElement);
  });
}

console.log('xxx start');
const el = document.createElement('file-cabinet-page');
console.log('xxx el', el);
document.body.appendChild(el);


/*Promise.all([
  insertScript('page/runtime.js'),
  insertScript('page/main.js'),
]).then(() => {
  console.log('xxx ready');
}).catch(e => console.error('xxx', e))*/
