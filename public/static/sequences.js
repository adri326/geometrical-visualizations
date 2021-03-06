function* fibonacci(settings) {
    let a = BigInt(settings.fibonacci.f0);
    let b = BigInt(settings.fibonacci.f1);

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
    <li><span class="variable one">F</span><sub>0</sub> = {fibonacci.f0=0}</li>
    <li><span class="variable one">F</span><sub>1</sub> = {fibonacci.f1=1}</li>
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

function* polynomial(settings) {
    let a = BigInt(settings.polynomial.a);
    let b = BigInt(settings.polynomial.b);

    for (let n = 0n; true; n = n + 1n) {
        yield a * (n ** b);
    }
}
polynomial.display_name = "Polynomial";
polynomial.var = `<span class="variable one">P</span>(<span class="variable two">n</span>)`;
polynomial.settings = `
    <li><span class="variable three">a</span> = {polynomial.a=1}</li>
    <li><span class="variable three">b</span> = {polynomial.b=2}</li>
    <li>
        <span class="variable one">P</span>(<span class="variable two">n</span>)
        = <span class="variable three">a</span> · <span class="variable two">n</span><sup><span class="variable three">b</span></sup>
    </li>
`;

function* exponential(settings) {
    let a = BigInt(settings.exponential.a);
    let q = BigInt(settings.exponential.q);

    for (let n = 0n; true; n = n + 1n) {
        yield a * (q ** n);
    }
}
exponential.display_name = "Exponential";
exponential.var = `<span class="variable one">E</span>(<span class="variable two">n</span>)`;
exponential.settings = `
    <li><span class="variable three">a</span> = {exponential.a=1}</li>
    <li><span class="variable three">q</span> = {exponential.q=2}</li>
    <li>
        <span class="variable one">E</span>(<span class="variable two">n</span>)
        = <span class="variable three">a</span> · <span class="variable three">q</span><sup><span class="variable two">n</span></sup>
    </li>
`;

function* primes(settings) {
    yield 2n;
    yield 3n;

    for (let n = 5n; true; n += 2n) {
        if (n % 2n == 0n) continue;
        let prime = true;
        for (let p = 3n; p * p <= n; p += 2n) {
            if (n % p == 0n) {
                prime = false;
                break;
            }
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


function* dprimes(settings) {
    let iter = primes(settings);
    let last_prime = iter.next().value;

    while (true) {
        let prime = iter.next().value;
        yield prime - last_prime;
        last_prime = prime;
    }
}
dprimes.display_name = "Prime differences";
dprimes.var = `<span class="variable one">ΔP</span><sub><span class="variable two">n</span></sub>`;
dprimes.settings = `
    <li>
        Let <span class="variable one">P</span><sub><span class="variable two">n</span></sub> be the <span class="variable two">n</span>-th prime.
    </li>
    <li>
        ∀ n,
        let <span class="variable one">ΔP</span><sub><span class="variable two">n</span></sub> =
            <span class="variable one">P</span><sub><span class="variable two">n+1</span></sub> -
            <span class="variable one">P</span><sub><span class="variable two">n</span></sub>
    </li>
`;

// A006577
function* collatz(settings) {
    for (let n = 1n; true; n = n + 1n) {
        let count = 0n;
        let A = n;
        while (true) {
            if (A == 1n) break;
            if (A % 2n == 0n) A = A / 2n;
            else A = A * 3n + 1n;
            count = count + 1n;
        }
        yield count;
    }
}
collatz.display_name = "Collatz length";
collatz.var = `<span class="variable one">A</span><sub><span class="variable two">n</span></sub>`;
collatz.settings = `
    <li>
        Let <span class="variable one">A</span><sub><span class="variable two">n</span></sub>(0) = <span class="variable two">n</span>,
    </li>
    <li>
        ∀ <span class="variable two">x</span> &gt; 0,<br />
            <span class="variable one">A</span><sub><span class="variable two">n</span></sub>(<span class="variable two">x</span> + 1) =
            <span class="variable one">A</span><sub><span class="variable two">n</span></sub>(<span class="variable two">x</span>) / 2
            if <span class="variable one">A</span><sub><span class="variable two">n</span></sub>(<span class="variable two">x</span>) is even,<br />
            <span class="variable one">A</span><sub><span class="variable two">n</span></sub>(<span class="variable two">x</span>) * 3 + 1 otherwise.
    </li>
`;

function* random(settings) {
    let min = +settings.random.min;
    let max = +settings.random.max;

    if (isNaN(min) || isNaN(max)) return;

    while (true) {
        yield BigInt(Math.floor(min + Math.random() * (max - min)));
    }
}
random.display_name = "Random";
random.var = `<span class="variable one">R</span>(<span class="variable two">n</span>)`;
random.settings = `
    <li>
        Let <span class="variable one">R</span> be the random function, which yields random numbers between {random.min=0} and {random.max=10}
        (<button class="input" type="button" onclick="drop_cache = true; redraw_canvas();">Reroll</button>).
    </li>
`;

function* recaman(settings) {
    let r = BigInt(settings.recaman.r0);
    let encountered = new Set([0n]);

    yield r;
    let n = 0n;
    while (true) {
        n += 1n;
        if (r - n > 0n && !encountered.has(r - n)) {
            encountered.add(r - n);
            r = r - n;
            yield r;
        } else {
            encountered.add(r + n);
            r = r + n;
            yield r;
        }
    }
}
recaman.display_name = "Recamán";
recaman.var = `<span class="variable one">R</span><sub><span class="variable two">n</span></sub>`;
recaman.settings = `
    <li>
        Let <span class="variable one">R</span><sub>0</sub> = {recaman.r0=0}.
    </li>
    <li>
        ∀ <span class="variable two">n</span>, <span class="variable one">R</span><sub><span class="variable two">n</span> + 1</sub> =
            <br />
            <span class="variable one">R</span><sub><span class="variable two">n</span></sub> - <span class="variable two">n</span>
            if <span class="variable one">R</span><sub><span class="variable two">n</span></sub> - <span class="variable two">n</span> &gt; 0
            and isn't already in the sequence;
            <br />
            <span class="variable one">R</span><sub><span class="variable two">n</span></sub> + <span class="variable two">n</span>
            otherwise.
    </li>
`;

function* recaman_mult(settings) {
    let r = BigInt(settings.recaman_mult.r1);
    yield r;

    let n = 1n;
    while (true) {
        n += 1n;
        if (r % n == 0n) {
            r = r / n;
        } else {
            r = r * n;
        }
        yield r;
    }
}
recaman_mult.display_name = "Recamán (Multiplicative)";
recaman_mult.var = `<span class="variable one">R'</span><sub><span class="variable two">n</span></sub>`;
recaman_mult.settings = `
    <li>
        Let <span class="variable one">R'</span><sub>1</sub> = {recaman_mult.r1=1}.
    </li>
    <li>
        ∀ <span class="variable two">n</span> &gt; 0, <span class="variable one">R'</span><sub><span class="variable two">n</span> + 1</sub> =
            <br />
            <span class="variable one">R'</span><sub><span class="variable two">n</span></sub> / <span class="variable two">n</span>
            if <span class="variable two">n</span> divides <span class="variable one">R'</span><sub><span class="variable two">n</span></sub>
            <br />
            <span class="variable one">R'</span><sub><span class="variable two">n</span></sub> · <span class="variable two">n</span>
            otherwise.
    </li>
`;

function* composite_numbers(settings) {
    let modulo = BigInt(settings.composite_numbers.modulo);
    let offset = BigInt(settings.composite_numbers.offset);

    if (modulo <= 0n || offset < 0n || offset >= modulo) return;

    for (let x = offset; true; x += modulo) {
        let prime = true;
        if (x == 1n) {
            yield 1n;
            continue;
        }
        if (x == 2n || x == 3n) continue;
        for (let y = 3n; y * y <= x; y += 2n) {
            if (x % y == 0n) {
                prime = false;
                break;
            }
        }

        if (!prime) yield x;
    }
}
composite_numbers.display_name = "Composite Numbers";
composite_numbers.var = `<span class="variable one">C</span><sub><span class="variable two">n</span></sub>`;
composite_numbers.settings = `
    <li>
        Let <span class="variable one">C</span><sub><span class="variable two">n</span></sub> be the <span class="variable two">n</span>-th number, such that, ∀ <span class="variable two">n</span>:
    </li>
    <li>
        <span class="variable one">C</span><sub><span class="variable two">n</span></sub> is not prime;
    </li>
    <li>
        ∃ <span class="variable two">λ</span>, <span class="variable one">C</span><sub><span class="variable two">n</span></sub> = {composite_numbers.modulo=2} · <span class="variable two">λ</span> + {composite_numbers.offset=1}.
    </li>
`;

function* totient(settings) {
    function phi(n) {
        let res = n;
        for (let i = 2n; i * i <= n; i++) {
            if (n % i == 0n) {
                while (n % i == 0n) {
                    n /= i;
                }
                res -= res / i;
            }
        }
        if (n > 1) res -= res / n;
        return res;
    }

    for (let n = 1n; true; n += 1n) {
        yield phi(n);
    }
}
totient.display_name = "Euler's Totient";
totient.var = `<span class="variable one">φ</span>(<span class="variable two">n</span>)`;
totient.settings = `
    <li>
        Let <span class="variable one">φ</span>(<span class="variable two">n</span>) be Euler's totient function,
        which counts the positive integers up to <span class="variable two">n</span> which are coprime to <span class="variable two">n</span>.
    </li>
`;

const SEQ = {
    fibonacci,
    polynomial,
    exponential,
    primes,
    dprimes,
    composite_numbers,
    collatz,
    random,
    recaman,
    recaman_mult,
    totient,
};
