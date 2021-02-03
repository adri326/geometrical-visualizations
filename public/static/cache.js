class CacheSeq {
    constructor(seq) {
        this.seq = seq;
        this.instance = null
        this.cache = [];
        this.index = 0;
        this.done = false;
    }

    reset(...args) {
        this.instance = this.seq(...args);
        this.cache = [];
        this.index = 0;
        this.done = false;
    }

    rewind() {
        this.index = 0;
    }

    next() {
        if (this.index < this.cache.length) {
            let res = this.cache[this.index];
            this.index++;
            return {
                value: res,
                done: this.index >= this.cache.length && this.done,
            };
        } else if (!this.done) {
            let res = this.instance.next();
            if (res.value !== undefined) {
                this.cache.push(res.value);
            }
            this.done = res.done;
            this.index++;
            return res;
        } else {
            return {
                value: undefined,
                done: true,
            }
        }
    }
}

class CacheMat {
    constructor(mat) {
        this.mat = mat;
        this.args = [];
        this.cache = null;
    }

    reset(...args) {
        this.args = args;
        this.cache = null;
    }

    get() {
        if (this.cache === null) {
            this.cache = this.mat(...this.args);
        }
        return this.cache;
    }
}

class CacheMatGen {
    constructor(mat) {
        this.mat = mat;
        this.instance = null;
        this.cache = null;
        this.done = false;
        this.width = 0;
        this.height = 0;
    }

    reset(...args) {
        this.instance = this.mat(...args);
        this.cache = null;
        this.done = false;
        this.width = 0;
        this.height = 0;
    }

    next() {
        if (this.done) {
            return {
                value: this.cache,
                done: true
            };
        } else {
            let res = this.instance.next();
            if (res.value !== undefined) {
                this.cache = res.value;
            }
            this.done = res.done;
            return res;
        }
    }
}

function cachify(obj) {
    let res = {};
    for (let key in obj) {
        res[key] = new CacheSeq(obj[key]);
        for (let prop of Reflect.ownKeys(obj[key])) {
            Reflect.set(res[key], prop, Reflect.get(obj[key], prop));
        }
    }
    return res;
}

function cachify_mat(obj) {
    let res = {};
    for (let key in obj) {
        if (obj[key].constructor.name === "GeneratorFunction" || obj[key].generator) {
            res[key] = new CacheMatGen(obj[key]);
            for (let prop of Reflect.ownKeys(obj[key])) {
                Reflect.set(res[key], prop, Reflect.get(obj[key], prop));
            }
        } else {
            res[key] = new CacheMat(obj[key]);
            for (let prop of Reflect.ownKeys(obj[key])) {
                Reflect.set(res[key], prop, Reflect.get(obj[key], prop));
            }
        }
    }
    return res;
}
