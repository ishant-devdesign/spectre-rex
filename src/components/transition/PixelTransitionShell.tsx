/**
 * Transition compositor.
 *
 * Two root-level siblings that survive route reconciliation: the pixel
 * wipe canvas, and the dragon on its own layer. The dragon deliberately
 * sits OUTSIDE the wipe container — `difference` blending composites
 * against the backdrop of its stacking context, so wrapping it in an
 * isolated group would trap it against the wipe alone and let it vanish
 * the moment those pixels clear. As a body-level sibling it inverts
 * whatever is beneath it, black cover or live page, and stays legible
 * throughout.
 */
export function PixelTransitionShell() {
  return (
    <>
      <div
        data-pixel-transition
        data-phase="idle"
        aria-hidden="true"
        className="invisible fixed inset-0 z-[121] overflow-hidden opacity-0"
        style={{ pointerEvents: "none" }}
      >
        <canvas data-pixel-canvas className="absolute inset-0 h-full w-full" />
      </div>
      <canvas
        data-dragon-canvas
        aria-hidden="true"
        className="invisible fixed inset-0 z-[122] h-full w-full opacity-0"
        style={{ pointerEvents: "none", mixBlendMode: "difference" }}
      />
    </>
  );
}
