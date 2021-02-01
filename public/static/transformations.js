function* monomial(seq, settings) {
    let a = BigInt(settings.monomial.a);
    let b = BigInt(settings.monomial.b);
    let n = BigInt(settings.monomial.n);

    while (true) {
        let next = seq.next();
        if (next.value !== undefined) {
            yield a * (next.value ** n) + b;
        }
        if (next.done) return;
    }
}
monomial.display_name = "Monomial";
monomial.var = `<span class="variable one">P</span>({var})`;
monomial.settings = `
    <li>
        Let <span class="variable one">P</span>(<span class="variable three">X</span>) =
        {monomial.a=1} · <span class="variable three">X</span> ^ {monomial.n=1} + {monomial.b=0}
    </li>
`;

const SEQ2SEQ_TRANS = {
    monomial,
}
