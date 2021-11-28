import { Observable } from 'rxjs';

export function createMutationObserver(): Observable<MutationRecord[]> {
  return new Observable(resolve => {
    const observer = new MutationObserver((events) => {
      resolve.next(events);
    });

    observer.observe(document.querySelector('body'), {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  });
}
