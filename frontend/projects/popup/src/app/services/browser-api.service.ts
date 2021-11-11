import { Injectable } from '@angular/core';
import { ISchema } from '@shared/models/library';

@Injectable({
  providedIn: 'root',
})
export class BrowserApiService {
  getActiveTabTitle(schemas: Record<string, ISchema>): Promise<string> {
    return this.getActiveTab()
      .then(tab => {
        const host = this.getTabDomain(tab);
        const code = this.getCodeGetterTitle(host, schemas);

        return this.executeScriptOnTab<string>(tab, code);
      });
  }

  getActiveTabLinks(): Promise<{ url: string, domain: string }> {
    return this.getActiveTab().then(tab => ({
      url: tab.url,
      domain: this.getTabDomain(tab),
    }));
  }

  private getTabDomain(tab: chrome.tabs.Tab): string {
    return tab.url.split('/')[2].replace('www.', '');
  }

  private executeScriptOnTab<T>(tab: chrome.tabs.Tab, code: string): Promise<T> {
    return new Promise((resolve) => {
      chrome.tabs.executeScript({ code }, ([title]) => resolve(title));
    });
  }

  private getCodeGetterTitle(host: string, schemas: Record<string, ISchema>): string {
    if (schemas[host]?.title) {
      return schemas[host].title;
    }

    return 'document.title';
  }

  private getActiveTab(): Promise<chrome.tabs.Tab> {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        resolve(tabs[0]);
      });
    });
  }
}
