function circle_number(ctx, seq, settings) {
    let modulo = +settings.circle_number.modulo;
    let radius = Math.min(ctx.width, ctx.height) * 0.4;
    let node_radius = 4;

    let x = ctx.width / 2;
    let y = ctx.height / 2;

    ctx.beginPath();
    ctx.ellipse(x, y, radius, radius, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = settings.colors.main;
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
        ctx.fillStyle = settings.colors.bg;
        ctx.lineWidth = 2;
        ctx.globalCompositeOperation = "destination-out";
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
        ctx.stroke();
    }
}
circle_number.display_name = "Circle & Modulo";
circle_number.settings = `
<li>
    Trace {var} modulo
    {circle_number.modulo=10}
    on a numbered circle
</li>
`;

function turtle(ctx, seq, settings) {
    let modulo = +settings.turtle.modulo;
    let scale = +settings.turtle.scale;
    let n_steps = +settings.turtle.steps;

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

    if (modulo == 2 || modulo == 3) {
        pos[0] = Math.round(pos[0]);
        pos[1] = Math.round(pos[1]);
    }

    ctx.beginPath();
    ctx.moveTo(...pos);
    for (let value of pattern) {
        pos[0] += scale * Math.cos(direction);
        pos[1] += scale * Math.sin(direction);
        direction += ((value / (modulo - 1)) - 0.5) * Math.PI;
        if (modulo < 6) {
            ctx.lineTo(Math.round(pos[0]), Math.round(pos[1]));
        } else {
            ctx.lineTo(...pos);
        }
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = settings.colors.main;
    ctx.stroke();
}
turtle.display_name = "Turtle & Modulo";
turtle.settings = `
<li>
    Use {var} modulo
    <span class="variable three">m</span> = {turtle.modulo=2}
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
    Scale: {turtle.scale=10} px/step — Steps: {turtle.steps=1000}
</li>
`;

function turtle_mod2(ctx, seq, settings) {
    let modulo = +settings.turtle_mod2.modulo;
    let scale = +settings.turtle_mod2.scale;
    let n_steps = +settings.turtle_mod2.steps;

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

    pos[0] = Math.round(pos[0]);
    pos[1] = Math.round(pos[1]);

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
    ctx.strokeStyle = settings.colors.main;
    ctx.stroke();
}
turtle_mod2.display_name = "Turtle mod 2";
turtle_mod2.settings = `
<li>
    Use {var} modulo
    <span class="variable three">m</span> = {turtle_mod2.modulo=3}
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
    Scale: {turtle_mod2.scale=10} px/step — Steps: {turtle_mod2.steps=1000}
</li>
`;

function bar_graph(ctx, seq, settings) {
    let modulo = BigInt(settings.bar_graph.modulo);
    let spacing = +settings.bar_graph.spacing;
    let node_radius = 4;

    let bottom = ctx.height * Number(modulo) / Number(modulo + 2n);

    if (modulo <= 0 || isNaN(spacing) || spacing <= 0) return;

    for (let x = 0; x < ctx.width - spacing / 2; x += spacing) {
        let next = seq.next();
        if (next.value !== undefined) {
            let y = Number(next.value % modulo) / Number(modulo + 2n) * ctx.height;
            ctx.beginPath();
            ctx.moveTo(x + spacing / 2, bottom);
            ctx.lineTo(x + spacing / 2, bottom - y);
            ctx.lineWidth = 2;
            ctx.strokeStyle = settings.colors.main;
            ctx.stroke();

            // Draw little node
            if (spacing > 5) {
                ctx.beginPath();
                ctx.ellipse(x + spacing / 2, bottom - y, node_radius, node_radius, 0, 0, 2 * Math.PI);
                ctx.fillStyle = settings.colors.bg;
                ctx.strokeStyle = settings.colors.main;
                ctx.lineWidth = 2;
                ctx.globalCompositeOperation = "destination-out";
                ctx.fill();
                ctx.globalCompositeOperation = "source-over";
                ctx.stroke();
            }
        }
        if (next.done) break;
    }
}
bar_graph.display_name = "Bar Graph";
bar_graph.settings = `
<li>
    Display {var} modulo {bar_graph.modulo=10} on a bar graph.
</li>
<li>
    Spacing between the bars: {bar_graph.spacing=20} px.
</li>
`;

const VIZ = {
    circle_number,
    turtle,
    turtle_mod2,
    bar_graph,
};
