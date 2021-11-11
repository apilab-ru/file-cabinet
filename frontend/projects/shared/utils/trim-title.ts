const nameExp = /([a-zA-zа-яА-яёЁ\s0-9:]*)/;

export function trimTitle(title: string, func?: string): string {
  if (func) {
    return eval(func)(title);
  }

  return title.match(nameExp)[0].replace('фильм', '').trim();
}
