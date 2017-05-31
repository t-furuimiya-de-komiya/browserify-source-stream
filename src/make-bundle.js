const browserify = require('browserify')
const watchify = require('watchify')
const Vinyl = require('vinyl')


module.exports = function makeBundle(self, filename, ...args)
{
    let opts = Object.assign({}, watchify.args, ...args)
    let b = create()
    exclude(opts.exclude)
    lookupExternalBundle(opts.external)
    useWatchify(opts.watchify)

    b.on('log', log => self.emit('watchify-log', filename, log))
    b.on('update', make)

    init(!opts.watchify)

    return b


    function create()
    {
        return opts.require || opts.entries ?
            browserify(opts)
        :
            browserify(filename, opts)
    }

    function useWatchify(wopts)
    {
        if (wopts)
            b = watchify(b, Object.assign({}, wopts))
    }

    function exclude(x)
    {
        if (Array.isArray(x))
            x.forEach(exclude)
        else if (x != null)
            b.exclude(x)
    }

    function lookupExternalBundle(ext)
    {
        if (Array.isArray(ext))
            ext.forEach(lookupExternalBundle)
        else if (ext != null)
            b.external(self.bundles.get(ext) || ext)
    }

    function make()
    {
        return new Promise(invokeBundle)
        .then(pushFile)
        .catch(handleError)
    }

    function invokeBundle(resolve, reject)
    {
        b.bundle((err, buf) => err ? reject(err) : resolve(buf))
    }

    function pushFile(contents)
    {
        let file = new Vinyl({contents, path: filename})
        file.extname = '.js'
        self.write(file)
    }

    function handleError(err)
    {
        self.emit('bundle-error', err, filename)
        return err instanceof Error
    }

    function init(noWatch)
    {
        self.endCounter.inc()
        self.watchCounter.inc()
        make().then(failed => {
            if (noWatch && self.endCounter.dec())
                self.end()
            if (self.watchCounter.dec())
                self.emit('watch-start')
        })
    }
}
