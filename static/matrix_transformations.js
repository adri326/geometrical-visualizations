function spiral(seq, settings) {
    let loops = +settings.spiral.loops;

    if (loops <= 0) return [[]];

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
        with {spiral.loops=2} loops.
    </li>
`;

const MAT_TRANS = {
    spiral,
};
