const ZOOM_MAX = 3;

class ViewManager {
    private isdragging: boolean;
    private elements: HTMLDivElement[] = [];

    constructor(public game: AkropolisGame) {
        if (!dojo.hasClass("ebd-body", "mode_3d")) {
            dojo.addClass("ebd-body", "mode_3d");
            $("globalaction_3d").innerHTML = "2D"; // controls the upper right button
            (game as any).control3dxaxis = 40; // rotation in degrees of x axis (it has a limit of 0 to 80 degrees in the frameword so users cannot turn it upsidedown)
            (game as any).control3dzaxis = 0; // rotation in degrees of z axis
            (game as any).control3dxpos = -100; // center of screen in pixels
            (game as any).control3dypos = -50; // center of screen in pixels
            (game as any).control3dscale = 1; // zoom level, 1 is default 2 is double normal size,
            (game as any).control3dmode3d = true; // is the 3d enabled
        }
    }

    public draggableElement3d(element: HTMLDivElement) {
        this.elements.push(element);
        element.addEventListener('mousedown', e => this.drag3dMouseDown(e));
        element.addEventListener('mouseup', e => this.closeDragElement3d(e));
        element.addEventListener('mousewheel', e => this.onMouseWheel(e));

        element.oncontextmenu = () => false;
        (this.game as any).drag3d = element;
    }

    private drag3dMouseDown(e: MouseEvent) {
        e = e || window.event as MouseEvent;
        if (e.which == 3) {
            dojo.stopEvent(e);
            $("ebd-body").onmousemove = dojo.hitch(this, this.elementDrag3d);
            $("pagesection_gameview").onmouseleave = dojo.hitch(this, this.closeDragElement3d);
            dojo.addClass($("pagesection_gameview"), "grabbinghand");
        }
    }

    private elementDrag3d(e: MouseEvent) {
        e = e || window.event as MouseEvent;
        dojo.stopEvent(e);
        if (!this.isdragging) {
            this.isdragging = true;
            const viewportOffset = (e.currentTarget as HTMLElement).getBoundingClientRect();
            let x;
            if ((e.screenY - viewportOffset.top) > (3 * window.innerHeight / 4)) {
                x = e.movementX;
            } else {
                x = -1 * e.movementX;
            }
            (this.game as any).change3d(e.movementY / (-10), 0, 0, x / (-10), 0, true, false);
            this.isdragging = false;
        }
    }

    private closeDragElement3d(evt: MouseEvent) {
        /* stop moving when mouse button is released:*/
        if (evt.which == 3) {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            $("ebd-body").onmousemove = null;
            dojo.removeClass($("pagesection_gameview"), "grabbinghand");
        }
    }  

    private onMouseWheel(evt: any) {
        dojo.stopEvent(evt);
        const d = Math.max(-1, Math.min(1, (evt.wheelDelta || -evt.detail))) * 0.1;
        this.change3d(0, 0, 0, 0, d, true, false);
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
            $("ingame_menu_3d_label").innerHTML = __("lang_mainsite", "3D mode");
            this.elements.forEach(element => element.style.transform = "rotatex(" + 0 + "deg) translate(" + 0 + "px," + 0 + "px) rotateZ(" + 0 + "deg)");
        } else {
            if (!dojo.hasClass("ebd-body", "mode_3d")) {
                dojo.addClass("ebd-body", "mode_3d");
            }
            dojo.addClass("ebd-body", "enableTransitions");
            $("ingame_menu_3d_label").innerHTML = __("lang_mainsite", "2D mode");
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
            if (reset == true) {
                (this.game as any).control3dxaxis = 0;
                (this.game as any).control3dzaxis = 0;
                (this.game as any).control3dxpos = 0;
                (this.game as any).control3dypos = 0;
                (this.game as any).control3dscale = 1;
            }
            this.elements.forEach(element => element.style.transform = "rotatex(" + (this.game as any).control3dxaxis + "deg) translate(" + (this.game as any).control3dypos + "px," + (this.game as any).control3dxpos + "px) rotateZ(" + (this.game as any).control3dzaxis + "deg) scale3d(" + (this.game as any).control3dscale + "," + (this.game as any).control3dscale + "," + (this.game as any).control3dscale + ")");
        }
    },  
}