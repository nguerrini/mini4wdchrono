'use strict';

const { app } = require('electron').remote;
const fs = require('fs');
const path = require('path');
const storage = require('electron-settings');
const configuration = require('./configuration');
const jsonfile = require('jsonfile');

const newRace = (raceName) => {
	let userdir = app.getPath('userData');
	let storagedir = path.join(userdir, 'races');
	if (!fs.existsSync(storagedir)) {
		fs.mkdirSync(storagedir);
	}

	let timestamp = parseInt(new Date().getTime() / 1000);
	let filename = `${timestamp}.json`;
	let filepath = path.join(userdir, 'races', filename);
	configuration.set('raceFile', filepath);
	fs.closeSync(fs.openSync(filepath, 'w')); // create empty file
	storage.setPath(filepath);

	// defaults
	storage.set('name', raceName);
	storage.set('created', timestamp);
	storage.set('currManche', 0);
	storage.set('currRound', 0);
	storage.set('raceMode', 0);
	storage.set('timeThreshold', 40);
	storage.set('speedThreshold', 5);
	storage.set('startDelay', 3);
};

var filepath = configuration.get('raceFile');
if (filepath) {
	storage.setPath(filepath);
}
else {
	newRace();
}

const getRecent = (num) => {
	num = num || 10
	let userdir = app.getPath('userData');
	let storagedir = path.join(userdir, 'races');
	let files = fs.readdirSync(storagedir);
	files = files.slice(0, num);
	let recent = [];
	files.forEach((filename) => {
		let data = jsonfile.readFileSync(path.join(storagedir, filename));
		recent.push({
			filename: filename,
			name: data.name,
			created: data.created
		})
	});
	return recent;
};

const set = (key, value) => {
	storage.set(key, value);
};

const get = (key) => {
	return storage.get(key);
};

const saveRound = (manche, round, cars) => {
	storage.set(`race.m${manche}.r${round}`, cars);
};

const loadRound = (manche, round) => {
	manche = manche || storage.get('currManche');
	round = round || storage.get('currRound');
	return storage.get(`race.m${manche}.r${round}`);
};

const deleteRound = (manche, round) => {
	storage.delete(`race.m${manche}.r${round}`);
};

const getManches = () => {
	let tournament = get('tournament');
	let mancheList = tournament.manches;
	if (tournament.finals) {
		mancheList.push(...tournament.finals);
	}
	return mancheList;
};

module.exports = {
	newRace: newRace,
	getRecent: getRecent,
	set: set,
	get: get,
	saveRound: saveRound,
	loadRound: loadRound,
	deleteRound: deleteRound,
	getManches: getManches
};
