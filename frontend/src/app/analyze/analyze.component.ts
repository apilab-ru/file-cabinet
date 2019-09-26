import { Component, OnInit } from '@angular/core';
import { ChromeApiService } from '../services/chrome-api.service';
import { NestedTreeControl } from '@angular/cdk/tree';
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import { MatTreeNestedDataSource } from '@angular/material';
import { LibraryService } from '../services/library.service';

interface TreeItem extends BookmarkTreeNode {
  removed?: boolean;
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
  ) {
  }

  ngOnInit() {
    this.init();
  }

  getIcon(node: TreeItem): string {
    const [protocol, domain] = node.url.split('/').filter(item => item);
    return protocol + '//' + domain + '/favicon.ico';
  }

  removeNode(node: TreeItem): void {
    this.chromeApiService
      .removeBookmark(node.id)
      .then(() => {
        node.removed = true;
      });
  }

  onAssign(patch: string, node: TreeItem): void {
    console.log('on assign', patch, node);
    this.libraryService
      .addItemByName(patch, node.title)
      .subscribe(() => {
        alert('Ok!');
        //this.removeNode(node);
      });
  }

  hasChild = (_: number, node: BookmarkTreeNode) => !!node.children && node.children.length > 0;

  private init(): void {
    this.chromeApiService.getTreeBookmarks()
      .then(list => {
        console.log('list', list, this.treeControl);
        this.dataSource.data = list;
      });
  }

}
