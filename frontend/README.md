# FileCabinet
Storybook from https://storybook.js.org/tutorials/intro-to-storybook/angular/en/get-started/

## Development server
run:
npm run start:cabinet
npm run start:popup
npm run start:ts
and copy frontend\projects\extension to extension

## Build
npm run build

## After build
Need remove media="print" onload="this.media='all'" or set compiler optimisation options
inlineCritical = false, more detail https://github.com/angular/angular-cli/issues/20864
