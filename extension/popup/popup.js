class Parser {

  constructor() {
    this.startLoading();
    this.init().then(() => {
      this.stopLoading();
      this.fileCab.store$.subscribe(data => {
        console.log('data', data);
        this.store = data;
        this.render();
      });
    });
  }

  init() {
    return this.fileCab.initedData
      .then(({schemas, types, statusList}) => {
        this.schemas = schemas;
        this.types = types;
        this.statusList = statusList;
        return this.getHostAndUrl();
      })
      .then(({host, url}) => {
        this.url = url;
        this.host = host;
        console.log('host', host, url);
      });
  }

  render() {
    const foundItem = this.findAddedItem();
    let infoHtml = '';
    if (foundItem) {
      infoHtml = 'Фильм добавлен в коллекцию';
    }
    document.querySelector('.info').innerHTML = infoHtml;

    let buttonsHtml = '';
    const schemaPatch = this.schemas[this.host] && this.schemas[this.host].type;
    const checkActual = (type) => type.path === schemaPatch ? 'active' : '';
    this.types.forEach(type => {
      buttonsHtml +=
        `<button class='type ${checkActual(type)} waves-effect waves-light btn' data-type='${type.path}'>
          ${type.name}
        </button>`;
    });
    document.querySelector('.buttons').innerHTML = buttonsHtml;
    document.querySelectorAll('.buttons .type')
      .forEach(node => {
        node.addEventListener('click', event => {
          this.add(event.target.dataset.type);
        });
      });

    let statusListHtml = '<select>';
    const isSelected = (status) => foundItem && foundItem.status === status.status ? 'selected' : '';
    this.statusList.forEach(status => {
      statusListHtml +=
        `<option ${isSelected(status)} value="${status.status}">${status.name}</option>`;
    });
    statusListHtml += '</select>';
    document.querySelector('.status-list').innerHTML = statusListHtml;
    const selectInstance = M.FormSelect.init(document.querySelector('.status-list select'));
  }

  getTitle(host) {
    return new Promise((resolve, rejected) => {
      const code = this.getCodeGetterTitle(host);
      chrome.tabs.executeScript({code}, ([title]) => resolve(title))
    });
  }

  getStatus() {
    return document.querySelector('.status-list select').value;
  }

  findAddedItem() {
    let foundItem;
    Object.keys(this.store.data).forEach(path => {
      const item = this.store.data[path].find(item => item.url === this.url);
      if (item) {
        foundItem = item;
        return false;
      }
    });
    return foundItem;
  }

  getData() {
    return this.getTitle(this.host)
      .then(title => this.getNameByTitle(title, this.host))
      .then(title => ({
        title,
        param: {
          url: this.url,
          status: this.getStatus()
        }
      }));
  }

  getHostAndUrl() {
    return new Promise((resolve, rejected) => {
      chrome.tabs.getSelected(tab => {
        let host = tab.url.split('/')[2];
        if (host.substr(0, 4) === 'www.') {
          host = host.substr(4);
        }
        resolve({host, url: tab.url});
      });
    });
  }

  add(path) {
    this.startLoading();
    this.getData()
      .then(({title, param}) => {
        console.log('path', path, title, param);
        return this.fileCab.addItem(path, title, param);
      })
      .then(() => this.stopLoading());
  }

  startLoading() {
    document.querySelector('.progress-box').classList.add('show');
  }

  stopLoading() {
    document.querySelector('.progress-box').classList.remove('show');
  }

  get fileCab() {
    return chrome.extension.getBackgroundPage().fileCab;
  }

  getNameByTitle(title, host) {
    if (this.schemas[host]) {
      return eval(this.schemas[host].func)(title);
    }
    console.log('schema not found', host);
    return title;
  }

  getCodeGetterTitle(host) {
    if (this.schemas[host] && this.schemas[host].title) {
      return this.schemas[host].title;
    }
    return 'document.title';
  }

}

const parser = new Parser();
