import type { BgaAnimations as BgaAnimationsType } from "../bga-animations";

const [BgaJumpTo] = await globalThis.importDojoLibs([
    g_gamethemeurl + 'modules/js/bga-jump-to.js',
]);
const BgaAnimations: typeof BgaAnimationsType = await globalThis.importEsmLib('bga-animations', '1.x');

export { BgaJumpTo, BgaAnimations };
