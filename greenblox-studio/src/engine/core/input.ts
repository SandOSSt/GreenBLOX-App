/**
 * Shared runtime input state.
 *
 * The ViewportCanvas fills it from keyboard events; the main physics
 * loop reads it every tick to drive the character controller. This
 * decouples input polling from the physics rate and gets rid of the
 * "cell = velocity" latency that key-repeat introduces.
 */
export const inputState = {
  pressed: new Set<string>(),
  jumpQueued: false,
};
