'use strict';

const app = require('electron').remote.app;
const filename = 'settings.json';

const getConfigFilePath = () => {
	// %APPDATA% on Windows
	// $XDG_CONFIG_HOME or ~/.config on Linux
	// ~/Library/Application Support on macOS
	var dir = app.getPath('userData');
	return dir + '/' + filename;
};

const nconf = require('nconf').file({file: getConfigFilePath()});

nconf.defaults({
	'sensorPin1': 'A0',
	'sensorPin2': 'A1',
	'sensorPin3': 'A2',
	'ledPin1': 11,
	'ledPin2': 12,
	'ledPin3': 13,
	'piezoPin': 2,
	'usbPort': 'COM3',
	'sensorThreshold': 10,
	'timeThreshold': 40,
	'speedThreshold': 5,
	'startDelay': 3,
	'title': 'MINI4WD CHRONO',
	'raceMode': 0
});

const saveSettings = (settingKey, settingValue) => {
  nconf.set(settingKey, settingValue);
  nconf.save();
};

const readSettings = (settingKey) => {
  nconf.load();
  return nconf.get(settingKey);
};

const deleteSettings = (settingKey) => {
	nconf.clear(settingKey);
	nconf.save();
};

const saveRound = (manche, round, cars) => {
	nconf.set('race:' + manche + '-' + round, cars);
	nconf.save();
};

const loadRound = (manche, round) => {
	if (manche == null)
		manche = readSettings('currManche');
	if (round == null)
		round = readSettings('currRound');
	return readSettings('race:' + manche + '-' + round);
};

const deleteRound = (manche, round) => {
	nconf.clear('race:' + manche + '-' + round);
	nconf.save();
};

module.exports = {
    saveSettings: saveSettings,
		readSettings: readSettings,
		deleteSettings: deleteSettings,
		saveRound: saveRound,
		loadRound: loadRound,
		deleteRound: deleteRound
};
