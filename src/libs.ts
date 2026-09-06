import type { BgaJumpTo as BgaJumpToType } from "../bga-jump-to";
import type { BgaAnimations as BgaAnimationsType } from "../bga-animations";

const BgaJumpTo: typeof BgaJumpToType = await globalThis.importEsmLib('bga-jump-to', '1.x');
const BgaAnimations: typeof BgaAnimationsType = await globalThis.importEsmLib('bga-animations', '1.x');

export { BgaJumpTo, BgaAnimations };
