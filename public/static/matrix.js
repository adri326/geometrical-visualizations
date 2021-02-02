function chess(settings) {
    const W = 7, W_OFFSET = -3;
    const H = 7, H_OFFSET = -3;
    let matrix = settings.chess.matrix;
    let width = +settings.chess.width;
    let height = +settings.chess.height;

    if (isNaN(width) || width <= 0 || isNaN(height) || height <= 0) return [[]];

    let visited = fill_matrix(width, height, false);
    let res = fill_matrix(width, height, -1n);

    let sx = Math.floor(width / 2);
    let sy = Math.floor(height / 2);
    let stack = [[sx, sy, BigInt(matrix[-W_OFFSET - W * H_OFFSET])]];
    let visits = 0;
    while (stack.length) {
        visits += 1;
        let [x, y, depth] = stack.shift();
        let was_visited = visited[y][x];
        visited[y][x] = true;
        if (res[y][x] == -1n || res[y][x] > depth) {
            res[y][x] = depth;
        }
        if (!was_visited) {
            for (let dy = 0; dy < H; dy++) {
                let y2 = y + dy + H_OFFSET;
                for (let dx = 0; dx < W; dx++) {
                    let x2 = x + dx + W_OFFSET;
                    if (+matrix[dx + dy * W] && x2 >= 0 && x2 < width && y2 >= 0 && y2 < height) {
                        if (!visited[y2][x2]) {
                            stack.push([x2, y2, depth + 1n]);
                        }
                    }
                }
            }
        }
    }

    return res;
}
chess.display_name = "Chess Distance";
chess.var = `<span class="variable one">M</span><sub><span class="variable two">x</span>,<span class="variable three">y</span></sub>`;
chess.settings = `
    <li>
        Take a piece that can move as such (the piece lies at the center of the matrix and can jump to any square that has a 1):
    </li>
    <li>
        {7*7:chess.matrix=0}
        <br />
        <button class="input" onclick="settings.chess.matrix = null; update_settings();">Reset</button>
    </li>
    <li>
        Place the piece in the center of a {chess.width=7} by {chess.height=7} board, and let <span class="variable one">M</span><sub><span class="variable two">x</span>,<span class="variable three">y</span></sub> be the minimum number of steps that the piece needs to do to reach the tile at (<span class="variable two">x</span>,<span class="variable three">y</span>)
    </li>
`;

function ant(settings) {
    let width = +settings.ant.width;
    let height = +settings.ant.height;
    let steps = +settings.ant.steps;
    let modulo = BigInt(settings.ant.modulo);

    if (isNaN(width) || width <= 0 || isNaN(height) || height <= 0 || isNaN(steps) || steps <= 0 || modulo <= 0) return [[]];

    let m0 = settings.ant.m0;
    let m1 = settings.ant.m1;
    let m2 = settings.ant.m2;
    let m3 = settings.ant.m3;
    let m4 = settings.ant.m4;
    let m5 = settings.ant.m5;

    let matrix = [m0, m1, m2, m3, m4, m5];

    let res = fill_matrix(width, height, 0n);
    let dir = 0;
    let x = Math.floor(width / 2);
    let y = Math.floor(height / 2);

    for (let n = 0; n < steps; n++) {
        res[y][x] += 1n;
        if (dir == 0) {
            y = (y + 1) % height;
        } else if (dir == 1) {
            x = (x + width - 1) % width;
        } else if (dir == 2) {
            y = (y + height - 1) % height;
        } else if (dir == 3) {
            x = (x + 1) % width;
        }
        let v = res[y][x] % modulo;
        if (matrix[v]) {
            dir = (dir + 1) % 4;
        } else {
            dir = (dir + 3) % 4;
        }
    }

    return res;
}
ant.display_name = "Ant (Torus)";
ant.var = `<span class="variable one">M</span><sub><span class="variable two">x</span>,<span class="variable three">y</span></sub>`;
ant.settings = `
    <li>
        Consider an ant in the center of a {ant.width=25} by {ant.height=25} torus. The ant walks a total of {ant.steps=1000} steps.
    </li>
    <li>
        For each step, the ant increments <span class="variable one">M</span><sub><span class="variable two">x</span>,<span class="variable three">y</span></sub> by one,
        moves forward to (<span class="variable two">x</span>',<span class="variable three">y</span>')
        and turns according to <span class="variable one">M</span><sub><span class="variable two">x</span>',<span class="variable three">y</span>'</sub>
        modulo <span class="variable three">m</span> = {ant.modulo=6}:
    </li>
    <li>
        <b>0</b> → {ant.m0=left|right}<br />
        <b>1</b> → {ant.m1=left|right}<br />
        <b>2</b> → {ant.m2=left|right}<br />
        <b>3</b> → {ant.m3=left|right}<br />
        <b>4</b> → {ant.m4=left|right}<br />
        <b>5</b> → {ant.m5=left|right}
    </li>
`;

function turmite(settings) {
    let width = +settings.turmite.width;
    let height = +settings.turmite.height;
    let steps = +settings.turmite.steps;

    if (isNaN(width) || width <= 0 || isNaN(height) || height <= 0 || isNaN(steps) || steps <= 0) return [[]];

    let matrix = [
        [+!settings.turmite.s0, BigInt(+!settings.turmite.c0), settings.turmite.d0.toLowerCase().slice(0, 1)],
        [+!settings.turmite.s1, BigInt(+!settings.turmite.c1), settings.turmite.d1.toLowerCase().slice(0, 1)],
        [+!settings.turmite.s2, BigInt(+!settings.turmite.c2), settings.turmite.d2.toLowerCase().slice(0, 1)],
        [+!settings.turmite.s3, BigInt(+!settings.turmite.c3), settings.turmite.d3.toLowerCase().slice(0, 1)],
    ];

    let res = fill_matrix(width, height, 0n);
    let dir = 0;
    let state = +!settings.turmite.initial_value;
    let x = Math.floor(width / 2);
    let y = Math.floor(height / 2);

    for (let n = 0; n < steps; n++) {
        if (dir == 0) {
            y = (y + 1) % height;
        } else if (dir == 1) {
            x = (x + width - 1) % width;
        } else if (dir == 2) {
            y = (y + height - 1) % height;
        } else if (dir == 3) {
            x = (x + 1) % width;
        }
        let v = Number(res[y][x] % 2n) + state * 2;
        res[y][x] = matrix[v][1];
        state = matrix[v][0];
        if (matrix[v][2] === "l") {
            dir = (dir + 1) % 4;
        } else if (matrix[v][2] === "r") {
            dir = (dir + 3) % 4;
        } else if (matrix[v][2] === "u") {
            dir = (dir + 2) % 4;
        }
    }

    return res;
}
turmite.display_name = "Turmite (Torus)";
turmite.var = `<span class="variable one">M</span><sub><span class="variable two">x</span>,<span class="variable three">y</span></sub>`;
turmite.settings = `
    <li>
        Consider a turmite in the center of a {turmite.width=25} by {turmite.height=25} torus. The turmite walks a total of {turmite.steps=1000} steps.
        It has an initial, inner value of {turmite.initial_value=0|1}.
    </li>
    <li>
        For each step, let <span class="variable one">S</span> be the internal state of the turmite,
        <span class="variable two">C</span> = <span class="variable one">M</span><sub><span class="variable two">x</span>,<span class="variable three">y</span></sub> mod 2.
    </li>
    <li>
        The new state <span class="variable one">S'</span>, color <span class="variable two">C'</span> and turning direction is determined from the following matrix:
    </li>
    <li>
        (<span class="variable one">S</span> = 0, <span class="variable two">C</span> = 0) → (<span class="variable one">S'</span> = {turmite.s0=0|1}, <span class="variable two">C'</span> = {turmite.c0=0|1}, turn {turmite.d0=N})<br />
        (<span class="variable one">S</span> = 0, <span class="variable two">C</span> = 1) → (<span class="variable one">S'</span> = {turmite.s1=0|1}, <span class="variable two">C'</span> = {turmite.c1=0|1}, turn {turmite.d1=N})<br />
        (<span class="variable one">S</span> = 1, <span class="variable two">C</span> = 0) → (<span class="variable one">S'</span> = {turmite.s2=0|1}, <span class="variable two">C'</span> = {turmite.c2=0|1}, turn {turmite.d2=N})<br />
        (<span class="variable one">S</span> = 1, <span class="variable two">C</span> = 1) → (<span class="variable one">S'</span> = {turmite.s3=0|1}, <span class="variable two">C'</span> = {turmite.c3=0|1}, turn {turmite.d3=N})
    </li>
    <li>
        The ant sets <span class="variable one">M</span><sub><span class="variable two">x</span>,<span class="variable three">y</span></sub> ← <span class="variable two">C'</span>,
        <span class="variable one">S</span> ← <span class="variable one">S'</span>,
        moves forward and turns according to the direction from the matrix (N = no turn, L = turn left, R = turn right, U = turn backwards)
    </li>
`;

const MAT = {
    chess,
    ant,
    turmite
};

function fill_matrix(width, height, value) {
    let res = [];
    for (let y = 0; y < height; y++) {
        let row = [];
        for (let x = 0; x < width; x++) {
            row.push(value);
        }
        res.push(row);
    }
    return res;
}
