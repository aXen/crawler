// http://blog.fens.me/nodejs-crawler-douban/

// npm install https://github.com/tmpvar/jsdom/tarball/4cf155a1624b3fb54b2eec536a0c060ec1bab4ab
// npm install jQuery
// npm install xmlhttprequest
// npm install request
// npm install htmlparser

var http = require('http');
var request = require('request');
var fs = require('fs');

var crawler = function () {};

function createOptions(strUrl) {
	var url = require('url');
	var objUrl = url.parse(strUrl);

	var headers = {
		'Accept' : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		'Host' : objUrl.host,
		'Connection' : 'keep-alive',
		'User-Agent' : 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.131 Safari/537.36'
	};
	return {
		hostname : objUrl.host,
		path : objUrl.path,
		headers : headers
	};
}

crawler.prototype.getDocument = function (url, callback) {
	console.info("begin get(" + url + ")");
	// request不适用于图片等
	request(url, function (error, response, body) {
		console.debug(response);
		console.info('STATUS: ' + response.statusCode);
		console.info('HEADERS: ' + JSON.stringify(response.headers));
		if (!error && response.statusCode == 200) {
			console.info("get(" + url + ") successfully!");
			// console.debug("body: \r\n" + body);
			if (callback) {
				callback(body, response.statusCode);
			}
		} else {
			console.error(error);
		}
	});
};

crawler.prototype.pipeStream = function (url, stream, callback) {
	var options = createOptions(url);

	console.info("begin get(" + url + ")");

	var req = http.request(options, function (response) {
			response.pipe(stream);
		}).on('error', function (e) {
			console.error("Got error: " + e.message);
		});

	req.end();
};

crawler.prototype.saveToFile = function (url, filePath, callback) {
	var fileWriteStream = fs.createWriteStream(filePath);
	crawler.prototype.pipeStream(url, fileWriteStream);
	fileWriteStream.on('close', function () {
		if (callback) {
			callback();
		}
	});
};

crawler.prototype.getStream = function (url, callback) {
	var options = createOptions(url);
	console.info("begin get(" + url + ")");

	var req = http.request(options, function (response) {
			//console.debug(response);
			if (callback) {
				callback(response);
			}
		}).on('error', function (e) {
			console.error("Got error: " + e.message);
			if (callback) {
				callback(null, e);
			}
		});

	req.end();
};

crawler.prototype.get = function (url, callback) {
	var options = createOptions(url);

	console.info("begin get(" + url + ")");

	var body = '';
	var req = http.request(options, function (response) {
			response.on('data', function (chunk) {
				body += chunk;
			}).on('end', function () {
				if (response.statusCode == 200) {
					//console.log(response.headers);
					console.info("get(" + url + ") successfully!");
					//console.debug("body: \r\n" + body);
					if (callback) {
						callback(body);
					}
				}
			});
		}).on('error', function (e) {
			console.error("Got error: " + e.message);
			if (callback) {
				callback(null, e);
			}
		});

	req.end();
};

crawler.prototype.getLocal = function (filePath, encoding, callback) {
	encoding = encoding || "utf-8";
	console.info("begin get(" + filePath + ")");
	fs.readFile(filePath, encoding, function (error, fileData) {
		if (error) {
			console.error(error);
		} else {
			console.info("get(" + filePath + ") successfully!");
		}
		//console.debug(fileData);
		if (callback) {
			callback(fileData, error);
		}
	});
};

var log4js = require('log4js');
log4js.configure({
	appenders : [{
			type : 'console',
			level : 'INFO'
		}, {
			type : 'file',
			filename : 'logs/crawler.log',
			maxLogSize : 10240,
			backups : 4
			//category: 'normal'
		}
	],
	replaceConsole : true
});

module.exports = new crawler();
