const Nightmare = require('nightmare');
const Xvfb = require('xvfb');
const xvfb = new Xvfb({displayNum: 99, reuse: true, silent: true});

module.exports = function(query, url, doneCallback) {
    let startTime;
    xvfb.start(function () {
        startTime = Date.now();
        run({
                query: query,
                url: url
            },
            () => {
                xvfb.stop();
            });
    });

    function run(params, callbackExit) {
        let returnRes = {};
        let incrimentPos = 0;
        let pageLinks = [];
        let screenshotsNames = [];

        var nightmare = new Nightmare({
            width: 1920,
            height: 1080,
            show: false,
            waitTimeout: 4000,
            webPreferences: {
                zoomFactor: 0.7
            }
        });

        nightmare
            .cookies.clear()
            .goto(`https://yandex.ru/search/?text=${params.query}&lr=213`, {
                headers: {
                    "Accept-Language": "en-US,en;q=0.8,ru;q=0.6",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"
                }
            });


        crawl(crawlHandler);

        function crawlHandler(res) {
            returnRes = res;

            let position = searchPosition();
            if (position > 0) {

                doneCallback({
                    position: position + incrimentPos,
                    page_links: pageLinks,
                    time: Date.now() - startTime,
                    screenshots: screenshotsNames
                });

                callbackExit();
                nightmare.end().then();

            } else {
                if(incrimentPos >= 30) {
                    doneCallback({
                        position: -1,
                        page_links: pageLinks,
                        time: Date.now() - startTime,
                        screenshots: screenshotsNames
                    });
                    callbackExit();
                    nightmare.end().then();
                }

                incrimentPos += returnRes.links.length;
                nextPage();
            }
        }

        function nextPage() {
            nightmare
                .evaluate(function () {
                    let nextLink = document.querySelector('.pager>.pager__item_current_yes + a.link');
                    if (nextLink) {
                        return window.location.origin + nextLink.getAttribute('href');
                    }
                    return 'false';
                })
                .then(nextUrl => {
                    if(nextUrl !== 'false') {
                        nightmare
                            .goto(nextUrl)
                            .then(() => {
                                crawl(crawlHandler);
                            });
                    } else {
                        console.error('Err with next url');
                    }
                });
        }

        function crawl(cb) {
            let screenshotName = guid();
            let imagePath = `static/screenshots/${screenshotName}.png`;
            screenshotsNames.push(imagePath);

            console.log(`Image ${screenshotName} for "${query}" @ ${url}`);

            nightmare
                .screenshot(imagePath)
                .evaluate(function () {
                    let links = document.querySelectorAll('.link.link_outer_yes.path__item:first-child[onmousedown]');
                    let linksArr = Array.from(links).map(link => link.innerText);

                    return JSON.stringify({links: linksArr});
                })
                .then(function (searchResult) {
                    try {
                        let json = JSON.parse(searchResult);
                        cb(json);
                    } catch (e) {
                        console.error(e);
                    }
                });
        }

        function searchPosition() {
            let pos = -1;

            pageLinks.push(returnRes.links);

            returnRes.links.forEach((foundLink, index) => {
                if (foundLink.replace('www.', '').toLowerCase() === params.url && pos === -1) {
                    pos = index + 1;
                }
            });

            return pos;
        }

    }

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + s4()+ s4() + s4() + s4();
    }
};

