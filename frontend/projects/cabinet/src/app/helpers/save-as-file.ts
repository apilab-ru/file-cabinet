export function saveAsFile(data: string, fileName: string): void {
  const a = document.createElement('a');
  document.body.appendChild(a);
  const blob = new Blob([data], { type: 'octet/stream' });
  a.href = window.URL.createObjectURL(blob);
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(a.href);
  a.remove();
}
