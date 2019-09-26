import { Injectable } from '@angular/core';
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import { Status } from '@cab/api';

@Injectable({
  providedIn: 'root'
})
export class ChromeApiService {

  getTreeBookmarks(): Promise<BookmarkTreeNode[]> {
    return new Promise((resolve, reject) => {
      try {
        window.chrome.bookmarks.getTree(list => {
          resolve(list);
        });
      }catch (e) {
        reject(e);
      }
    })
  }

  removeBookmark(id: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        window.chrome.bookmarks.remove(id, resolve);
      }catch (e) {
        reject(e);
      }
    });
  }

  get fileCab(): FileCab {
    return chrome.extension.getBackgroundPage()['fileCab'];
  }
}

export interface FileCab {
  getStatusList: () => Promise<Status[]>;
}
