(function (root, factory) {
	if (typeof define === "function" && define.amd) {
		define([], factory);
	} else if (typeof exports === "object") {
		module.exports = factory();
	} else {
		root.log = factory();
	}
}(this, function () {
	/**
	 * Конфигурация консоли:
	 * log - через запятую передаем список каналов, которые хотим увидеть в консоли
	 * console - отображает окно с консолью поверх интерфейса, полезно для айпада
	 * cpos - [0-3] позиционирование консоли на экране
	 */

	var channels = [],
		colors = {},
		logger = {},
		showAll = false,
		logHistory = [],
		consoleContainer = null,
		consoleText = null,
		consolePosition = parseInt(getParameterByName('cpos', 0)),
		showConsole = getParameterByName('console', '') != '',
		params = getParameterByName('log', ''),
		positionStyles = [
			{left: 0, right: 'auto', top: 0, bottom: 'auto'},
			{left: 'auto', right: 0, top: 0, bottom: 'auto'},
			{left: 'auto', right: 0, top: 'auto', bottom: 0},
			{left: 0, right: 'auto', top: 'auto', bottom: 0}
		];

	if (showConsole) {
		addConsole();
		window.onerror = function (message, url, lineNumber) {
			logToFloatConsole('Error', [message, url, lineNumber]);
			return false;
		};
	}

	if (params) {
		channels = params.split(',')
	}

	logger.log = function () {
		var channel = arguments[0];
		if (hasChannel(channel)) {
			var args = Array.prototype.slice.call(arguments, 1);
			console.log('%c' + channel, 'color: ' + getChannelColor(channel), args);
			logToFloatConsole(channel, args);
		}
	};

	function logToFloatConsole(channel, args) {
		if (showConsole) {
			if (consoleContainer) {
				writeToConsole(channel, args);
			} else {
				logHistory.push({ch: channel, args: args});
			}
		}
	}

	logger.all = function () {
		showAll = true;
	};

	logger.list = function () {
		console.log(channels);
	};

	logger.enabled = function () {
		return params != "";
	};

	logger.activate = function (listChannels) {
		channels = listChannels.split(',');
	};

	function hasChannel(ch) {
		return showAll || channels.indexOf(ch) != -1;
	}

	function getParameterByName(name, defaultValue) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results == null ? defaultValue : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	function getChannelColor(ch) {
		if (!colors.hasOwnProperty(ch)) {
			colors.ch = stringToColour(ch);
		}
		return colors.ch;
	}

	function stringToColour(str) {
		for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash)) {
		}
		for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2)) {
		}
		return colour;
	}

	function htmlToElement(html) {
		var div = document.createElement('div')
		div.innerHTML = html;
		return div.childNodes;
	}

	function addConsole() {
		setTimeout(tryAddConsole, 10);
		function tryAddConsole() {
			if (document.body) {
				let consoleElement = htmlToElement('<div id="consoleContainer" style="position:absolute; top:0; left:0; width:250px; z-index:100000;"><div id="consoleText" no-prevent-default="true" style="padding:5px;  overflow-y: scroll; -webkit-overflow-scrolling: touch;  height:300px; background:#EEE; border: 1px solid #999;"></div><div id="consoleChangePos" style="height:40px; background:#DDD; border: 1px solid #999; text-align: center; line-height: 40px">CHANGE POSITION</div><div id="consoleClear" style="height:40px; background:#DDD; border: 1px solid #999; text-align: center; line-height: 40px">CLEAR</div></div>')[0]
				document.body.appendChild(consoleElement)
				consoleContainer = document.getElementById('consoleContainer');
				consoleText = document.getElementById('consoleText');
				var event = 'ontouchstart' in document ? 'touchstart' : 'click';
				document.getElementById('consoleChangePos').addEventListener(event, function (e) {
					toggleConsolePosition();
				});
				document.getElementById('consoleClear').addEventListener(event, function (e) {
					consoleText.innerHTML = '';
				});
				applyPosition(consolePosition);
				logHistory.forEach(function (line) {
					writeToConsole(line.ch, line.args);
				});
				logHistory = null;
			} else {
				setTimeout(tryAddConsole, 10);
			}
		}
	}

	function toggleConsolePosition() {
		consolePosition = consolePosition == positionStyles.length - 1 ? 0 : consolePosition + 1;
		applyPosition(consolePosition);
	}

	function applyPosition(posId) {
		var styles = positionStyles[posId];
		for (var p in styles) {
			consoleContainer.style[p] = styles[p];
		}
	}

	function writeToConsole(ch, args) {
		consoleText.innerHTML += ch + ':: ' + args + '<br>';
		consoleText.scrollTop = consoleText.scrollHeight;
	}

	window.rtbLogger = logger
	return logger;
}));


