function circle_number_modulo(ctx, seq, params) {
    let modulo = +params["circle-number-modulo"][0];
    let radius = Math.min(ctx.width, ctx.height) * 0.4;
    let node_radius = 4;

    let x = ctx.width / 2;
    let y = ctx.height / 2;

    ctx.beginPath();
    ctx.ellipse(x, y, radius, radius, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = params.colors.main;
    ctx.lineWidth = 2;
    ctx.stroke();

    if (!modulo) return;

    let pattern = [];

    function is_pattern_repeated() {
        if (pattern.length % 2) return false;
        let left = pattern.slice(0, pattern.length / 2);
        let right = pattern.slice(pattern.length / 2);

        for (let n = 0; n < left.length; n++) {
            if (left[n] != right[n]) return false;
        }

        return true;
    }

    for (let n = 0; (n < modulo || !is_pattern_repeated()) && n <= modulo ** 2; n++) {
        let next = seq.next();
        if (next.value !== undefined) {
            pattern.push(Number(next.value % BigInt(modulo)));
        } else {
            break;
        }
        if (next.done) break;
    }

    let non_clip = ctx.save();

    // Draw lines
    ctx.beginPath();

    ctx.ellipse(x, y, radius, radius, 0, 0, 2 * Math.PI);
    ctx.clip();

    ctx.beginPath();

    for (let n = 0; n < pattern.length; n++) {
        let v = pattern[n];
        let dx = radius * Math.cos(2 * Math.PI * v / modulo - Math.PI / 2);
        let dy = radius * Math.sin(2 * Math.PI * v / modulo - Math.PI / 2);
        if (n == 0) {
            ctx.moveTo(x + dx, y + dy);
        } else {
            ctx.lineTo(x + dx, y + dy);
        }
    }
    ctx.stroke();

    ctx.restore(non_clip);

    // Draw nodes
    for (let n = 0; n < modulo; n++) {
        let dx = radius * Math.cos(2 * Math.PI * n / modulo - Math.PI / 2);
        let dy = radius * Math.sin(2 * Math.PI * n / modulo - Math.PI / 2);
        ctx.beginPath();
        ctx.ellipse(x + dx, y + dy, node_radius, node_radius, 0, 0, 2 * Math.PI);
        ctx.fillStyle = params.colors.bg;
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
    }
}
circle_number_modulo.display_name = "Circle & Modulo";
circle_number_modulo.settings = `
<li>
    Trace {var} modulo
    <span class="input circle-number-modulo" contenteditable="true">10</span>
    on a numbered circle
</li>
`;

const VIZ = {
    circle_number_modulo,
};
