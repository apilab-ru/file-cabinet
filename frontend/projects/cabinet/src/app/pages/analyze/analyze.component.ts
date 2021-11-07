import { Component, OnInit } from '@angular/core';
import { ChromeApiService } from '../../services/chrome-api.service';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatDialog } from '@angular/material/dialog';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { LibraryService } from '../../services/library.service';
import { AddItemComponent } from '../../shared/components/add-item/add-item.component';
import { filter, first, mergeMap, tap } from 'rxjs/operators';
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import { saveAsFile } from '../../helpers/save-as-file';

interface TreeItem extends BookmarkTreeNode {
  removed?: boolean;
  load?: boolean;
}

@Component({
  selector: 'app-analyze',
  templateUrl: './analyze.component.html',
  styleUrls: ['./analyze.component.scss']
})
export class AnalyzeComponent implements OnInit {

  treeControl = new NestedTreeControl<TreeItem>(node => node.children);
  dataSource = new MatTreeNestedDataSource<TreeItem>();

  constructor(
    private chromeApiService: ChromeApiService,
    private libraryService: LibraryService,
    private dialog: MatDialog,
  ) {
  }

  ngOnInit() {
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
      node.children.map(item => item.children ? this.removeFolder(item) : this.removeNode(item))
    ).then(() => {
      this.removeNode(node);
    })
  }

  onAssign(path: string, node: TreeItem): void {
    const title = this.libraryService.findName(node.title, node.url);
    const dialog = this.dialog.open(AddItemComponent, {
      data: {
        path,
        title,
        fullName: node.title,
        url: node.url
      }
    });
    dialog.afterClosed()
      .pipe(
        filter(data => !!data),
        mergeMap(data => {
          const { title, path, param } = data;
          return this.libraryService.addItemByName(path, title, param);
        })
      )
      .subscribe(res => {
        node.load = false;
        this.removeNode(node);
      }, error => {
        this.handleError(error);
      });
  }

  exportNode(node: BookmarkTreeNode): void {
    console.log('export node', node);
    const html = this.chromeApiService.generateExportBookmarkHtml(node);
    saveAsFile(html, `bookmark-${node.title}.html`);
  }

  handleError(error): void {
    console.error(error);
    alert(error.code);
  }

  hasChild = (_: number, node: BookmarkTreeNode) => !!node.children && node.children.length > 0;

  private init(): void {
    this.chromeApiService.getTreeBookmarks()
      .then(list => {
        this.dataSource.data = list;
      });
  }

}
