export class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = 0;
        this.fps = 0;
        this.lastTime = performance.now();
    }
    update() {
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = now;
        }
    }
    getFPS() {
        return this.fps;
    }
}
export const getDynamicMaxEntities = () => {
    const width = window.innerWidth;
    if (width <= 480) {
        return 80;
    }
    else if (width <= 768) {
        return 120;
    }
    else {
        return 200;
    }
};
