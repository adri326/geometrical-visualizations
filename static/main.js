let canvas;
let ctx;
let body;
let settings;
let settings_viz, settings_seq;
let select;
let select_viz, select_seq;

let current_viz = "circle_number_modulo";
let current_seq = "fibonacci";

window.addEventListener("load", () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    settings = document.getElementById("settings");
    settings_viz = document.getElementById("settings-viz");
    settings_seq = document.getElementById("settings-seq");
    settings.addEventListener("keyup", resize_canvas);

    select = document.getElementById("select");
    select_viz = document.getElementById("viz");
    select_seq = document.getElementById("seq");
    update_dropdowns();
    update_settings();
    select_seq.addEventListener("change", () => {
        update_settings();
        resize_canvas();
    });
    select_viz.addEventListener("change", () => {
        update_settings();
        resize_canvas();
    });

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
    let seq = SEQ[current_seq](params);
    VIZ[current_viz](ctx, seq, params);
}

function resize_canvas() {
    ctx.width = canvas.width = canvas.clientWidth;
    ctx.height = canvas.height = canvas.clientHeight;

    redraw_canvas();
}

function update_dropdowns() {
    let html_viz = "";
    for (let name in VIZ) {
        html_viz += `<option name="${name}" value="${name}" ${current_viz == name ? "selected" : ""}>${VIZ[name].display_name}</option>`;
    }
    select_viz.innerHTML = html_viz;

    let html_seq = "";
    for (let name in SEQ) {
        html_seq += `<option name="${name}" value="${name}" ${current_seq == name ? "selected" : ""}>${SEQ[name].display_name}</option>`;
    }
    select_seq.innerHTML = html_seq;
}

function update_settings() {
    current_seq = select_seq.value;
    current_viz = select_viz.value;
    let seq = SEQ[current_seq];
    let viz = VIZ[current_viz];

    settings_seq.innerHTML = seq.settings;
    settings_viz.innerHTML = viz.settings.replace(/\{var\}/g, seq.var);
}

window.addEventListener("resize", resize_canvas);
