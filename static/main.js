let canvas;
let ctx;
let body;
let settings;

window.addEventListener("load", () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    settings = document.getElementById("settings");
    settings.addEventListener("keyup", resize_canvas);
    body = document.body;

    resize_canvas();
});

function get_params() {
    let inputs = [...settings.querySelectorAll(".input")];
    let res = {};
    inputs.forEach((input, n) => {
        res[n] = input.innerText;
    });
    for (let input of inputs) {
        let classes = [...input.classList].filter(name => name !== "input");
        for (let name of classes) {
            if (!res[name]) {
                res[name] = [];
            }
            res[name].push(input.innerText);
        }
    }

    res.colors = {
        main: "#ffffff",
        bg: "#34373b",
    };

    return res;
}

function redraw_canvas() {
    ctx.clearRect(0, 0, ctx.width, ctx.height);
    let params = get_params();
    let seq = fibonacci(params);
    circle_number_modulo(ctx, seq, params);
}

function resize_canvas() {
    ctx.width = canvas.width = canvas.clientWidth;
    ctx.height = canvas.height = canvas.clientHeight;

    redraw_canvas();
}

window.addEventListener("resize", resize_canvas);
