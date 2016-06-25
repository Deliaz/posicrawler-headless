const Nightmare = require('nightmare');
const Xvfb = require('xvfb');
const xvfb = new Xvfb({displayNum:99, reuse: true, silent: true});

xvfb.start(function(){
    run(() => {
        xvfb.stop();
    });
});

function run(cb){
    var nightmare = new Nightmare({
        width: 1280,
        height: 700,
        show: false,
        waitTimeout: 6000
    });

    nightmare
        .goto('http://www.google.es')
        .evaluate(function(){
            return document.title;
        })
        .end()
        .then(function(l) {
          console.log(l);
            cb();
        })
}


