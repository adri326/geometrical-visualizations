function spiral(seq, settings) {
    let loops = +settings.spiral.loops;

    if (isNaN(loops) || loops <= 0) return [[]];

    let size = 2 * loops + 1;
    let res = [...new Array(size)].map(_ => [...new Array(size)].fill(0n));

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
        with {spiral.loops=4} loops.
    </li>
`;

function spiral_count(seq, settings) {
    let loops = +settings.spiral_count.loops;
    let n_steps = +settings.spiral_count.n;

    if (isNaN(loops) || isNaN(n_steps) || loops <= 0 || n_steps <= 0) return [[]];

    let size = 2 * loops + 1;
    let res = [...new Array(size)].map(_ => [...new Array(size)].fill(0n));
    let indices = [...new Array(size)].map(_ => [...new Array(size)].fill(0));

    let dist = 2;
    let x = loops;
    let y = loops;

    let count = 0;
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
            if (next.value < BigInt(size * size)) {
                let [x, y] = coords[next.value];
                res[y][x] += 1n;
            }
        }
    }

    console.table(res);
    return res;
}
spiral_count.display_name = "Spiral Count";
spiral_count.var = `<span class="variable one bold">S</span><sub><span class="variable two">x</span>,<span class="variable two">y</span></sub>`;
spiral_count.settings = `
    <li>
        Maps the first <span class="variable two">N</span> = {spiral_count.n=1000} elements of {var} onto a spiral
            <span class="variable one bold">S</span><sub><span class="variable two">x</span>,<span class="variable two">y</span></sub>,
        with {spiral_count.loops=4} loops,
    </li>
    <li>
        such that for each value of <span class="variable three">n</span>, <span class="variable one bold">S</span>'s entry of index {var} is incremented by 1.
    </li>
`;

const MAT_TRANS = {
    spiral,
    spiral_count,
};
