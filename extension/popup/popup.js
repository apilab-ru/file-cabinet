class Parser {

  constructor() {
    this.import = new Import();
    this.startLoading();
    this.fileCab.popup = this;
    this.init().then(() => {
      this.stopLoading();
      this.fileCab.store$.subscribe(data => {
        this.store = data;
        console.log('store', data);
        this.render();
      });

      chrome.windows.onFocusChanged.addListener((window) => {
        this.fileCab.store$.unsubscribe();
      });

      const modals = M.Modal.init(document.querySelectorAll('.modal'), {
        onOpenStart: () => {
          this.togglePopup();
        },
        onCloseEnd: () => {
          this.togglePopup();
        }
      });
      this.modal = modals[0];
      /*document.querySelector('.js-add')
        .addEventListener('click', () => {
          modals[0].open();
        });*/
    });
  }

  showModal(data) {
    let resolve, reject;
    let isResolved = false;
    this.modal.options.onCloseStart = () => {
      if (!isResolved) {
        reject();
      }
    };
    this.renderModalItems(data);
    document.querySelectorAll('.found__list .found__item')
      .forEach((node, index) => {
        node.addEventListener('click', () => {
          isResolved = true;
          resolve(data[index]);
          this.modal.close();
        });
      });
    this.modal.open();
    return new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
  }

  renderModalItems(list) {
    let items = '';
    list.forEach(item => {
      items +=
        `<div class='found__item'>
          <img class="found__image" src="${item.image}">
          <div class="found__info">
            <div class="found__date">${item.date}</div>
            <div class="found__name">${item.title} / ${item.original_title}</div>
            <div class="found__description">${item.description}</div>
          </div>
        </div>`;
    });
    document.querySelector('.found__list').innerHTML = items;
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
    const $select = document.querySelector('.status-list select');
    $select.addEventListener('change', event => {
      const status = event.target.value;
      if (status === 'complete') {
        document.querySelector('.app-stars').classList.add('show');
      } else {
        document.querySelector('.app-stars').classList.remove('show');
      }
    });
    M.FormSelect.init($select);
    if (foundItem && foundItem.status ==='complete') {
      document.querySelector('.app-stars').star = foundItem.star || 0;
      document.querySelector('.app-stars').classList.add('show');
    }

    document.querySelector('.app-stars').addEventListener('setStars', event => {
      if (foundItem) {
        foundItem.star = event.detail;
        const {path, ...item} = foundItem;
        this.fileCab.updateItem(path, item.item.id, item);
      }
    });

    let subActionsHtml = null;
    if (this.import.checkHost(this.host, this.url)) {
      subActionsHtml = '<button class="waves-effect waves-light btn js-import">Импортировать</button>'
    }
    document.querySelector('.js-sub-actions').innerHTML = subActionsHtml;
    if (subActionsHtml) {
      document.querySelector('.js-import')
        .addEventListener('click', () => {
          chrome.tabs.executeScript({code: this.import.smotretAnime()}, ([data]) => {
            const list = this.import.handleSmotretAnime(data, this.store.data.anime);
            const result = [];
            let process = 0;
            Promise.all(
              list.map(item => this.fileCab.getAnimeById(item.id)
                .then(item => {
                  process = process + 1;
                  console.log('status', process, list.length);
                  return item;
                })
              )
            ).then(data => {
              data.forEach((item, index) => {
                result.push({
                  item,
                  ...list[index].param
                })
              });
              this.fileCab.store.data.anime.push(
                ...result
              );
              this.fileCab.saveStore();
              console.log('store', this.fileCab.store, result);
            });
          });
        });
    }
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
        foundItem = {
          ...item,
          path
        };
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
        },
        star: document.querySelector('.app-stars').star
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
        return this.fileCab.addItem(path, title, param);
      })
      .then(() => this.stopLoading())
      .catch(error => {
        this.stopLoading();
        this.errorHandler(error);
      })
  }

  errorHandler(reason) {
    switch (reason.code) {
      case 'notUnique':
        this.showMessage('Элемент уже добавлен в библиотеку');
        break;
    }
  }

  showMessage(message) {
    alert(message);
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

  togglePopup() {
    document.querySelector('.popup').classList.toggle('show-modal');
  }

}

class Import {

  checkHost(host, url) {
    switch(host) {
      case 'smotret-anime-365.ru':
        return url.match(/smotret\-anime-365\.ru\/users\/[0-9]*\/list/);
        break;
    }
  }

  smotretAnime() {
    return `var data = [];
    document.querySelectorAll('.m-animelist-card')
      .forEach(nodeCard => {
        const title = nodeCard.querySelector('.card-title').innerText.trim();
        const section = {
          title,
          list: []
        };
        nodeCard.querySelectorAll('.m-animelist-item')
          .forEach(tdNode => {
            const tdNodes = tdNode.querySelectorAll('td');
            const link = tdNodes[1].querySelector('a').href;
            const id = +link.match(/\\/([0-9]{1,5})/g)[0].substr(1);
            const progress = tdNodes[2].innerText.trim().split('/').map(it => +it)[0];
            let score = tdNodes[3].innerText.trim();
            score = score === '-' ? 0 : +score;
            section.list.push({link, id, progress, score});
          });
        data.push(section);
      });
    data;`;
  }

  handleSmotretAnime(data, store) {
    const list = [];
    const statusMap = {
      'Смотрю': 'process',
      'Просмотрено': 'complete',
      'Отложено': 'planned',
      'Брошено': 'drop',
      'Запланировано': 'planned'
    };
    data.forEach(section => {
      const status = statusMap[section.title];
      section.list.forEach(item => {
        if (this.checkUnique(store, item.id)) {
          list.push({
            id: item.id,
            param: {
              status,
              progress: item.progress,
              url: item.link,
              star: item.score
            }
          });
        }
      });
    });
    return list;
  }

  checkUnique(store, id) {
    return !store.find(item => item.item.id === id);
  }

}

const parser = new Parser();
