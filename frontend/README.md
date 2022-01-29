# FileCabinet
Storybook from https://storybook.js.org/tutorials/intro-to-storybook/angular/en/get-started/

[Extension](https://chrome.google.com/webstore/detail/file-cabinet/poiackckjbminlmppejhfkmjkfpfegkd?hl=ru)

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

# Additional
npm install copyfiles -g

## Tools
[Sentry](https://sentry.io/organizations/apilab/issues/?project=6103397)

## SourceMap
--plugin ~build-customization-plugin.js
https://angularquestions.com/2021/05/10/chrome-extension-development-with-angular-how-to-include-source-maps/

