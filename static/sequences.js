function* fibonacci(params) {
    let a = +params.fibonacci[0];
    let b = +params.fibonacci[1];

    yield a;
    yield b;

    while (true) {
        let c = a;
        a = b;
        b = c + b;
        yield b;
    }
}
fibonacci.display_name = "Fibonacci";
fibonacci.var = `<span class="variable one">F</span><sub><span class="variable two">n</span></sub>`;
fibonacci.settings = `
    <li><span class="variable one">F</span><sub>0</sub> = <span class="input fibonacci" contenteditable="true">0</span></li>
    <li><span class="variable one">F</span><sub>1</sub> = <span class="input fibonacci" contenteditable="true">1</span></li>
    <li>
        ∀ <span class="variable two">n</span> > 1,
        <span class="variable one">F</span>
            <sub><span class="variable two">n</span></sub>
        = <span class="variable one">F</span>
            <sub><span class="variable two">n</span>-1</sub>
        + <span class="variable one">F</span>
            <sub><span class="variable two">n</span>-2</sub>
    </li>
`;

function* polynomial(params) {
    let a = +params.polynomial[0];
    let b = +params.polynomial[1];

    for (let n = 0; true; n++) {
        yield a * Math.pow(n, b);
    }
}
polynomial.display_name = "Polynomial";
polynomial.var = `<span class="variable one">P</span>(<span class="variable two">n</span>)`;
polynomial.settings = `
    <li><span class="variable three">a</span> = <span class="input polynomial" contenteditable="true">1</span></li>
    <li><span class="variable three">b</span> = <span class="input polynomial" contenteditable="true">2</span></li>
    <li>
        <span class="variable one">P</span>(<span class="variable two">n</span>)
        = <span class="variable three">a</span> · <span class="variable two">n</span><sup><span class="variable three">b</span></sup>
    </li>
`;

function* exponential(params) {
    let a = +params.exponential[0];
    let q = +params.exponential[1];

    for (let n = 0; true; n++) {
        yield a * Math.pow(q, n);
    }
}
exponential.display_name = "Exponential";
exponential.var = `<span class="variable one">E</span>(<span class="variable two">n</span>)`;
exponential.settings = `
    <li><span class="variable three">a</span> = <span class="input exponential" contenteditable="true">1</span></li>
    <li><span class="variable three">q</span> = <span class="input exponential" contenteditable="true">2</span></li>
    <li>
        <span class="variable one">E</span>(<span class="variable two">n</span>)
        = <span class="variable three">a</span> · <span class="variable three">q</span><sup><span class="variable two">n</span></sup>
    </li>
`;

const SEQ = {
    fibonacci,
    polynomial,
    exponential,
};
