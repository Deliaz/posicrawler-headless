const Xvfb = require('xvfb');
const Nightmare = require('nightmare');

const nightmare = Nightmare({ show: false });
const xvfb = new Xvfb();

xvfb.start((err, xvfbProcess) => {
    console.log(err, xvfbProcess);

    nightmare
        .goto('http://yahoo.com')
        .type('form[action*="/search"] [name=p]', 'github nightmare')
        .click('form[action*="/search"] [type=submit]')
        .wait('#main')
        .evaluate(function () {
            return document.querySelector('#main .searchCenterMiddle li a').href
        })
        .end()
        .then(function (result) {
            console.log(result)
        })
        .catch(function (error) {
            console.error('Search failed:', error);
        });

    xvfb.stop();
});