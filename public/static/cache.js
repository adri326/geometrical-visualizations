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
        res[key] = new CacheMat(obj[key]);
        for (let prop of Reflect.ownKeys(obj[key])) {
            Reflect.set(res[key], prop, Reflect.get(obj[key], prop));
        }
    }
    return res;
}
