let canvas, ctx;

let export_button, export_width_dom, export_height_dom, export_background_dom;

// Object containing all of the settings
let settings_dom;
let settings_viz, settings_trans, settings_seq;

let select_viz, select_trans, select_seq;
let method_dom, method = "seq";

let current_viz = "circle_number_modulo";
let current_seq = "fibonacci";
let current_trans = "spiral";

let cache_seq = null;

let settings = {
    colors: {
        main: "#ffffff",
        bg: "#34373b",
    }
};

let METHODS = {
    seq: {
        transformation: false,
        seq: SEQ,
        viz: VIZ,
        default_seq: "fibonacci",
        default_viz: "circle_number_modulo",
    },
    seq_to_mat: {
        transformation: true,
        seq: SEQ,
        trans: MAT_TRANS,
        viz: MAT_VIZ,
        default_seq: "fibonacci",
        default_viz: "placeholder",
        default_trans: "spiral",
    }
}

window.addEventListener("load", () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    method_dom = document.getElementById("select-method");
    method_dom.value = "seq";
    method_dom.addEventListener("change", () => {
        update_method();
        update_dropdowns();
        update_settings();
        resize_canvas();
    });
    settings_dom = document.getElementById("settings");
    settings_trans = document.getElementById("settings-trans");
    settings_viz = document.getElementById("settings-viz");
    settings_seq = document.getElementById("settings-seq");
    settings_dom.addEventListener("keyup", resize_canvas);

    select_viz = document.getElementById("viz");
    select_trans = document.getElementById("trans");
    select_seq = document.getElementById("seq");
    update_dropdowns();
    update_settings();
    select_seq.addEventListener("change", () => {
        update_settings();
        resize_canvas();
    });
    select_trans.addEventListener("change", () => {
        update_settings();
        resize_canvas();
    });
    select_viz.addEventListener("change", () => {
        update_settings();
        resize_canvas();
    });

    export_button = document.getElementById("export-to-png");
    export_width_dom = document.getElementById("export-width");
    export_height_dom = document.getElementById("export-height");
    export_background_dom = document.getElementById("export-background");
    export_button.addEventListener("click", export_to_png);

    resize_canvas();
});

function redraw_canvas(bg = false) {
    ctx.clearRect(0, 0, ctx.width, ctx.height);
    if (bg) {
        ctx.fillStyle = settings.colors.bg;
        ctx.fillRect(0, 0, ctx.width, ctx.height);
    }
    if (cache_seq === null) {
        cache_seq = new CacheSeq(METHODS[method].seq[current_seq](settings));
    } else {
        cache_seq.reset();
    }

    if (METHODS[method].transformation) {
        let mat = METHODS[method].trans[current_trans](cache_seq, settings);
        METHODS[method].viz[current_viz](ctx, mat, settings);
    } else {
        METHODS[method].viz[current_viz](ctx, cache_seq, settings);
    }
}

function resize_canvas() {
    ctx.width = canvas.width = canvas.clientWidth;
    ctx.height = canvas.height = canvas.clientHeight;

    redraw_canvas();
}

function update_method() {
    method = method_dom.value;
    current_seq = METHODS[method].default_seq;
    current_viz = METHODS[method].default_viz;
    if (METHODS[method].transformation) {
        current_trans = METHODS[method].default_trans;
        document.getElementById("transformation-selection").className = "shown";
    } else {
        document.getElementById("transformation-selection").className = "hidden";
    }
}

function update_dropdowns() {
    let html_viz = "";
    for (let name in METHODS[method].viz) {
        html_viz += `<option name="${name}" value="${name}" ${current_viz == name ? "selected" : ""}>${METHODS[method].viz[name].display_name}</option>`;
    }
    select_viz.innerHTML = html_viz;

    if (METHODS[method].transformation) {
        let html_trans = "";
        for (let name in METHODS[method].trans) {
            html_trans += `<option name="${name}" value="${name}" ${current_trans == name ? "selected" : ""}>${METHODS[method].trans[name].display_name}</option>`;
        }
        select_trans.innerHTML = html_trans;
    } else {
        select_trans.innerHTML = "";
    }

    let html_seq = "";
    for (let name in METHODS[method].seq) {
        html_seq += `<option name="${name}" value="${name}" ${current_seq == name ? "selected" : ""}>${METHODS[method].seq[name].display_name}</option>`;
    }
    select_seq.innerHTML = html_seq;

    cache_seq = null;
}

function update_settings() {
    current_seq = select_seq.value;
    current_viz = select_viz.value;
    current_trans = select_trans.value;
    let seq = METHODS[method].seq[current_seq];
    let viz = METHODS[method].viz[current_viz];
    let trans = METHODS[method].transformation ? METHODS[method].trans[current_trans] : null;

    settings_seq.innerHTML = seq.settings
        .replace(/\{([\w]+)\.([\w]+)(?:=([^\}]+))?\}/g, (_, ctx, name, def) => {
            if (settings[ctx] && settings[ctx][name] !== undefined) {
                return to_setting(settings[ctx][name], ctx, name);
            } else {
                if (settings[ctx] === undefined) {
                    settings[ctx] = {};
                }
                settings[ctx][name] = def;
                return to_setting(def, ctx, name, true);
            }
        });

    let var_name = seq.var;

    if (METHODS[method].transformation) {
        settings_trans.innerHTML = trans.settings
            .replace(/\{var\}/g, var_name)
            .replace(/\{([\w]+)\.([\w]+)(?:=([^\}]+))?\}/g, (_, ctx, name, def) => {
                if (settings[ctx] && settings[ctx][name] !== undefined) {
                    return to_setting(settings[ctx][name], ctx, name);
                } else {
                    if (settings[ctx] === undefined) {
                        settings[ctx] = {};
                    }
                    settings[ctx][name] = def;
                    return to_setting(def, ctx, name, false);
                }
            });
        var_name = trans.var;
    } else {
        settings_trans.innerHTML = "";
    }

    settings_viz.innerHTML = viz.settings
        .replace(/\{var\}/g, var_name)
        .replace(/\{([\w]+)\.([\w]+)(?:=([^\}]+))?\}/g, (_, ctx, name, def) => {
            if (settings[ctx] && settings[ctx][name] !== undefined) {
                return to_setting(settings[ctx][name], ctx, name);
            } else {
                if (settings[ctx] === undefined) {
                    settings[ctx] = {};
                }
                settings[ctx][name] = def;
                return to_setting(def, ctx, name, false);
            }
        });

    cache_seq = null;
}

function to_setting(value, ctx, name, drop_cache = false) {
    return `<span class="input ${ctx}__${name}" contenteditable="true" onkeyup="settings['${ctx}']['${name}'] = this.innerText;${drop_cache ? "cache_seq = null;" : ""}">${value}</span>`;
}

function export_to_png() {
    console.log("Hello world");
    let width = +export_width_dom.value;
    let height = +export_height_dom.value;

    ctx.width = canvas.width = width;
    ctx.height = canvas.height = height;

    redraw_canvas(export_background_dom.checked);
    let url = canvas.toDataURL("image/png");

    resize_canvas();
    redraw_canvas();

    let win = window.open(url, "_blank");
    window.win = win;
}

window.addEventListener("resize", resize_canvas);
