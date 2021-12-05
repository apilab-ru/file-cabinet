export enum Breakpoint {
  fullHd = 'fullHd',
  hd = 'hd',
  tabletWide = 'tabletWide',
  mobile = 'mobile',
}

export const BreakpointSize = {
  [Breakpoint.fullHd]: 1800,
  [Breakpoint.hd]: 1280,
  [Breakpoint.tabletWide]: 1020,
  [Breakpoint.mobile]: 0,
};
