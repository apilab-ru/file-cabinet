import { Injectable } from '@angular/core';
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import { ISchema, Status } from '../../models';

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

  generateExportBookmarkHtml(tree: BookmarkTreeNode): string {
    let html = '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n' +
      '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n' +
      '<TITLE>Bookmarks</TITLE>\n' +
      '<H1>Bookmarks</H1>\n';
    html += `<DL><p>
    <DT><H3 ADD_DATE="1562156408" LAST_MODIFIED="1570278884" PERSONAL_TOOLBAR_FOLDER="true">Панель закладок</H3>`;
    html += this.renderBookmark(tree);
    html += '</DL><p>';
    return html;
  }

  private renderBookmark(node: BookmarkTreeNode): string {
    let html = '';
    html += '<DL><p>\n';
    html += `<DT><H3 ADD_DATE="${node.dateAdded}" LAST_MODIFIED="${node.dateGroupModified}">${node.title}</H3>\n`;
    html += `<DL><p>\n`;
    node.children.forEach(child => {
      if (child.children) {
        html += this.renderBookmark(child);
      } else {
        html += `<DT><A HREF="${child.url}" ADD_DATE="${child.dateAdded}" ICON="">${child.title}</A>\n`
      }
    });
    html += '</DL><p>\n' +
              '</DL><p>\n';
    return html;
  }
}
