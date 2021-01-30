class CacheSeq {
    constructor(seq) {
        this.seq = seq;
        this.cache = [];
        this.index = 0;
        this.done = false;
    }

    reset() {
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
            let res = this.seq.next();
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
