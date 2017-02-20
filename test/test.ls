#require! <[chai chai-as-promised]>

#chai.use chai-as-promised
require! chai

export chai.expect
export Browserify = require '..'

export function delay t
    new Promise (|> set-timeout(_, t))
