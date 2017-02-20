const stream = require('stream')
const makeBundle = require('./make-bundle')


module.exports = class BrowserifySourceStream extends stream.PassThrough
{
    constructor(opts)
    {
        super({objectMode: true})
        this.opts = opts
        this.endCounter = counter()
        this.watchCounter = counter()
        this.bundles = new Map()
    }

    src(filename, opts)
    {
        if (this.bundles.has(filename))
            throw new Error('bundle name must be unique. duplicated: ' + filename)

        this.bundles.set(filename, makeBundle(this, filename, this.opts, opts))

        return this
    }

    start(dest, opts)
    {
        if (dest)
            this.pipe(dest, opts)
        if (this.watchCounter.flag)
            return new Promise(resolve => this.once('watch-start', resolve))
        if (!this.bundles.size) {
            this.emit('warn', 'No bundles')
            this.end()
        }
        return Promise.resolve()
    }
}


function counter(cnt=0)
{
    return {
        inc() { cnt += 1 },
        dec() { return --cnt <= 0 },
        get flag() { return 0 < cnt },
    }
}
