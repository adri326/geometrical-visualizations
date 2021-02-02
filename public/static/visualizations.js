function* circle_number(ctx, seq, settings) {
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
        yield true;
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
circle_number.display_name = "Modulus Circle";
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
    ctx.lineWidth = scale < 2 ? 1 : 2;
    ctx.strokeStyle = settings.colors.main;
    ctx.stroke();
}
turtle.display_name = "Turtle modulo m";
turtle.settings = `
<li>
    Use {var} modulo
    <span class="variable three">m</span> = {turtle.modulo=3}
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
    let noop = settings.turtle_mod2.noop;

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
            if (noop && value == 0) continue;
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
        if (noop && value == 0) continue;
        pos[0] += scale * Math.cos(direction);
        pos[1] += scale * Math.sin(direction);
        if (value % 2 == 0) direction -= 0.5 * Math.PI;
        else direction += 0.5 * Math.PI;
        ctx.lineTo(...pos);
    }
    ctx.lineWidth = scale < 2 ? 1 : 2;
    ctx.strokeStyle = settings.colors.main;
    ctx.stroke();
}
turtle_mod2.display_name = "Turtle modulo 2";
turtle_mod2.settings = `
<li>
    Use {var} modulo
    <span class="variable three">m</span> = {turtle_mod2.modulo=10}
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
    Do nothing if {var} mod <span class="variable three">m</span> = 0: {turtle_mod2.noop=yes|no}.
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

function loops(ctx, seq, settings) {
    let max = BigInt(settings.loops.max);
    let min = BigInt(settings.loops.min);
    let n_steps = +settings.loops.steps;

    if (isNaN(n_steps) || n_steps <= 0 || min == max) return;

    let dx = ctx.width / Number(max - min + 2n);

    function pos(value) {
        return [dx * Number(value - min) + dx, ctx.height / 2];
    }

    let last = null;
    let identities = [];
    let pairs = [];

    for (let n = 0; n < n_steps; n++) {
        let next = seq.next();
        if (next.value !== undefined) {
            if (last !== null) {
                if (last === next.value) {
                    // Draw a little circle later
                    if (last >= min && last <= max || next.value >= min && next.value <= max) {
                        if (identities.findIndex(id => id === last) < 0) identities.push(last);
                    }
                } else if (last >= min && last <= max || next.value >= min && next.value <= max) {
                    if (pairs.findIndex(([a, b]) => a === last && b === next.value) == -1) {
                        pairs.push([last, next.value]);
                        // Draw an arc from `last` to `next.value`
                        ctx.beginPath();
                        let [sx, sy] = pos(last);
                        let [ex, ey] = pos(next.value);
                        let sr = last < next.value ? 0 : Math.PI;
                        let er = last < next.value ? Math.PI : 2 * Math.PI;
                        ctx.ellipse(
                            (sx + ex) / 2,
                            (sy + ey) / 2,
                            Math.abs(sx - ex) / 2,
                            Math.abs(sx - ex) / 2,
                            sr,
                            er,
                            0,
                        );
                        ctx.strokeStyle = settings.colors.main;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                }
                last = next.value;
            } else {
                last = next.value;
            }
        }

        if (next.done) break;
    }

    ctx.beginPath();
    ctx.moveTo(...pos(min));
    ctx.lineTo(...pos(max));
    ctx.strokeStyle = settings.colors.main;
    ctx.lineWidth = 2;
    ctx.stroke();

    if (ctx.width / Number(max - min) > 10) {
        for (let x = min; x <= max; x += 1n) {
            ctx.beginPath();
            ctx.ellipse(...pos(x), 3, 3, 0, 2 * Math.PI, 0);
            ctx.fillStyle = settings.colors.main;
            ctx.fill();
        }
        for (let identity of identities) {
            ctx.beginPath();
            ctx.ellipse(...pos(identity), 4, 4, 0, 2 * Math.PI, 0);
            ctx.fillStyle = settings.colors.bg;
            ctx.lineWidth = 2;
            ctx.globalCompositeOperation = "destination-out";
            ctx.fill();
            ctx.globalCompositeOperation = "source-over";
            ctx.stroke();
        }
    }
}
loops.display_name = "Loops";
loops.settings = `
<li>
    Place the {loops.steps=100} first values of {var} on a numbered segment from {loops.min=0} to {loops.max=10};
</li>
<li>
    Draw arcs between adjacent values of {var}; the arc is above the line if the new value is greater than the previous, and below the line otherwise.
</li>
`;

function loops_modulo(ctx, seq, settings) {
    let modulo = BigInt(settings.loops_modulo.modulo);
    let min = BigInt(settings.loops_modulo.min);
    let n_steps = +settings.loops_modulo.steps;

    if (isNaN(n_steps) || n_steps <= 0 || modulo <= 0n || min >= modulo - 1n) return;

    let dx = Math.min(ctx.width, ctx.height) / Number(modulo + 2n);
    let sx = ctx.width / 2 - dx * Number(modulo - min - 1n) / 2;

    function pos(value) {
        return [dx * Number((value % modulo) - min) + sx, ctx.height / 2];
    }

    let last = null;
    let identities = [];
    let pairs = [];

    for (let n = 0; n < n_steps; n++) {
        let next = seq.next();
        if (next.value !== undefined) {
            if (last !== null) {
                if (last === next.value) {
                    // Draw a little circle later
                    if (identities.findIndex(id => id === last) < 0) identities.push(last);
                } else {
                    if (pairs.findIndex(([a, b]) => a === (last % modulo) && b === (next.value % modulo)) == -1) {
                        pairs.push([last % modulo, next.value % modulo]);
                        // Draw an arc from `last` to `next.value`
                        ctx.beginPath();
                        let [sx, sy] = pos(last);
                        let [ex, ey] = pos(next.value);
                        let sr = sx < ex ? 0 : Math.PI;
                        let er = sx < ex ? Math.PI : 2 * Math.PI;
                        ctx.ellipse(
                            (sx + ex) / 2,
                            (sy + ey) / 2,
                            Math.abs(sx - ex) / 2,
                            Math.abs(sx - ex) / 2,
                            sr,
                            er,
                            0,
                        );
                        ctx.strokeStyle = settings.colors.main;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                }
                last = next.value;
            } else {
                last = next.value;
            }
        }

        if (next.done) break;
    }

    ctx.beginPath();
    ctx.moveTo(...pos(min));
    ctx.lineTo(...pos(modulo - 1n));
    ctx.strokeStyle = settings.colors.main;
    ctx.lineWidth = 2;
    ctx.stroke();

    if (dx > 10) {
        for (let x = min; x < modulo; x += 1n) {
            ctx.beginPath();
            ctx.ellipse(...pos(x), 3, 3, 0, 2 * Math.PI, 0);
            ctx.fillStyle = settings.colors.main;
            ctx.fill();
        }
        for (let identity of identities) {
            ctx.beginPath();
            ctx.ellipse(...pos(identity), 4, 4, 0, 2 * Math.PI, 0);
            ctx.fillStyle = settings.colors.bg;
            ctx.lineWidth = 2;
            ctx.globalCompositeOperation = "destination-out";
            ctx.fill();
            ctx.globalCompositeOperation = "source-over";
            ctx.stroke();
        }
    }
}
loops_modulo.display_name = "Loops (Modulo)";
loops_modulo.settings = `
<li>
    Place the {loops_modulo.steps=100} first values of {var} modulo
    <span class="variable three">m</span> = {loops_modulo.modulo=23}
    on a numbered segment from {loops_modulo.min=0} to <span class="variable three">m</span> - 1;
</li>
<li>
    Draw arcs between values of {var}; the arc is above the line if the new value is greater than the previous, and below the line otherwise.
</li>
`;

const VIZ = {
    circle_number,
    turtle_mod2,
    turtle,
    bar_graph,
    loops,
    loops_modulo,
};
