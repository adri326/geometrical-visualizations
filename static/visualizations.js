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

function turtle(ctx, seq, params) {
    let modulo = +params["turtle"][0];
    let scale = +params["turtle"][1];
    let n_steps = +params["turtle"][2];

    if (n_steps <= 0) return;
    if (scale <= 0) return;
    if (modulo <= 0) return;

    // Might need to bring this down for more expensive algorithms
    let min_dimension = Math.min(ctx.width, ctx.height);

    let pattern = [];
    let min_bound = [0, 0];
    let max_bound = [0, 0];
    let pos = [0, 0];
    let direction = 0;
    for (let n = 0; n < n_steps; n++) {
        let next = seq.next();
        if (next.value !== undefined) {
            let value = Number(next.value % BigInt(modulo));
            pattern.push(value);
            pos[0] += scale * Math.cos(direction);
            pos[1] += scale * Math.sin(direction);

            // Update bounds
            min_bound[0] = Math.min(min_bound[0], pos[0]);
            min_bound[1] = Math.min(min_bound[1], pos[1]);
            max_bound[0] = Math.max(max_bound[0], pos[0]);
            max_bound[1] = Math.max(max_bound[1], pos[1]);
            direction += ((value / (modulo - 1)) - 0.5) * Math.PI;
        } else {
            break;
        }
        if (next.done) break;
    }

    direction = 0;
    pos = [ctx.width / 2 - (max_bound[0] + min_bound[0]) / 2, ctx.height / 2 - (max_bound[1] + min_bound[1]) / 2];

    ctx.beginPath();
    ctx.moveTo(...pos);
    for (let value of pattern) {
        pos[0] += scale * Math.cos(direction);
        pos[1] += scale * Math.sin(direction);
        direction += ((value / (modulo - 1)) - 0.5) * Math.PI;
        ctx.lineTo(...pos);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = params.colors.main;
    ctx.stroke();
}
turtle.display_name = "Turtle & Modulo";
turtle.settings = `
<li>
    Use {var} modulo
    <span class="variable three">m</span> = <span class="input turtle" contenteditable="true">2</span>
    as kernel for a turtle.
</li>
<li>
    Rotates between 90° left
        ({var} mod <span class="variable three">m</span> = 0)
    and 90° right
        ({var} mod <span class="variable three">m</span> = <span class="variable three">m</span> - 1)
    .
</li>
<li>
    Scale: <span class="input turtle" contenteditable="true">10</span> px/step — Steps: <span class="input turtle" contenteditable="true">1000</span>
</li>
`;

function turtle_mod2(ctx, seq, params) {
    let modulo = +params["turtle"][0];
    let scale = +params["turtle"][1];
    let n_steps = +params["turtle"][2];

    if (n_steps <= 0) return;
    if (scale <= 0) return;
    if (modulo <= 0) return;

    // Might need to bring this down for more expensive algorithms
    let min_dimension = Math.min(ctx.width, ctx.height);

    let pattern = [];
    let min_bound = [0, 0];
    let max_bound = [0, 0];
    let pos = [0, 0];
    let direction = 0;
    for (let n = 0; n < n_steps; n++) {
        let next = seq.next();
        if (next.value !== undefined) {
            let value = Number(next.value % BigInt(modulo));
            pattern.push(value);
            pos[0] += scale * Math.cos(direction);
            pos[1] += scale * Math.sin(direction);

            // Update bounds
            min_bound[0] = Math.min(min_bound[0], pos[0]);
            min_bound[1] = Math.min(min_bound[1], pos[1]);
            max_bound[0] = Math.max(max_bound[0], pos[0]);
            max_bound[1] = Math.max(max_bound[1], pos[1]);
            if (value % 2 == 0) direction -= 0.5 * Math.PI;
            else direction += 0.5 * Math.PI;
        } else {
            break;
        }
        if (next.done) break;
    }

    direction = 0;
    pos = [ctx.width / 2 - (max_bound[0] + min_bound[0]) / 2, ctx.height / 2 - (max_bound[1] + min_bound[1]) / 2];

    ctx.beginPath();
    ctx.moveTo(...pos);
    for (let value of pattern) {
        pos[0] += scale * Math.cos(direction);
        pos[1] += scale * Math.sin(direction);
        if (value % 2 == 0) direction -= 0.5 * Math.PI;
        else direction += 0.5 * Math.PI;
        ctx.lineTo(...pos);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = params.colors.main;
    ctx.stroke();
}
turtle_mod2.display_name = "Turtle mod 2";
turtle_mod2.settings = `
<li>
    Use {var} modulo
    <span class="variable three">m</span> = <span class="input turtle" contenteditable="true">2</span>
    as kernel for a turtle.
</li>
<li>
    Rotates 90° left if
        {var} mod <span class="variable three">m</span> is even
    and 90° right if
        {var} mod <span class="variable three">m</span> is odd
    .
</li>
<li>
    Scale: <span class="input turtle" contenteditable="true">10</span> px/step — Steps: <span class="input turtle" contenteditable="true">1000</span>
</li>
`;

const VIZ = {
    circle_number_modulo,
    turtle,
    turtle_mod2,
};
