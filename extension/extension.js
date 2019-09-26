"use strict";

const apiUrl = 'http://localhost:3000/';
const nameExp = /([a-zA-zа-яА-яёЁ\s0-9]*)/;
const statusList = [
  {
    name: 'Запланированно',
    status: 'letter'
  },
  {
    name: 'Просмотренно',
    status: 'complete'
  },
  {
    name: 'Брошенно',
    status: 'drop'
  }
];
const keyStore = 'store';

class FileCab {

  constructor() {
    this.initedData = this.init();
    this.store$ = new ReplaySubject(1);
    this.loadStore();
    this.listenChangeStore();
  }

  searchData(path, name) {
    name = this.trimName(name);
    switch(path) {
      case 'anime':
        return this.searchAnime(name);

      case 'films':
        return this.searchFilm(name);

      case 'tv':
        return this.searchTv(name);

      default:
        return new Promise((reolve, rejected) => rejected(`path ${name} not support`));
    }
  }

  getStatusList() {
    return Promise.resolve(statusList);
  }

  searchAnime(name) {
    return fetch(
      new URL(apiUrl + 'anime/search?name=' + name).href
    ).then(res => res.json());
  }

  searchFilm(name) {
    return fetch(
      new URL(apiUrl + 'films/movie?name=' + name).href
    ).then(res => res.json());
  }

  searchTv(name) {
    return fetch(
      new URL(apiUrl + 'films/tv?name=' + name).href
    ).then(res => res.json());
  }

  trimName(fullName) {
    return fullName.match(nameExp)[0].trim();
  }

  init() {
    return Promise.all([
      fetch('/api/parser.json').then(res => res.json()),
      fetch('/api/types.json').then(res => res.json())
    ]).then(([schemas, types]) => ({schemas, types, statusList}));
  }

  reload() {
    return this.init(res => {
      this.initedData = new Promise((resolve) => resolve(res));
      return res;
    })
  }

  /*
  *  @param {url}
  * */
  addItem(path, name, param) {
    console.log('add item', path, name, param);
    this.searchData(path, name)
      .then(res => this.checkResults(res))
      .then(item => {
        this.addItemToStore(item, path, param);
        return item;
      });
  }

  checkResults(res) {
    if (res.total_results === 1) {
      return Promise.resolve(res.results[0]);
    } else {
      // TODO add window to select result
    }
  }

  /*
  *  @param {url}
  * */
  addItemToStore(item, path, param) {
    console.log('add item to store', item, path, param);
    if(!this.store.data[path]) {
      this.store.data[path] = [];
    }
    this.store.data[path].push({
      item,
      ...param
    });
    this.saveStore();
    console.log('store', this.store);
  }

  loadStore() {
    try {
      this.store = JSON.parse(localStorage.getItem(keyStore));
    } catch (e) {}
    if (!this.store) {
      this.store = {
        tags: [],
        data: {}
      };
      this.saveStore();
    } else {
      this.store$.next(this.store);
    }
  }

  saveStore() {
    this.store$.next(this.store);
    localStorage.setItem(keyStore, JSON.stringify(this.store));
  }

  listenChangeStore() {
    window.addEventListener('storage', event => {
      console.log('storage change', event);
      if (event.key === keyStore) {
        const data = JSON.parse(event.newValue);
        this.store$.next(data);
      }
    });
  }
  
}

window.fileCab = new FileCab();

function ReplaySubject(count) {
  const callbacks = [];
  const currentValue = [];
  const subject = {
    next: (value) => {
      currentValue.push(value);
      if (currentValue.length > count) {
        currentValue.shift();
      }
      console.log('callbacks', callbacks);
      callbacks.forEach(({next}) => next && next(value));
    },
    error: (value) => {
      callbacks.forEach(({error}) => error && error(value));
    },
    subscribe: (next, error, complete) => {
      callbacks.push({next, error, complete});
      if (currentValue.length) {
        currentValue.forEach(value => next(value));
      }
    },
  };
  return subject;
}
