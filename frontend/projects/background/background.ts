interface Window {
  fileCab: typeof FileCab;
}

import { FileCab } from '../shared/services/file-cab';

window['fileCab'] = new FileCab();
