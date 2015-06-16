var crawler = require('./crawler.js');
var fs = require('fs');
var $ = require('jQuery');

// var url = "http://blog.fens.me/nodejs-crawler-douban/";
// crawler.get(url, function (document, status) {
// 	console.log($(document).find("p").size());
// 	console.log($($(document).find("p").get(0)).text());
// });
//crawler.get("error404");

// crawler.getLocal("./javdog/artist", "utf-8", function (document) {
// //console.log($(document).find("p").size());
// console.log(getPages(document));
// });

// crawler.get("http://www.javdog.com/cn/star/9pj", function (document) {
// //console.log("hello");
// console.log(getPages(document));
// });

// crawler.getStream("http://note.youdao.com/web/images/logo-icon.png", function (response) {
// //console.debug("getStream");

// var fileWriteStream = fs.createWriteStream('./logo-icon.png');
// response.pipe(fileWriteStream);
// fileWriteStream.on('close', function () {
// console.log('copy over');
// });
// });

// crawler.saveToFile("http://note.youdao.com/web/images/logo-icon.png", './logo-icon3.png');

var supporttedLang = ["en", "ja", "cn" /*, "tw"*/ ];

// changeLang("http://www.javdog.com/en/actresses", "cn");

function changeLang(strUrl, language) {
    console.info("language: " + language);
    console.info("old url: " + strUrl);
    var regLang = /(.*)\/(en|ja|cn|tw)\/(.*)/;
    var newUrl = strUrl.replace(regLang, "$1/" + language + "/$3");
    console.info("new url: " + newUrl);
    return newUrl;

    // var url = require('url');
    // var objUrl = url.parse(strUrl);
    // console.debug(objUrl);

    // var supporttedLang = ["en", "ja", "cn", "tw"];
    // var regLang = /(.*)\/(en|ja|cn|tw)\/(.*)/;

    // // if (supporttedLang.join(",").indexOf(objUrl.path.substr(1, 2)) > 0) {
    // if (regLang.test(objUrl.path)) {
    // var newUrl = objUrl.protocol + objUrl.host + objUrl.port + "/" + language + objUrl.path.substr(;
    // } else {
    // console.error("language [" + language + "] not changed.");
    // }
}

var favors = [{
    name: "9pj",
    url: "http://www.javdog.com/cn/star/9pj"
}, {
    name: "lxx",
    url: "http://www.javdog.com/cn/star/lxx"
}];

function analysis() {}

function convert() {}

function process() {}

//getAllActresses("./javdog/en/actresses");
//getAllActresses("http://www.javdog.com/en/actresses/currentPage/168");

function getAllActresses(startUrl) {
    var actresses = [];

    function getNextUrl(context) {
        // console.debug(context);
        //console.debug(context.crawled);
        try {
            // find in languages
            //console.info("find in languages");
            //for (var i = 0; i < supporttedLang.length; i++) {
            //	var newUrl = changeLang(context.currentUrl, supporttedLang[i]);
            //	if (newUrl != context.currentUrl && !context.isCrawled(newUrl)) {
            //		return newUrl;
            //	}
            //}

            // find in paging
            console.info("find in paging");
            // 同步
            var list = $(context.document).find("ul.pagination li");
            for (var i = 0; i < list.length; i++) {
                if ($(list[i]).hasClass("active")) {
                    var href = $(list[i]).next().find("a").attr("href");
                    if (href) {
                        var url = require('url');
                        var objUrl = url.parse(href);
                        //console.debug(objUrl);
                        if (objUrl.host) {

                        } else {
                            return context.currentUrlObj.protocol + "//" + context.currentUrlObj.host + objUrl.path;
                        }
                    }
                    return null;
                    //return url;
                }
            }

            // 异步
            // $(context.document).find("ul.pagination li").each(function () {
            // if ($(this).hasClass("active")) {
            // // console.info("bingo");
            // // console.info($(this).html());
            // var url = $(this).next().find("a").attr("href");
            // return url;
            // }
            // });
        } catch (e) {
            console.error("getNextUrl error: " + e);
        }
        return null;
    }

    function crawl(context) {
        // console.debug(context);
        // console.debug(context.crawled);

        if (context.isCrawled(context.currentUrl)) {
            return;
        }

        //crawler.getLocal(context.currentUrl, "utf-8", function (document, error) {
        crawler.get(context.currentUrl, function(document, error) {
            // console.debug(document);
            try {
                if (error) {
                    throw error;
                }

                $(document).find("#waterfall a.avatar-box").each(function(index) {
                    // console.info(index);
                    var aAvatar = $(this);
                    // console.info(aAvatar.attr("href"));
                    var name = aAvatar.find("div.photo-info span").text().trim();
                    var href = aAvatar.attr("href");
                    var image = aAvatar.find("img").attr("src");

                    var code = href.substr(href.lastIndexOf('/') + 1, href.length - href.lastIndexOf('/') + 1);
                    var filename = image.substr(image.lastIndexOf('/') + 1, image.length - image.lastIndexOf('/') + 1);

                    var info = {
                        code: code,
                        name: name,
                        href: href,
                        image: image,
                        filename: filename
                    };

                    //console.info(info);
                    actresses.push(info);

                    fs.appendFile('actresses.json', JSON.stringify(info) + "\r\n", function(err) {
                        if (err) {
                            console.error(err);
                        }
                    });
                });

                context.document = document;
                context.crawled.push({
                    url: context.currentUrl,
                    success: true
                });
            } catch (e) {
                console.error("crawl error: " + e);
                context.crawled.push({
                    url: context.currentUrl,
                    success: false,
                    error: e
                });
            }

            var nextUrl = getNextUrl(context);
            console.debug("nextUrl: " + nextUrl);
            if (nextUrl) {
                context.currentUrl = nextUrl;
                crawl(context);
            } else {
                //console.debug(actresses);

                fs.writeFile('actresses_result.json', JSON.stringify(context.crawled) + "\r\n", function(err) {
                    if (err) {
                        console.error(err);
                    }
                });

                getAllMoviesOfActress(actresses);
            }
        });
    }

    function Context() {}
    Context.prototype.toString = function() {
        return "hello, context.";
    }
    Context.prototype.isCrawled = function(url) {
        for (var i = 0; i < this.crawled.length; i++) {
            if (url && this.crawled[i] && url == this.crawled[i].url) {
                return true;
            }
        }
        return false;
    }

    var context = new Context();
    context.startUrl = startUrl;
    context.currentUrl = startUrl;
    var url = require('url');
    var objUrl = url.parse(startUrl);
    context.currentUrlObj = objUrl;
    context.document = null;
    context.currentLang = "en";
    context.crawled = [];
    crawl(context);
    // console.debug(context.crawled);  // 异步：看不到内容
}

function getActressInfo() {}

function getMovies(startUrl) {
    var movies = [];

    function getNextUrl(context) {
        // console.debug(context);
        //console.debug(context.crawled);
        try {
            // find in paging
            console.info("find in paging");
            // 同步
            var list = $(context.document).find("ul.pagination li");
            for (var i = 0; i < list.length; i++) {
                if ($(list[i]).hasClass("active")) {
                    var href = $(list[i]).next().find("a").attr("href");
                    if (href) {
                        var url = require('url');
                        var objUrl = url.parse(href);
                        //console.debug(objUrl);
                        if (objUrl.host) {

                        } else {
                            return context.currentUrlObj.protocol + "//" + context.currentUrlObj.host + objUrl.path;
                        }
                    }
                    return null;
                    //return url;
                }
            }
        } catch (e) {
            console.error("getNextUrl error: " + e);
        }
        return null;
    }

    function crawl(context) {
         //console.debug(context);
        // console.debug(context.crawled);

        if (context.isCrawled(context.currentUrl)) {
            return;
        }

        //crawler.getLocal(context.currentUrl, "utf-8", function (document, error) {
        crawler.get(context.currentUrl, function(document, error) {
             //console.debug(document);
            try {
                if (error) {
                    throw error;
                }

                $(document).find("#waterfall .avatar-box").each(function(index) {
                    console.debug($(this).text());
                });

                var movieList = $(document).find("#waterfall .movie-box");
                for (var i = 0; i < movieList.length; i++) {
                    var movieBox = movieList[i];

                    var href = $(movieBox).attr("href");
                    var title = $(movieBox).find("img").attr("title");
                    var sImage = $(movieBox).find("img").attr("src");
                    var fanhao = $(movieBox).find("date:first").text();
                    var publishDate = $(movieBox).find("date:last").text();
                    var code = href.substr(href.lastIndexOf('/') + 1, href.length - href.lastIndexOf('/') + 1);
                    var filename = sImage.substr(sImage.lastIndexOf('/') + 1, sImage.length - sImage.lastIndexOf('/') + 1);
                    var sTemp = sImage.replace("/" + filename, "");
                    var folder = sTemp.substr(sTemp.lastIndexOf('/') + 1, sTemp.length - sTemp.lastIndexOf('/') + 1);

                    var movie = {
                        code: code,
                        href: href,
                        title: title,
                        folder: folder,
                        sImage: sImage,
                        sImageName: filename,
                        fanhao: fanhao,
                        publishDate: publishDate
                    };
                    movies.push(movie);

                    getMovieInfo(movie);
                }

                console.debug(movies);

                context.document = document;
                context.crawled.push({
                    url: context.currentUrl,
                    success: true
                });
            } catch (e) {
                console.error("crawl error: " + e);
                context.crawled.push({
                    url: context.currentUrl,
                    success: false,
                    error: e
                });
            }

            var nextUrl = getNextUrl(context);
            console.debug("nextUrl: " + nextUrl);
            if (nextUrl) {
                context.currentUrl = nextUrl;
                crawl(context);
            } else {
                //console.debug(actresses);

                fs.writeFile('movies_result.json', JSON.stringify(context.crawled) + "\r\n", function(err) {
                    if (err) {
                        console.error(err);
                    }
                });
            }
        });
    }

    function Context() {}
    Context.prototype.toString = function() {
        return "hello, context.";
    }
    Context.prototype.isCrawled = function(url) {
        for (var i = 0; i < this.crawled.length; i++) {
            if (url && this.crawled[i] && url == this.crawled[i].url) {
                return true;
            }
        }
        return false;
    }

    var context = new Context();
    context.startUrl = startUrl;
    context.currentUrl = startUrl;
    var url = require('url');
    var objUrl = url.parse(startUrl);
    context.currentUrlObj = objUrl;
    context.document = null;
    context.currentLang = "en";
    context.crawled = [];
    crawl(context);
    // console.debug(context.crawled);  // 异步：看不到内容
}

var a = [{
    "code": "cqh",
    "name": "Iwamizawa Kyouko",
    "href": "http://www.javdog.com/cn/star/9pj",
    "image": "http://pics.dmm.co.jp/mono/actjpgs/igawa_zyuri.jpg",
    "filename": "igawa_zyuri.jpg"
}];
getAllMoviesOfActress(a);

function getAllMoviesOfActress(actresses) {
    var path = "./javdog/avatars";
    fs.exists(path, function(exists) {
        if (!exists) {
            fs.mkdir(path, function(err) {});
        }
        for (var i = 0; i < actresses.length; i++) {
            var actress = actresses[i];
            for (var i = 0; i < actresses.length; i++) {
                var actress = actresses[i];
                crawler.saveToFile(actress.image, path + "/" + actress.filename);
                getMovies(actress.href);
            }
        }
    });
}

function getMovieInfo(movie) {
    //crawler.getLocal(context.currentUrl, "utf-8", function (document, error) {
    crawler.get(movie.href, function(document, error) {
        // console.debug(document);
        try {
            if (error) {
                throw error;
            }

            movie.lImage = $(document).find(".screencap .bigImage").attr("href");
            movie.info = $(document).find(".screencap .info").text();
            movie.samples = [];
            var sampleList = $(document).find("#sample-waterfall .sample-box img");

            console.debug(movie);

            for (var i = 0; i < sampleList.length; i++) {
                var sample = sampleList[i];

                var href = $(sample).attr("src");
                movie.samples.push(href);
            }
        } catch (e) {
            console.error("crawl error: " + e);
        }
    });
}

function getGenres() {}

function getCover() {}

function getSamples() {}

function getThumbnails() {}

function hasNextPage(document) {
    $(document).find(".pagination li a");
}

function getPages(document) {
    var count = $(document).find(".pagination li a").size() - 1;
    return count > 0 ? count : 0;
}
