/**
 * Imperative bridge between the DOM chrome (buttons, keyboard) and the r3f
 * camera. The controller registers these on mount; the UI only calls them.
 */
export const cameraBridge = {
  dolly: (_factor: number) => {},
  zoomIn: () => {},
  zoomOut: () => {},
  reset: () => {},
  focus: (_id: string) => {},
};
