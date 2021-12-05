import { Injectable } from '@angular/core';
import { ISchema } from '@shared/models/library';
import { ParserActions } from '@shared/parser/const';

@Injectable({
  providedIn: 'root',
})
export class BrowserApiService {
  sendMessage<R>(key: ParserActions, data = {}): Promise<R> {
    return new Promise<R>(resolve => {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { key, data }, function(response) {
          resolve(response);
        });
      });
    });
  }

  getActiveTabTitle(schemas: Record<string, ISchema>): Promise<string> {
    return this.getActiveTab()
      .then(tab => {
        if (tab.url.includes('chrome://extensions')) {
          return Promise.reject('permissions');
        }

        const host = this.getTabDomain(tab);
        const code = this.getCodeGetterTitle(host, schemas);

        return this.executeScriptOnTab<string>(tab, code);
      });
  }

  getActiveTab(): Promise<chrome.tabs.Tab> {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        resolve(tabs[0]);
      });
    });
  }

  getActiveTabLinks(): Promise<{ url: string, domain: string }> {
    return this.getActiveTab().then(tab => ({
      url: tab.url,
      domain: this.getTabDomain(tab),
    }));
  }

  executeScriptOnTab<T>(tab: chrome.tabs.Tab, code: string): Promise<T> {
    return new Promise((resolve) => {
      chrome.tabs.executeScript({ code }, ([title]) => resolve(title));
    });
  }

  private getTabDomain(tab: chrome.tabs.Tab): string {
    return tab.url.split('/')[2].replace('www.', '');
  }

  private getCodeGetterTitle(host: string, schemas: Record<string, ISchema>): string {
    if (schemas[host]?.title) {
      return schemas[host].title;
    }

    return 'document.title';
  }
}
