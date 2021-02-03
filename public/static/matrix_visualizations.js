function matrix_odd(ctx, mat, settings, exp) {
    let modulo = BigInt(settings.matrix_odd.modulo);
    let evenness = settings.matrix_odd.evenness;

    if (modulo <= 0n) return;

    return per_tile(ctx, mat, settings, exp, (vx, vy, dx, dy, value) => {
        value = value % modulo;
        if ((value % 2n == 0n) === evenness) {
            ctx.fillStyle = settings.colors.main;
            ctx.fillRect(vx, vy, dx, dy);
        }
    });
}
matrix_gt.generator = true;
matrix_odd.display_name = "Matrix Evenness";
matrix_odd.settings = `
    <li>
        Display {var} modulo <span class="variable two">m</span> = {matrix_odd.modulo=3} as a matrix,
        coloring a cell iff {var} mod <span class="variable two">m</span> is {matrix_odd.evenness=even|odd}.
    </li>
`;

function matrix_multiple(ctx, mat, settings, exp) {
    let modulo = BigInt(settings.matrix_multiple.modulo);
    let search = BigInt(settings.matrix_multiple.value);

    if (modulo <= 0n) return;

    return per_tile(ctx, mat, settings, exp, (vx, vy, dx, dy, value) => {
        if (value % modulo == search) {
            ctx.fillStyle = settings.colors.main;
            ctx.fillRect(vx, vy, dx, dy);
        }
    });
}
matrix_gt.generator = true;
matrix_multiple.display_name = "Matrix Multiple";
matrix_multiple.settings = `
    <li>
        Display {var} modulo <span class="variable two">m</span> = {matrix_multiple.modulo=3} as a matrix,
        coloring a cell iff {var} mod <span class="variable two">m</span> = {matrix_multiple.value=0}.
    </li>
`;

function matrix_gradient(ctx, mat, settings, exp) {
    let modulo = BigInt(settings.matrix_gradient.modulo);

    if (modulo <= 1n) return;

    function color(v) {
        let [sr, sg, sb] = settings.colors.bg
          .slice(1)
          .match(/[0-9a-f]{2}/g)
          .map(x => Number.parseInt(x, 16) / 255);

        let [er, eg, eb] = settings.colors.main
          .slice(1)
          .match(/[0-9a-f]{2}/g)
          .map(x => Number.parseInt(x, 16) / 255);

        let r = Math.floor(Math.sqrt((sr * sr) * (1 - v) + (er * er) * v) * 255);
        let g = Math.floor(Math.sqrt((sg * sg) * (1 - v) + (eg * eg) * v) * 255);
        let b = Math.floor(Math.sqrt((sb * sb) * (1 - v) + (eb * eb) * v) * 255);

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    return per_tile(ctx, mat, settings, exp, (vx, vy, dx, dy, value) => {
        value = Math.max(Number(value % modulo), 0);
        ctx.fillStyle = color(value / (Number(modulo) - 1));
        ctx.fillRect(vx, vy, dx, dy);
    });
}
matrix_gt.generator = true;
matrix_gradient.display_name = "Matrix Gradient";
matrix_gradient.settings = `
    <li>
        Display {var} modulo <span class="variable two">m</span> = {matrix_gradient.modulo=4} as a matrix,
        coloring each cell with a gradient, based on {var} mod <span class="variable two">m</span>.
    </li>
`;

function matrix_gt(ctx, mat, settings, exp) {
    let min = BigInt(settings.matrix_gt.min);

    return per_tile(ctx, mat, settings, exp, (vx, vy, dx, dy, value) => {
        if (value >= min) {
            ctx.fillStyle = settings.colors.main;
            ctx.fillRect(vx, vy, dx, dy);
        }
    });
}
matrix_gt.generator = true;
matrix_gt.display_name = "Matrix (≥)";
matrix_gt.settings = `
    <li>
        Display {var} as a matrix,
        coloring each cell iff {var} ≥ {matrix_gt.min=1}.
    </li>
`;

function* matrix_gradient_auto(ctx, mat, settings, exp) {
    if (mat.next) {
        let v = mat.next();
        while (!v.done) yield v = mat.next();
        mat = v.value;
    }
    if (mat.length == 0 || mat[0].length == 0) return; // Empty matrix
    let [sx, sy, dx, dy, width, height] = fit_matrix(ctx, mat, settings, exp);

    let min = null, max = null;

    for (let y = 0; y < mat.length; y++) {
        for (let x = 0; x < mat[0].length; x++) {
            if (min == null || mat[y][x] < min) {
                min = mat[y][x];
            }
            if (max == null || mat[y][x] > max) {
                max = mat[y][x];
            }
        }
    }

    function color(v) {
        let [sr, sg, sb] = settings.colors.bg
          .slice(1)
          .match(/[0-9a-f]{2}/g)
          .map(x => Number.parseInt(x, 16) / 255);

        let [er, eg, eb] = settings.colors.main
          .slice(1)
          .match(/[0-9a-f]{2}/g)
          .map(x => Number.parseInt(x, 16) / 255);

        let r = Math.floor(Math.sqrt((sr * sr) * (1 - v) + (er * er) * v) * 255);
        let g = Math.floor(Math.sqrt((sg * sg) * (1 - v) + (eg * eg) * v) * 255);
        let b = Math.floor(Math.sqrt((sb * sb) * (1 - v) + (eb * eb) * v) * 255);

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    min = BigInt(min);

    if (min != max) {
        for (let y = 0; y < mat.length; y++) {
            let vy = sy + y * dy;
            yield true;
            for (let x = 0; x < mat[0].length; x++) {
                let vx = sx + x * dx;
                let value = Number(mat[y][x] - min) / Number(max - min);
                ctx.fillStyle = color(value);
                ctx.fillRect(vx, vy, dx, dy);
            }
        }
    }
}
matrix_gt.generator = true;
matrix_gradient_auto.display_name = "Matrix Gradient (auto)";
matrix_gradient_auto.settings = `
    <li>
        Display {var} as a matrix,
        coloring each cell with a gradient, based on the value of {var}.
    </li>
`;

const MAT_VIZ = {
    matrix_odd,
    matrix_gradient,
    matrix_multiple,
    matrix_gt,
    matrix_gradient_auto,
};

function fit_matrix(ctx, mat, settings, exp) {
    let ratio = mat.height / mat.width;

    let sx, sy, dx, dy, width, height;

    if (ctx.height / ctx.width >= ratio) {
        // Fit horizontally
        width = ctx.width * (exp ? 1 : 0.8);
        height = width * ratio;
    } else {
        // Fit vertically
        height = ctx.height * (exp ? 1 : 0.8);
        width = height / ratio;
    }
    width = Math.max(Math.round(width / mat.width), 1) * mat.width;
    height = Math.max(Math.round(height / mat.height), 1) * mat.height;

    sx = Math.round(ctx.width / 2 - width / 2);
    sy = Math.round(ctx.height / 2 - height / 2);

    dx = width / mat.width;
    dy = height / mat.height;

    return [sx, sy, dx, dy, width, height];
}

/// Handles both normal matrices and generator matrices, and can be used for a simple per-tile automaton
function* per_tile(ctx, mat, settings, exp, callback) {
    if (mat.next) {
        let v = mat.next();
        let [sx, sy, dx, dy, width, height] = fit_matrix(ctx, mat, settings, exp);
        let y = 0;
        while (!v.done) {
            v = mat.next();
            for (; y < mat.height && v.value[y] && v.value[y].length; y++) {
                let vy = sy + y * dy;
                for (let x = 0; x < v.value[y].length; x++) {
                    let vx = sx + x * dx;
                    callback(vx, vy, dx, dy, v.value[y][x]);
                }
            }
            yield true;
        }

        for (; y < mat.height && mat[y] && mat[y].length; y++) {
            let vy = sy + y * dy;
            for (let x = 0; x < v.value[y].length; x++) {
                let vx = sx + x * dx;
                callback(vx, vy, dx, dy, v.value[y][x]);
            }
            yield true;
        }
    } else {
        let [sx, sy, dx, dy, width, height] = fit_matrix(ctx, mat, settings, exp);
        for (let y = 0; y < mat.length; y++) {
            let vy = sy + y * dy;
            for (let x = 0; x < mat[0].length; x++) {
                let vx = sx + x * dx;
                callback(vx, vy, dx, dy, mat[y][x]);
            }
            yield true;
        }
    }
}

/// Handles both normal matrices and generator matrices, returning the finished matrix in the callback. May take a while!
function* get_matrix(mat, callback) {
    if (mat.next) {
        let v = mat.next();
        while (!v.done) {
            v = mat.next();
            yield true;
        }
        callback(v.value);
    } else {
        callback(mat);
    }
}
