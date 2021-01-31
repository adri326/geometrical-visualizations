function matrix_odd(ctx, mat, settings, exp) {
    let modulo = BigInt(settings.matrix_odd.modulo);
    let evenness = settings.matrix_odd.evenness;

    if (modulo <= 0n) return;
    if (mat.length == 0 || mat[0].length == 0) return; // Empty matrix
    let [sx, sy, dx, dy, width, height] = fit_matrix(ctx, mat, settings, exp);

    for (let y = 0; y < mat.length; y++) {
        let vy = sy + y * dy;
        for (let x = 0; x < mat[0].length; x++) {
            let vx = sx + x * dx;
            let value = mat[y][x] % modulo;
            if ((value % 2n == 0n) === evenness) {
                ctx.fillStyle = settings.colors.main;
                ctx.fillRect(vx, vy, dx, dy);
            }
        }
    }
}
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
    if (mat.length == 0 || mat[0].length == 0) return; // Empty matrix
    let [sx, sy, dx, dy, width, height] = fit_matrix(ctx, mat, settings, exp);

    for (let y = 0; y < mat.length; y++) {
        let vy = sy + y * dy;
        for (let x = 0; x < mat[0].length; x++) {
            let vx = sx + x * dx;
            let value = mat[y][x] % modulo;
            if (value == search) {
                ctx.fillStyle = settings.colors.main;
                ctx.fillRect(vx, vy, dx, dy);
            }
        }
    }
}
matrix_multiple.display_name = "Matrix Multiple";
matrix_multiple.settings = `
    <li>
        Display {var} modulo <span class="variable two">m</span> = {matrix_multiple.modulo=3} as a matrix,
        coloring a cell iff {var} mod <span class="variable two">m</span> = {matrix_multiple.value=0}.
    </li>
`;

function matrix_mod(ctx, mat, settings, exp) {
    let modulo = BigInt(settings.matrix_mod.modulo);

    if (modulo <= 1n) return;
    if (mat.length == 0 || mat[0].length == 0) return; // Empty matrix
    let [sx, sy, dx, dy, width, height] = fit_matrix(ctx, mat, settings, exp);

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

    for (let y = 0; y < mat.length; y++) {
        let vy = sy + y * dy;
        for (let x = 0; x < mat[0].length; x++) {
            let vx = sx + x * dx;
            let value = Number(mat[y][x] % modulo);
            ctx.fillStyle = color(value / (Number(modulo) - 1));
            ctx.fillRect(vx, vy, dx, dy);
        }
    }
}
matrix_mod.display_name = "Matrix Gradient";
matrix_mod.settings = `
    <li>
        Display {var} modulo <span class="variable two">m</span> = {matrix_mod.modulo=4} as a matrix,
        coloring each cell with a gradient, based on {var} mod <span class="variable two">m</span>.
    </li>
`;

function matrix_gt(ctx, mat, settings, exp) {
    let min = BigInt(settings.matrix_gt.min);

    if (mat.length == 0 || mat[0].length == 0) return; // Empty matrix
    let [sx, sy, dx, dy, width, height] = fit_matrix(ctx, mat, settings, exp);

    for (let y = 0; y < mat.length; y++) {
        let vy = sy + y * dy;
        for (let x = 0; x < mat[0].length; x++) {
            let vx = sx + x * dx;
            if (mat[y][x] >= min) {
                ctx.fillStyle = settings.colors.main;
                ctx.fillRect(vx, vy, dx, dy);
            }
        }
    }
}
matrix_gt.display_name = "Matrix (≥)";
matrix_gt.settings = `
    <li>
        Display {var} as a matrix,
        coloring each cell iff {var} ≥ {matrix_gt.min=1}.
    </li>
`;

function matrix_gradient_auto(ctx, mat, settings, exp) {
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
            for (let x = 0; x < mat[0].length; x++) {
                let vx = sx + x * dx;
                let value = Number(mat[y][x] - min) / Number(max - min);
                ctx.fillStyle = color(value);
                ctx.fillRect(vx, vy, dx, dy);
            }
        }
    }
}
matrix_gradient_auto.display_name = "Matrix Gradient (auto)";
matrix_gradient_auto.settings = `
    <li>
        Display {var} as a matrix,
        coloring each cell with a gradient, based on the value of {var}.
    </li>
`;

const MAT_VIZ = {
    matrix_odd,
    matrix_mod,
    matrix_multiple,
    matrix_gt,
    matrix_gradient_auto,
};

function fit_matrix(ctx, mat, settings, exp) {
    let ratio = mat.length / mat[0].length;

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
    width = Math.round(width / mat[0].length) * mat[0].length;
    height = Math.round(height / mat.length) * mat.length;

    sx = Math.round(ctx.width / 2 - width / 2);
    sy = Math.round(ctx.height / 2 - height / 2);

    dx = width / mat[0].length;
    dy = height / mat.length;

    return [sx, sy, dx, dy, width, height];
}
