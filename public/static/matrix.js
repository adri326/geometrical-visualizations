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


const MAT = {
    chess
};

function fill_matrix(width, height, value) {
    return [...new Array(height)].map(_ => [...new Array(width)].fill(value));
}
