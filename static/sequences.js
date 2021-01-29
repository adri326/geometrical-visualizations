function* fibonacci(params) {
    let a = BigInt(params.fibonacci[0]);
    let b = BigInt(params.fibonacci[1]);

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
    let a = BigInt(params.polynomial[0]);
    let b = BigInt(params.polynomial[1]);

    for (let n = 0n; true; n = n + 1n) {
        yield a * (n ** b);
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
    let a = BigInt(params.exponential[0]);
    let q = BigInt(params.exponential[1]);

    for (let n = 0n; true; n = n + 1n) {
        yield a * (q ** n);
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

function* primes(params) {
    yield 2n;
    yield 3n;

    for (let n = 5n; true; n += 2n) {
        if (n % 2n == 0n) continue;
        let prime = true;
        for (let p = 3n; p * p <= n; p++) {
            if (n % p == 0n) prime = false;
        }
        if (prime) {
            yield n;
        }
    }
}
primes.display_name = "Prime numbers";
primes.var = `<span class="variable one">P</span><sub><span class="variable two">n</span></sub>`;
primes.settings = `
    <li>
        Let <span class="variable one">P</span><sub><span class="variable two">n</span></sub> be the <span class="variable two">n</span>-th prime.
    </li>
`;

const SEQ = {
    fibonacci,
    polynomial,
    exponential,
    primes,
};
