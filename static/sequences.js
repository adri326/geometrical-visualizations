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
