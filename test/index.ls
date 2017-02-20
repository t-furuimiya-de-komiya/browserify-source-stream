require! './test.ls': {expect, Browserify}

suite \index

test 'basic' ->
    new Browserify basedir: 'test/target'
    .on \warn -> console.log '[WARNING]', it
    .on \bundle-error -> console.error '[ERROR]' it
    .on \watchify-log (name, log) -> console.log '[watchify] %s %s', name, log
    .src 'index.js'
    .on 'data' ->
        expect it .to.have.property 'path', 'index.js'
    .start!
