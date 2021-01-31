const MAX_RANGE = 32;

// Main canvas and its 2d context
let canvas, ctx;

// Export section
let export_button, export_width_dom, export_height_dom, export_background_dom;
let newtab_button;

// DOM Object containing all of the settings
let settings_dom;

// Selection section
let selection_dom;
let selections = [];
let method_dom, method = "seq";

// Selected methods
let current_selections = [];

// Colors
let color_background, color_foreground, color_reset;

// Sequence caching
let drop_cache = true;

// Settings
let settings = {
    colors: {
        main: "#ffffff",
        bg: "#34373b",
    }
};

let range_tree = [{}];

// Methods (TODO: use arrays and make it more modular)
const METHODS = {
    seq: {
        steps: [cachify(SEQ), VIZ],
        defaults: ["fibonacci", "circle_number_modulo"],
        drop_cache: [true, false],
        display_name: "Sequence",
    },
    seq_to_mat: {
        steps: [cachify(SEQ), MAT_TRANS, MAT_VIZ],
        defaults: ["fibonacci", "spiral", "matrix_odd"],
        drop_cache: [true, false, false],
        display_name: "Sequence → Matrix",
    }
}

window.addEventListener("load", () => {
    // Get canvas element
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    // Method selection and listener
    method_dom = document.getElementById("select-method");
    method_dom.value = "seq";
    method_dom.addEventListener("change", () => {
        update_method();
        update_dropdowns();
    });

    // Selections section
    selection_dom = document.getElementById("selection");

    // Settings section
    settings_dom = document.getElementById("settings");
    settings_dom.addEventListener("keyup", resize_canvas);

    // Color section
    color_reset = document.getElementById("color-reset");
    color_background = document.getElementById("color-background");
    color_foreground = document.getElementById("color-foreground");

    // Update the UI
    update_colors();
    update_dropdowns();

    color_background.addEventListener("change", () => {
        update_colors();
        resize_canvas();
    });
    color_foreground.addEventListener("change", () => {
        update_colors();
        resize_canvas();
    });
    color_reset.addEventListener("click", () => {
        color_background.value = "#34373b";
        color_foreground.value = "#e5e5e5";
        update_colors();
        resize_canvas();
    });

    // Export section
    newtab_button = document.getElementById("export-new-tab");
    export_button = document.getElementById("export-to-png");
    export_width_dom = document.getElementById("export-width");
    export_height_dom = document.getElementById("export-height");
    export_background_dom = document.getElementById("export-background");
    export_button.addEventListener("click", () => export_to_png(false));
    newtab_button.addEventListener("click", () => export_to_png(true));
});

function redraw_canvas(bg = false, exp = false) {
    ctx.clearRect(0, 0, ctx.width, ctx.height);
    if (bg) {
        ctx.fillStyle = settings.colors.bg;
        ctx.fillRect(0, 0, ctx.width, ctx.height);
    }

    let dx = Math.round(ctx.width / range_tree.length);
    // Currently, the canvas is split horizontally when using ranges.
    for (let n = 0; n < range_tree.length; n++) {
        let settings = range_tree[n];
        let steps = METHODS[method].steps;
        let value = steps[0][current_selections[0]];

        if (value instanceof CacheSeq) {
            if (drop_cache || range_tree.length > 1) {
                value.reset(settings);
            } else {
                value.rewind();
            }
        } else if (typeof value === "function") {
            value = value(settings);
        } else {
            throw new Error("Expected function or CacheSeq as method step, got " + typeof value);
        }

        for (let step = 1; step < steps.length - 1; step++) {
            let m = steps[step][current_selections[step]];
            if (m instanceof CacheSeq) {
                if (drop_cache) {
                    m.reset(settings);
                } else {
                    m.rewind();
                }
                value = m;
            } else if (typeof m === "function") {
                value = m(value, settings);
            } else {
                throw new Error("Expected function or CacheSeq as method step, got " + typeof m);
            }
        }

        let last_step = steps[steps.length - 1][current_selections[steps.length - 1]];

        if (typeof last_step === "function") {
            ctx.setTransform(1, 0, 0, 1, n * dx, 0);
            ctx.save();
            ctx.beginPath();
            ctx.rect(
                0,
                0,
                dx,
                ctx.height
            );
            ctx.clip();
            last_step(
                ctx,
                value,
                settings,
                [
                    n * dx,
                    0,
                    dx,
                    ctx.height
                ],
                exp
            );
            ctx.restore();
        } else {
            throw new Error("Expected function as method's last step, got " + typeof last_step);
        }
    }

    drop_cache = false;
}

function resize_canvas() {
    ctx.width = canvas.width = canvas.clientWidth * window.devicePixelRatio;
    ctx.height = canvas.height = canvas.clientHeight * window.devicePixelRatio;

    redraw_canvas();
}

function update_method() {
    method = method_dom.value;
    selections = [...METHODS[method].defaults];
}

// TODO: directly use DOM
function update_dropdowns() {
    let html = "";
    for (let step = 0; step < METHODS[method].steps.length; step++) {
        if (step != 0) {
            html += `<div><span class="arrow">→</span>`;
        }
        html += `<select name="selection-${step}" id="selection-${step}" onchange="update_settings()">`;

        for (let name in METHODS[method].steps[step]) {
            html += `<option name="${name}" value="${name}" ${selections[step] === name ? "selected" : ""}>`;
            html += METHODS[method].steps[step][name].display_name;
            html += `</option>`;
        }

        html += `</select>`;
        if (step != 0) {
            html += `</div>`;
        }
    }

    selection_dom.innerHTML = html;

    update_settings();
}

function update_settings() {
    let html = "";
    let var_name = "";

    for (let step = 0; step < METHODS[method].steps.length; step++) {
        current_selections[step] = selection_dom.querySelector(`#selection-${step}`).value;

        let s = METHODS[method].steps[step][current_selections[step]];
        let d = METHODS[method].drop_cache[step];

        html += s.settings
            .replace(/\{var\}/g, var_name)
            .replace(/\{([\w_]+)\.([\w_]+)(?:=([^\}]+))?\}/g, (_, ctx, name, def) => {
                if (def.split("|").length === 2) {
                    let [left, right] = def.split("|");
                    if (settings[ctx] && settings[ctx][name] !== undefined) {
                        return to_boolean_setting(settings[ctx][name], left, right, ctx, name, d);
                    } else {
                        if (settings[ctx] === undefined) {
                            settings[ctx] = {};
                        }
                        settings[ctx][name] = true;
                        return to_boolean_setting(true, left, right, ctx, name, d);
                    }
                } else {
                    if (settings[ctx] && settings[ctx][name] !== undefined) {
                        return to_setting(settings[ctx][name], ctx, name, d);
                    } else {
                        if (settings[ctx] === undefined) {
                            settings[ctx] = {};
                        }
                        settings[ctx][name] = def;
                        return to_setting(def, ctx, name, d);
                    }
                }
            });
        var_name = s.var;
    }

    settings_dom.innerHTML = html;

    drop_cache = true;
    update_values();
}

function update_values() {
    range_tree = build_range_tree();

    resize_canvas();
}

function update_colors() {
    let foreground = color_foreground.value;
    let background = color_background.value;

    settings.colors.main = foreground;
    settings.colors.bg = background;

    document.body.style.setProperty("--background", background);
    let [br, bg, bb] = background.slice(1).match(/[0-9a-f]{2}/g).map(raw => Number.parseInt(raw, 16));
    if (br * 0.299 + bg * 0.587 + bb * 0.114 > 186) {
        document.body.style.setProperty("--foreground", "#080808");
        document.body.style.setProperty("--button-foreground", "#000000");
        document.body.style.setProperty("--button-outline", "rgba(0, 0, 0, 0.25)");
        document.body.style.setProperty("--button-outline-focused", "rgba(0, 0, 0, 0.5)");

        document.body.style.setProperty("--variable-1", "#29404f");
        document.body.style.setProperty("--variable-2", "#563c2a");
        document.body.style.setProperty("--variable-3", "#3f0939");
    } else {
        document.body.style.setProperty("--foreground", "#e5e5e5");
        document.body.style.setProperty("--button-foreground", "#ffffff");
        document.body.style.setProperty("--button-outline", "rgba(255, 255, 255, 0.1)");
        document.body.style.setProperty("--button-outline-focused", "rgba(255, 255, 255, 0.5)");

        document.body.style.setProperty("--variable-1", "#a9d0df");
        document.body.style.setProperty("--variable-2", "#e6bcaa");
        document.body.style.setProperty("--variable-3", "#cf99c9");
    }
}

function to_setting(value, ctx, name, drop_cache = false) {
    return `<span class="input ${ctx}__${name}" contenteditable="true" onkeyup="settings['${ctx}']['${name}'] = this.innerText;${drop_cache ? "drop_cache = true;" : ""};update_values();">${value}</span>`;
}

// TODO: use DOM objects and make the sub-elements respond to clicks/enter aswell
function to_boolean_setting(value, left, right, ctx, name, drop_cache = false) {
    return `<span class="input boolean ${value ? "left" : "right"} ${ctx}__${name}" onclick="
        settings['${ctx}']['${name}'] = !settings['${ctx}']['${name}'];
        console.log(this.classList);
        this.classList.remove('left');
        this.classList.remove('right');
        this.classList.add(settings['${ctx}']['${name}'] ? 'left' : 'right');
        ${drop_cache ? "drop_cache = true;" : ""}
        update_values();
    "><span class="left">${left}</span>/<span class="right">${right}</span></span>`;
}

function export_to_png(new_tab) {
    let width = +export_width_dom.value;
    let height = +export_height_dom.value;

    ctx.width = canvas.width = width;
    ctx.height = canvas.height = height;

    redraw_canvas(!export_background_dom.checked, true);
    let url = canvas.toDataURL("image/png");

    resize_canvas();

    if (new_tab) {

        let win = window.open();
        win.document.write(`<img src=${url} />`);
        win.document.body.style.display = "flex";
        win.document.body.style.alignItems = "center";
        win.document.body.style.justifyContent = "center";
        win.document.body.style.minHeight = "100vh";
        win.document.body.style.margin = 0;

    } else {
        let a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        let download = current_selections.join("-");
        download += "-" + width + "x" + height;
        download += ".png";
        a.download = download;
        a.click();
    }
}

function build_range_tree(step = 0) {
    if (step >= METHODS[method].steps.length) return [{colors: settings.colors}]; // {∅}

    let res = build_range_tree(step + 1);

    let step_settings = settings[current_selections[step]];
    let merged = false;
    for (let key in step_settings) {
        let match;
        if (match = /^(-?[0-9]+)\.\.(-?[0-9]+)$/.exec(step_settings[key])) {
            if (+match[1] < +match[2] && +match[2] - +match[1] < MAX_RANGE) {
                // res ^ match[1]..match[2]
                merged = true;
                let tmp = [];
                for (let x = +match[1]; x < +match[2]; x++) {
                    tmp = tmp.concat(res.map(obj => {
                        if (obj[current_selections[step]] === undefined) {
                            return {
                                ...obj,
                                [current_selections[step]]: {
                                    ...step_settings,
                                    [key]: String(x),
                                }
                            };
                        } else {
                            let y = {...obj};
                            y[current_selections[step]] = {
                                ...y[current_selections[step]],
                                [key]: String(x),
                            };
                            return y;
                        }
                    }));
                }
                res = tmp;
            }
        }
    }

    if (!merged) {
        // res + step_settings
        return res.map(x => ({...x, [current_selections[step]]: step_settings}));
    } else {
        return res;
    }
}

window.addEventListener("resize", resize_canvas);
