const nameExp = /([a-zA-zа-яА-яёЁ\s0-9:,.-]*)/;

export function trimTitle(title: string, func?: string): string {
  if (func) {
    return Function('const func = ' + func + '; return func(arguments[0])')(title);
  }

  return title.match(nameExp)[0]
    .replace('фильм', '')
    .replace('аниме', '')
    .replace('смотреть онлайн', '')
    .trim();
}
