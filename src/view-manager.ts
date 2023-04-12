const ZOOM_MAX = 3;
declare const __;

class ViewManager {
    private isDragging: boolean = false;
    private elements: HTMLDivElement[] = [];
    // private rotating: boolean = false;
    private moving: boolean = false;

    constructor(public game: AkropolisGame) {
        if (!dojo.hasClass("ebd-body", "mode_3d")) {
            dojo.addClass("ebd-body", "mode_3d");
            $("globalaction_3d").innerHTML = "2D"; // controls the upper right button
            this.setDefaultView();
        }
    }

    private setDefaultView() {
        (this.game as any).control3dxaxis = 40; // rotation in degrees of x axis (it has a limit of 0 to 80 degrees in the frameword so users cannot turn it upsidedown)
        (this.game as any).control3dzaxis = 0; // rotation in degrees of z axis
        (this.game as any).control3dxpos = -100; // center of screen in pixels
        (this.game as any).control3dypos = -50; // center of screen in pixels
        (this.game as any).control3dscale = 1; // zoom level, 1 is default 2 is double normal size,
        (this.game as any).control3dmode3d = true; // is the 3d enabled
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
        (this.game as any).control3dscale = Math.min(width / expectedWidth, 1);
        this.updateTransformOnElements();
    }

    public draggableElement3d(element: HTMLDivElement) {
        this.elements.push(element);
        element.addEventListener('mousedown', e => this.drag3dMouseDown(e));
        element.addEventListener('mouseup', e => this.closeDragElement3d(e));
        element.addEventListener('mousewheel', e => this.onMouseWheel(e));
        element.addEventListener('contextmenu', e => {            
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        });

        (this.game as any).drag3d = element;
    }

    private drag3dMouseDown(e: MouseEvent) {
        e = e || window.event as MouseEvent;
        if (e.buttons == 2 || e.buttons == 4) {
            dojo.stopEvent(e);
            $("ebd-body").onmousemove = dojo.hitch(this, this.elementDrag3d);
            $("pagesection_gameview").onmouseleave = dojo.hitch(this, this.closeDragElement3d);
            dojo.addClass($("pagesection_gameview"), "grabbinghand");
            this.moving = true;
        }
    }

    private elementDrag3d(e: MouseEvent) {
        e = e || window.event as MouseEvent;
        dojo.stopEvent(e);
        if (e.buttons != 2 && e.buttons != 4) {
            $("ebd-body").onmousemove = null;
            dojo.removeClass($("pagesection_gameview"), "grabbinghand");
            this.moving = false;
        }
        if (!this.isDragging) {
            this.isDragging = true;

            if (e.buttons == 2) {
                const viewportOffset = (e.currentTarget as HTMLElement).getBoundingClientRect();
                let x;
                if ((e.screenY - viewportOffset.top) > (3 * window.innerHeight / 4)) {
                    x = e.movementX;
                } else {
                    x = -1 * e.movementX;
                }
                this.change3d(e.movementY / (-10), 0, 0, x / (-10), 0, true, false);
            } else if (e.buttons == 4) {
                this.change3d(0, e.movementY, e.movementX, 0, 0, true, false);
            }

            this.isDragging = false;
        }
    }

    private closeDragElement3d(evt: MouseEvent) {
        /* stop moving when mouse button is released:*/
        if (evt.buttons == 2 || evt.buttons == 4) {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            $("ebd-body").onmousemove = null;
            dojo.removeClass($("pagesection_gameview"), "grabbinghand");
            this.moving = false;
        }
    }  

    private onMouseWheel(evt: any) {
        dojo.stopEvent(evt);
        if (!this.moving) {
            const d = Math.max(-1, Math.min(1, (evt.wheelDelta || -evt.detail))) * 0.1;
            this.change3d(0, 0, 0, 0, d, true, false);
        }
    }
    
    // override of framework function to apply 3D on each player city instead of the whole view
    public change3d(incXAxis: number, xpos: number, ypos: number, xAxis: number, incScale: number, is3Dactive: boolean, reset: boolean) {
        (this.game as any).control3dscale = Math.min(ZOOM_MAX, (this.game as any).control3dscale);
        if (incScale > 0 && (this.game as any).control3dscale >= ZOOM_MAX) {
            incScale = 0;
        }

        if (is3Dactive == false) {
            (this.game as any).control3dmode3d = !(this.game as any).control3dmode3d;
        }
        if ((this.game as any).control3dmode3d == false) {
            if (dojo.hasClass("ebd-body", "mode_3d")) {
                dojo.removeClass("ebd-body", "mode_3d");
            }
            this.elements.forEach(element => element.style.transform = "rotatex(" + 0 + "deg) translate(" + 0 + "px," + 0 + "px) rotateZ(" + 0 + "deg)");
        } else {
            if (!dojo.hasClass("ebd-body", "mode_3d")) {
                dojo.addClass("ebd-body", "mode_3d");
            }
            dojo.addClass("ebd-body", "enableTransitions");
            (this.game as any).control3dxaxis += incXAxis;
            if ((this.game as any).control3dxaxis >= 80) {
                (this.game as any).control3dxaxis = 80;
            }
            if ((this.game as any).control3dxaxis <= 0) {
                (this.game as any).control3dxaxis = 0;
            }
            if ((this.game as any).control3dscale < 0.5) {
                (this.game as any).control3dscale = 0.5;
            }
            (this.game as any).control3dzaxis += xAxis;
            (this.game as any).control3dxpos += xpos;
            (this.game as any).control3dypos += ypos;
            (this.game as any).control3dscale += incScale;
            if (reset) {
                this.setDefaultView();
            }
            dojo.toggleClass($("pagesection_gameview"), "view-changed", !reset);
            this.updateTransformOnElements();
        }
    }
    
    private updateTransformOnElements() {
        this.elements.forEach(element => element.style.transform = "rotatex(" + (this.game as any).control3dxaxis + "deg) translate(" + (this.game as any).control3dypos + "px," + (this.game as any).control3dxpos + "px) rotateZ(" + (this.game as any).control3dzaxis + "deg) scale3d(" + (this.game as any).control3dscale + "," + (this.game as any).control3dscale + "," + (this.game as any).control3dscale + ")");
    }
}