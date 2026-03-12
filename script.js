class GrahamScanVisualizer {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.points = [];
        this.sortedPoints = [];
        this.hull = [];

        this.p0 = null;
        this.scanIndex = 0;

        this.isAnimating = false;
        this.isPaused = false;
        this.currentStep = 0;
        this.phase = "idle";

        this.init();
    }

    init() {
        this.attachEvents();
        this.generatePoints();
    }

    attachEvents() {
        document.getElementById("generateBtn").onclick = () => this.generatePoints();
        document.getElementById("startBtn").onclick = () => this.start();
        document.getElementById("pauseBtn").onclick = () => this.togglePause();
        document.getElementById("stepBtn").onclick = () => this.step();
        document.getElementById("resetBtn").onclick = () => this.reset();

        document.getElementById("pointCount").oninput = (e) => {
            this.count = +e.target.value;
            document.getElementById("countDisplay").textContent = this.count;
            this.generatePoints();
        };
    }

    generatePoints() {
        this.count = this.count || 25;

        const margin = 60;

        this.points = Array.from({ length: this.count }, (_, i) => ({
            x: margin + Math.random() * (this.canvas.width - 2 * margin),
            y: margin + Math.random() * (this.canvas.height - 2 * margin),
            id: i
        }));

        this.reset();
        this.render();
    }

    reset() {
        this.isAnimating = false;
        this.isPaused = false;

        this.currentStep = 0;
        this.phase = "idle";

        this.sortedPoints = [];
        this.hull = [];

        this.scanIndex = 0;
        this.p0 = null;

        this.updateUI();
        this.render();
    }

    start() {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.isPaused = false;
        this.phase = "p0";

        this.runNextStep();
    }

    togglePause() {
        this.isPaused = !this.isPaused;

        if (!this.isPaused) this.runNextStep();
    }

    step() {
        if (this.phase === "idle") this.start();
        else this.runNextStep();
    }

    runNextStep() {
        if (this.isPaused || !this.isAnimating) return;

        this.currentStep++;

        if (this.phase === "p0") {

            this.findP0();
            this.phase = "sort";

            this.updateStatus("🔍 P₀ found! Starting polar sort...");

        } else if (this.phase === "sort") {

            this.polarSort();

            this.hull = [this.sortedPoints[0], this.sortedPoints[1]];
            this.scanIndex = 2;

            this.phase = "scan";

            this.updateStatus("🔄 Polar sort complete! Building hull...");

        } else if (this.phase === "scan") {

            if (this.scanNextPoint()) {

                this.phase = "done";
                this.isAnimating = false;

                this.updateStatus("🎉 CONVEX HULL COMPLETE!");
            }
        }

        this.render();
        this.updateUI();

        if (this.isAnimating && this.phase !== "done") {
            setTimeout(() => this.runNextStep(), 1000);
        }
    }

    findP0() {

        let minIdx = 0;

        for (let i = 1; i < this.points.length; i++) {

            if (
                this.points[i].y < this.points[minIdx].y ||
                (this.points[i].y === this.points[minIdx].y &&
                    this.points[i].x < this.points[minIdx].x)
            ) {
                minIdx = i;
            }
        }

        // swap to index 0
        [this.points[0], this.points[minIdx]] = [
            this.points[minIdx],
            this.points[0]
        ];

        this.p0 = this.points[0];
    }

    polarSort() {

        const p0 = this.p0;

        const others = this.points.slice(1);

        others.sort((p, q) => {

            const cross =
                (p.x - p0.x) * (q.y - p0.y) -
                (p.y - p0.y) * (q.x - p0.x);

            if (cross === 0) {

                const distP =
                    (p.x - p0.x) ** 2 + (p.y - p0.y) ** 2;

                const distQ =
                    (q.x - p0.x) ** 2 + (q.y - p0.y) ** 2;

                return distP - distQ;
            }

            return cross > 0 ? -1 : 1;
        });

        this.sortedPoints = [p0, ...others];
    }

    scanNextPoint() {

        if (this.scanIndex >= this.sortedPoints.length)
            return true;

        const p = this.sortedPoints[this.scanIndex];

        while (this.hull.length >= 2) {

            const b = this.hull[this.hull.length - 1];
            const a = this.hull[this.hull.length - 2];

            const cross =
                (b.x - a.x) * (p.y - a.y) -
                (b.y - a.y) * (p.x - a.x);

            if (cross <= 0) {
                this.hull.pop();
            } else {
                break;
            }
        }

        this.hull.push(p);

        this.scanIndex++;

        this.updateStatus(
            `Scanning point ${p.id} (${this.scanIndex}/${this.sortedPoints.length})`
        );

        return false;
    }

    updateStatus(text) {

        document.getElementById("stepDescription").textContent = text;
        document.getElementById("stepCounter").textContent = this.currentStep;
    }

    updateUI() {

        const done = this.phase === "done";

        document.getElementById("startBtn").disabled = done;
        document.getElementById("pauseBtn").disabled =
            done || !this.isAnimating;
        document.getElementById("stepBtn").disabled = done;

        document.getElementById("generateBtn").disabled =
            this.isAnimating && !this.isPaused;
    }

    render() {

        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        if (this.hull.length > 1) {

            this.ctx.strokeStyle = "#9b59b6";
            this.ctx.fillStyle = "rgba(155,89,182,0.1)";
            this.ctx.lineWidth = 4;

            this.ctx.beginPath();

            this.ctx.moveTo(this.hull[0].x, this.hull[0].y);

            for (let i = 1; i < this.hull.length; i++) {

                this.ctx.lineTo(
                    this.hull[i].x,
                    this.hull[i].y
                );
            }

            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        }

        const pointsToDraw =
            this.phase === "sort"
                ? this.sortedPoints
                : this.points;

        pointsToDraw.forEach((point, i) => {

            let color = "#95a5a6";

            if (point === this.p0) color = "#e67e22";
            else if (this.hull.includes(point)) color = "#9b59b6";
            else if (this.phase === "sort") color = "#3498db";
            else if (
                this.phase === "scan" &&
                i === this.scanIndex
            )
                color = "#f39c12";

            this.ctx.fillStyle = color;
            this.ctx.strokeStyle = "#fff";
            this.ctx.lineWidth = 2;

            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 9, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();

            this.ctx.fillStyle = "#2c3e50";
            this.ctx.font = "bold 12px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";

            this.ctx.fillText(
                point.id,
                point.x,
                point.y
            );
        });

        if (this.p0) {

            this.ctx.strokeStyle = "#e67e22";
            this.ctx.lineWidth = 3;

            this.ctx.beginPath();
            this.ctx.arc(this.p0.x, this.p0.y, 15, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
}

window.addEventListener("load", () => {
    new GrahamScanVisualizer();

});
