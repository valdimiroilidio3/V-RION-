/**
 * Shared registry between the DOM hotspot buttons (rendered outside the
 * canvas) and the projector (inside the canvas). Keeps accessibility and crisp
 * text on the DOM side while the projection stays in the render loop.
 */
export const hotspotElements = new Map<string, HTMLButtonElement>();
