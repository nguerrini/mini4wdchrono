'use strict';

const { app } = require('electron').remote;
const path = require('path');

// %APPDATA% on Windows
// $XDG_CONFIG_HOME or ~/.config on Linux
// ~/Library/Application Support on macOS
var dir = app.getPath('userData');
var filepath = path.join(dir, 'settings.json');
const globalConf = require('nconf').file('global', { file: filepath });

globalConf.defaults({
	'sensorPin1': 6,
	'sensorPin2': 7,
	'sensorPin3': 8,
	'ledPin1': 3,
	'ledPin2': 4,
	'ledPin3': 5,
	'piezoPin': 2,
	// 'usbPort': 'COM3',
	'title': 'MINI4WD CHRONO',
	'raceMode': 0,

	'timeThreshold': 40, // race specific, move to the other file if needed
	'speedThreshold': 5, // race specific, move to the other file if needed
	'startDelay': 3, // race specific, move to the other file if needed
});

const set = (settingKey, settingValue) => {
	globalConf.set(settingKey, settingValue);
	globalConf.save();
};

const get = (settingKey) => {
	globalConf.load();
	return globalConf.get(settingKey);
};

const del = (settingKey) => {
	globalConf.clear(settingKey);
	globalConf.save();
};

module.exports = {
	set: set,
	get: get,
	del: del
};
