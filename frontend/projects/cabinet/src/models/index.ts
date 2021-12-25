/// <reference types="chrome"/>

export * from '@server/models/index';
export * from '@shared/models/navigation';
export * from './library';
export * from './clever-search';
export * from '../../../shared/utils/utils';

declare global {
  interface Window {
    chrome: typeof chrome;
  }
}


