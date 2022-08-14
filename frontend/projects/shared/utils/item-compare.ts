import { LibraryItem } from '../../../../server/src/models';
import { MediaCompareData } from '@shared/models/media-compare';

export function itemCompare(first: LibraryItem, second: LibraryItem): boolean {
  return (!!first.item.shikimoriId && first.item.shikimoriId === second.item.shikimoriId)
    || (!!first.item.imdbId && first.item.imdbId === second.item.imdbId)
    || (!first.item.imdbId && !first.item.shikimoriId && !!first.item.shikimoriId && first.item.shikimoriId === second.item.shikimoriId);
}

export function mediaCompare(first: MediaCompareData, second: MediaCompareData): boolean {
  return (!!first.shikimoriId && first.shikimoriId === second.shikimoriId)
    || (!!first.imdbId && first.imdbId === second.imdbId);
}
