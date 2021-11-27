import { Component, OnInit } from '@angular/core';
import { ChromeApiService } from '../../services/chrome-api.service';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatDialog } from '@angular/material/dialog';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { LibraryService } from '../../services/library.service';
import { saveAsFile } from '../../helpers/save-as-file';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, switchMap, take } from 'rxjs/operators';
import { AddItemPopupComponent } from './components/add-item-popup/add-item-popup.component';
import { BaseInfo } from '@shared/popup-add-item/models/base-info';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getDomain } from '@shared/utils/get-domain';
import { trimTitle } from '@shared/utils/trim-title';
import { FileCabService } from '@shared/services/file-cab.service';
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

interface TreeItem extends BookmarkTreeNode {
  removed?: boolean;
  load?: boolean;
}

@UntilDestroy()
@Component({
  selector: 'app-analyze',
  templateUrl: './analyze.component.html',
  styleUrls: ['./analyze.component.scss'],
})
export class AnalyzeComponent implements OnInit {
  treeControl = new NestedTreeControl<TreeItem>(node => node.children);
  dataSource = new MatTreeNestedDataSource<TreeItem>();
  removeBookmark = true;
  schemas$ = this.fileCabService.schemas$;

  constructor(
    private chromeApiService: ChromeApiService,
    private libraryService: LibraryService,
    private dialog: MatDialog,
    private matSnackBar: MatSnackBar,
    private fileCabService: FileCabService,
  ) {
  }

  ngOnInit(): void {
    this.init();
  }

  getIcon(node: TreeItem): string {
    const [protocol, domain] = node.url.split('/').filter(item => item);
    return protocol + '//' + domain + '/favicon.ico';
  }

  removeNode(node: TreeItem): Promise<void> {
    return this.chromeApiService
      .removeBookmark(node.id)
      .then(() => {
        node.removed = true;
      });
  }

  removeFolder(node: TreeItem): void {
    Promise.all(
      node.children.map(item => item.children ? this.removeFolder(item) : this.removeNode(item)),
    ).then(() => {
      this.removeNode(node);
    });
  }

  onAssign(type: string, node: TreeItem): void {
    const { title, url } = node;

    this.schemas$.pipe(
      take(1),
      switchMap(schemas => {
        const domain = getDomain(url);
        const name = trimTitle(title, schemas[url]?.func);

        const baseInfo: BaseInfo = {
          url,
          name,
          domain,
          type,
        };

        const dialog = this.dialog.open(AddItemPopupComponent, {
          data: { baseInfo },
        });
        return dialog.afterClosed();
      }),
      take(1),
      filter(res => !!res),
      untilDestroyed(this),
    ).subscribe((res) => {
      node.load = false;
      if (this.removeBookmark) {
        this.removeNode(node);
      }

      this.matSnackBar.open('Сохранено', undefined, {
        duration: 2000,
      });
    });
  }

  exportNode(node: BookmarkTreeNode): void {
    const html = this.chromeApiService.generateExportBookmarkHtml(node);
    saveAsFile(html, `bookmark-${node.title}.html`);
  }

  hasChild = (_: number, node: BookmarkTreeNode) => !!node.children && node.children.length > 0;

  private init(): void {
    this.chromeApiService.getTreeBookmarks()
      .then(list => {
        this.dataSource.data = list;
      });
  }

}
