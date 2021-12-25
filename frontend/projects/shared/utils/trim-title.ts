import { captureException } from '@sentry/angular';

const nameExp = /([a-zA-zа-яА-яёЁ\s0-9:,.-]*)/;

export function trimTitle(title: string, func?: string): string {
  if (func) {
    try {
      return Function('const func = ' + func + '; return func(arguments[0])')(title);
    } catch (e) {
      captureException(e);
    }
  }

  return title.match(nameExp)[0]
    .replace('фильм', '')
    .replace('аниме', '')
    .replace('смотреть онлайн', '')
    .trim();
}
