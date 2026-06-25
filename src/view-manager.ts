import { Game } from "./Game";

declare const __;

export class ViewManager {
    private static readonly DEFAULT_VIEW = {
        xAxis: 40,
        zAxis: 0,
        xPos: -100,
        yPos: -50,
        zoom: 1,
        maxZoom: 3,
    };

    private elements: HTMLDivElement[] = [];

    constructor(public game: Game) {
        this.setDefaultView();

        document.querySelectorAll('.control3d_command').forEach(button => button.addEventListener('click', () => {
            document.getElementById("pagesection_gameview").classList.toggle("view-changed", true);
        }));
    }

    private setDefaultView() {
        this.game.bga.display3D.init3d({
            elements: this.elements,
            view: ViewManager.DEFAULT_VIEW,
            draggable: true,
            zoomByWheel: true,
        });
    }

    public resetView() {
        this.change3d(0, 0, 0, 0, 0, true, true);
        this.fitCitiesToView();
    }

    public fitCitiesToView() {
        let maxSpan = 0;
        this.elements.forEach(element => {
            const tiles = Array.from(element.querySelectorAll('.tile:not(.preview)')) as HTMLElement[];
            let minX = null;
            let maxX = null;
            tiles.forEach(tile => {
                const rect = tile.getBoundingClientRect();
                if (minX == null || rect.x < minX) {
                    minX = rect.x;
                }
                if (maxX == null || (rect.x + rect.width) > maxX) {
                    maxX = rect.x + rect.width;
                }
            });
            if ((maxX - minX) > maxSpan) {
                maxSpan = maxX - minX;
            }
        });

        if (!maxSpan) {
            return;
        }

        const expectedWidth = maxSpan + 50;
        const width = this.elements[0].clientWidth;
        const display3D = this.game.bga.display3D;
        const targetScale = Math.min(width / expectedWidth, 1);
        display3D.setZoom(targetScale);
    }

    public draggableElement3d(element: HTMLDivElement) {
        this.elements.push(element);
        this.game.bga.display3D.addElements([element]);
    }
    
    // override of framework function to apply 3D on each player city instead of the whole view
    public change3d(incXAxis: number, xpos: number, ypos: number, xAxis: number, incScale: number, is3Dactive: boolean, reset: boolean) {
        if (is3Dactive != false) {
            const display3D = this.game.bga.display3D;
            reset ? this.setDefaultView() : display3D.change3d(incXAxis, xpos, ypos, xAxis, incScale);
            document.getElementById("pagesection_gameview").classList.toggle("view-changed", !reset);
        }
    }
}
