function spiral(seq, settings) {
    let loops = +settings.spiral.loops;

    if (isNaN(loops) || loops <= 0) return [[]];

    let size = 2 * loops + 1;
    let res = zero_matrix(size, size);

    let dist = 2;
    let x = loops;
    let y = loops;

    function set(x, y) {
        let next = seq.next();
        if (next.value !== undefined) {
            res[y][x] = next.value;
        }
        return next.done;
    }

    if (set(x, y)) return res;

    while (dist < size) {
        // Go down by one
        y += 1;
        // Go left by one
        x -= 1;
        // Go `dist` to the right
        for (let n = 0; n < dist; n++) {
            x += 1;
            if (set(x, y)) return res;
        }
        // Go `dist` up
        for (let n = 0; n < dist; n++) {
            y -= 1;
            if (set(x, y)) return res;
        }
        // Go `dist` left
        for (let n = 0; n < dist; n++) {
            x -= 1;
            if (set(x, y)) return res;
        }
        // Go `dist` down
        for (let n = 0; n < dist; n++) {
            y += 1;
            if (set(x, y)) return res;
        }
        // Increment `dist` by two
        dist += 2;
    }

    // console.table(res);
    return res;
}
spiral.display_name = "Spiral";
spiral.var = `<span class="variable one bold">S</span><sub><span class="variable two">x</span>,<span class="variable two">y</span></sub>`;
spiral.settings = `
    <li>
        Wraps {var} in a spiral
            <span class="variable one bold">S</span><sub><span class="variable two">x</span>,<span class="variable two">y</span></sub>,
        with {spiral.loops=10} loops.
    </li>
`;

function spiral_count(seq, settings) {
    let loops = +settings.spiral_count.loops;
    let n_steps = +settings.spiral_count.n;

    if (isNaN(loops) || isNaN(n_steps) || loops <= 0 || n_steps <= 0) return [[]];

    let size = 2 * loops + 1;
    let res = zero_matrix(size, size);
    let indices = zero_matrix(size, size);

    let dist = 2;
    let x = loops;
    let y = loops;

    indices[loops][loops] = 0;

    let count = 1;
    while (dist < size) {
        // Go down by one
        y += 1;
        // Go left by one
        x -= 1;
        // Go `dist` to the right
        for (let n = 0; n < dist; n++) {
            x += 1;
            indices[y][x] = count;
            count += 1;
        }
        // Go `dist` up
        for (let n = 0; n < dist; n++) {
            y -= 1;
            indices[y][x] = count;
            count += 1;
        }
        // Go `dist` left
        for (let n = 0; n < dist; n++) {
            x -= 1;
            indices[y][x] = count;
            count += 1;
        }
        // Go `dist` down
        for (let n = 0; n < dist; n++) {
            y += 1;
            indices[y][x] = count;
            count += 1;
        }
        // Increment `dist` by two
        dist += 2;
    }

    let coords = [...new Array(size * size)].fill(undefined);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            coords[indices[y][x]] = [x, y];
        }
    }

    for (let n = 0; n < n_steps; n++) {
        let next = seq.next();
        if (next.value !== undefined) {
            if (next.value < BigInt(size * size) && next.value >= 0n) {
                let [x, y] = coords[next.value];
                res[y][x] += 1n;
            }
        }
    }

    // console.table(res);
    return res;
}
spiral_count.display_name = "Spiral Count";
spiral_count.var = `<span class="variable one bold">S</span><sub><span class="variable two">x</span>,<span class="variable two">y</span></sub>`;
spiral_count.settings = `
    <li>
        Maps the first <span class="variable two">N</span> = {spiral_count.n=1000} elements of {var} onto a spiral
            <span class="variable one bold">S</span><sub><span class="variable two">x</span>,<span class="variable two">y</span></sub>,
        with {spiral_count.loops=10} loops,
    </li>
    <li>
        such that for each value of <span class="variable three">n</span>, <span class="variable one bold">S</span>'s entry of index {var} is incremented by 1.
    </li>
`;

function ant(seq, settings) {
    let width = +settings.ant.width;
    let height = +settings.ant.height;
    let n_steps = +settings.ant.steps;
    let modulo = BigInt(settings.ant.modulo);

    if (isNaN(width) || width <= 0 || isNaN(height) || height <= 0 || isNaN(n_steps) || modulo <= 0n) return [[]];

    let res = zero_matrix(width, height);

    let x = Math.floor(width / 2);
    let y = Math.floor(height / 2);
    let dir = 0;
    for (let n = 0; n < n_steps; n++) {
        res[y][x] += 1n;
        if (dir == 0) {
            y = (y + 1) % height;
        } else if (dir == 1) {
            x = (x - 1 + width) % width;
        } else if (dir == 2) {
            y = (y - 1 + height) % height;
        } else {
            x = (x + 1) % width;
        }

        let next = seq.next();
        if (next.value !== undefined) {
            if ((next.value % modulo) % 2n == 0n) {
                dir = (dir + 3) % 4;
            } else {
                dir = (dir + 1) % 4;
            }
        }
    }

    return res;
}
ant.display_name = "Ant (Torus)";
ant.var = `<span class="variable one bold">T</span><sub><span class="variable two">x</span>,<span class="variable two">y</span></sub>`;
ant.settings = `
    <li>
        Run an ant on a {ant.width=10}x{ant.height=10} torus that does {ant.steps=1000} steps.
    </li>
    <li>
        For each step, the ant adds 1 to the current square and goes forward.
    </li>
    <li>
        If {var} modulo {ant.modulo=3} is even, it turns left, otherwise it turns right.
    </li>
`;

const MAT_TRANS = {
    spiral,
    spiral_count,
    ant,
};

function zero_matrix(width, height) {
    let res = [...new Array(height)].map(_ => [...new Array(width)].fill(0n));
    res.width = width;
    res.height = height;
    return res;
}

function* mat2mat_monomial(mat, settings) {
    let a = BigInt(settings.mat2mat_monomial.a);
    let b = BigInt(settings.mat2mat_monomial.b);
    let n = BigInt(settings.mat2mat_monomial.n);

    let res = [];


    if (mat.next) {
        let v = mat.next();
        this.width = res.width = mat.width;
        this.height = res.height = mat.height;
        while (!v.done) {
            v = mat.next();
            for (let y = res.length; y < v.value.length && v.value[y]; y++) {
                res.push(v.value[y].map(x => a * (x ** n) + b));
            }
            yield res;
        }
        mat = v.value;
    } else {
        this.width = res.width = mat.width;
        this.height = res.height = mat.height;
    }

    for (let y = res.length; y < mat.length; y++) {
        res.push(mat[y].map(x => a * (x ** n) + b));
    }

    return res;
}
mat2mat_monomial.display_name = "Pointwise Monomial";
mat2mat_monomial.var = `<span class="variable one">P</span>({var})`;
mat2mat_monomial.settings = `
    <li>
        Let <span class="variable one">P</span>(<span class="variable three">X</span>) = {mat2mat_monomial.a=1} · <span class="variable three">X</span> ^ {mat2mat_monomial.n=1} + {mat2mat_monomial.b=0}.
    </li>
    <li>
        With <span class="variable one">A</span> ^ <span class="variable two">n</span> = (<span class="variable one">A</span><sub><span class="variable two">x</span>,<span class="variable three">y</span></sub> <sup><span class="variable two">n</span></sup>)<sub><span class="variable two">x</span>,<span class="variable three">y</span></sub>
    </li>
`;

function* mat2mat_inside(mat, settings) {
    let diagonal = !settings.mat2mat_inside.mode;
    let op = settings.mat2mat_inside.op;
    let min = BigInt(settings.mat2mat_inside.min);
    let inside = BigInt(settings.mat2mat_inside.inside);
    let outside = BigInt(settings.mat2mat_inside.outside);

    let test;
    if (op) {
        test = (value) => value > min;
    } else {
        test = (value) => value < min;
    }

    if (mat.next) {
        let v = mat.next();
        this.width = mat.width;
        this.height = mat.height;
        while (!v.done) {
            v = mat.next();
            yield [[]];
        }
        mat = v.value;
    } else {
        this.width = mat.width;
        this.height = mat.height;
    }

    let width = mat.width;
    let height = mat.height;

    let res = fill_matrix(width, height, inside);
    if (outside === inside) return res;

    let stack = [];
    for (let x = 0; x < width; x++) {
        if (test(mat[0][x])) {
            stack.push([x, 0]);
        }
        if (test(mat[height - 1][x])) {
            stack.push([x, height - 1]);
        }
    }
    for (let y = 0; y < height; y++) {
        if (test(mat[y][0])) {
            stack.push([0, y]);
        }
        if (test(mat[y][width - 1])) {
            stack.push([width - 1, y]);
        }
    }

    let n = 0;
    // It's gonna be DFS
    while (stack.length) {
        if (++n % PSI == 0) yield [[]];
        let [x, y] = stack.pop();
        if (test(mat[y][x]) && res[y][x] !== outside) {
            res[y][x] = outside;
            if (x >= 1) {
                stack.push([x - 1, y]);
                if (diagonal) {
                    if (y >= 1) stack.push([x - 1, y - 1]);
                    if (y < height - 1) stack.push([x - 1, y + 1]);
                }
            }
            if (x < width - 1) {
                stack.push([x + 1, y]);
                if (diagonal) {
                    if (y >= 1) stack.push([x + 1, y - 1]);
                    if (y < height - 1) stack.push([x + 1, y + 1]);
                }
            }
            if (y >= 1) stack.push([x, y - 1]);
            if (y < height - 1) stack.push([x, y + 1]);
        }
    }

    return res;
}
mat2mat_inside.display_name = "Inside";
mat2mat_inside.var = `<span class="variable one">I</span><sub><span class="variable two">x</span>,<span class="variable three">y</span></sub>`;
mat2mat_inside.settings = `
    <li>
        Let <span class="variable one">I</span><sub><span class="variable two">x</span>,<span class="variable three">y</span></sub> = {mat2mat_inside.outside=0} if (<span class="variable two">x</span>, <span class="variable three">y</span>) has a {mat2mat_inside.mode=orthogonal|diagonal} path of squares where {var} {mat2mat_inside.op=is greater than|is less than} {mat2mat_inside.min=0} to the edge of the matrix (ie. if it is outside).
        <span class="variable one">I</span><sub><span class="variable two">x</span>,<span class="variable three">y</span></sub> = {mat2mat_inside.inside=1} otherwise (if it is inside).
    </li>
`;

// TODO: convolutional matrices
const MAT2MAT_TRANS = {
    mat2mat_monomial,
    mat2mat_inside,
}
