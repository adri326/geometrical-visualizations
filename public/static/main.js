// Main canvas and its 2d context
let canvas, ctx;

// Export section
let export_button, export_width_dom, export_height_dom, export_background_dom;
let newtab_button;

// Object containing all of the settings
let settings_dom;
let settings_viz, settings_trans, settings_seq;

// Selection section
let select_viz, select_trans, select_seq;
let method_dom, method = "seq";

// Selected methods (TODO: use an array instead)
let current_viz = "circle_number_modulo";
let current_seq = "fibonacci";
let current_trans = "spiral";

// Colors
let color_background, color_foreground, color_reset;

// Sequence caching
let cache_seq = null;

// Settings
let settings = {
    colors: {
        main: "#ffffff",
        bg: "#34373b",
    }
};

// Methods (TODO: use arrays and make it more modular)
const METHODS = {
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
    // Get canvas element
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    // Method selection and listener
    method_dom = document.getElementById("select-method");
    method_dom.value = "seq";
    method_dom.addEventListener("change", () => {
        update_method();
        update_dropdowns();
        update_settings();
        resize_canvas();
    });

    // Settings section
    settings_dom = document.getElementById("settings");
    settings_trans = document.getElementById("settings-trans");
    settings_viz = document.getElementById("settings-viz");
    settings_seq = document.getElementById("settings-seq");
    settings_dom.addEventListener("keyup", resize_canvas);

    // Selection section (listeners are added later)
    select_viz = document.getElementById("viz");
    select_trans = document.getElementById("trans");
    select_seq = document.getElementById("seq");

    // Color section
    color_reset = document.getElementById("color-reset");
    color_background = document.getElementById("color-background");
    color_foreground = document.getElementById("color-foreground");

    // Update the UI
    update_colors();
    update_dropdowns();
    update_settings();

    // Lots of listeners
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

    resize_canvas();
});

function redraw_canvas(bg = false, exp = false) {
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
        METHODS[method].viz[current_viz](ctx, mat, settings, exp);
    } else {
        METHODS[method].viz[current_viz](ctx, cache_seq, settings, exp);
    }
}

function resize_canvas() {
    ctx.width = canvas.width = canvas.clientWidth * window.devicePixelRatio;
    ctx.height = canvas.height = canvas.clientHeight * window.devicePixelRatio;

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
        .replace(/\{([\w_]+)\.([\w_]+)(?:=([^\}]+))?\}/g, (_, ctx, name, def) => {
            if (settings[ctx] && settings[ctx][name] !== undefined) {
                return to_setting(settings[ctx][name], ctx, name, true);
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
            .replace(/\{([\w_]+)\.([\w_]+)(?:=([^\}]+))?\}/g, (_, ctx, name, def) => {
                if (settings[ctx] && settings[ctx][name] !== undefined) {
                    return to_setting(settings[ctx][name], ctx, name, false);
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
        .replace(/\{([\w_]+)\.([\w_]+)(?:=([^\}]+))?\}/g, (_, ctx, name, def) => {
            if (settings[ctx] && settings[ctx][name] !== undefined) {
                return to_setting(settings[ctx][name], ctx, name, false);
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
    return `<span class="input ${ctx}__${name}" contenteditable="true" onkeyup="settings['${ctx}']['${name}'] = this.innerText;${drop_cache ? "cache_seq = null;" : ""}">${value}</span>`;
}

function export_to_png(new_tab) {
    console.log("Hello world");
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
        let download = current_seq;
        if (METHODS[method].transformation) download += "-" + current_trans;
        download += "-" + current_viz;
        download += "-" + width + "x" + height;
        download += ".png";
        a.download = download;
        a.click();
    }
}

window.addEventListener("resize", resize_canvas);
