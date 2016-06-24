const Nightmare = require('nightmare');
const Xvfb = require('xvfb');

const SCREEN_OPTIONS = {
    width: 1280,
    height: 700
};

const xvfb = new Xvfb();

xvfb.start(function(){
    console.log(arguments);
    run();
    xvfb.stop();
});

function run(){
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
        })
}


