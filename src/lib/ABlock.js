
import { Box2, Color } from "three/webgpu";


/**
 * ABlock class
 * contains infos about a block, that is one top and one bottom mesh
 */
export class ABlock {

    static LIGHT_COLORS = [
        new Color(0xffffff),
        new Color(0xcccccc),
        new Color(0xaaaaaa),
        new Color(0x999999),
        new Color(0x086ff0),
    ];

    static DARK_COLORS = [
        new Color(0x101010),
        new Color(0x181818),
        new Color(0x202020),
        new Color(0x282828),
        new Color(0xbe185d),
    ];

    static ID = 0;
    static LIGHT_BASE_COLOR = new Color(0x999999);
    static DARK_BASE_COLOR = new Color(0x000000);

    id = ABlock.ID++;
    typeBottom = 0;
    typeTop = 0;
    box = new Box2();
    height = 1;
    rotation = 0;
    topColorIndex = 0;

    topColor = ABlock.LIGHT_COLORS[this.topColorIndex];
    baseColor = ABlock.LIGHT_BASE_COLOR;

    setTopColorIndex(index) {
        this.topColorIndex = index;
        this.topColor = ABlock.LIGHT_COLORS[this.topColorIndex];
    }
}