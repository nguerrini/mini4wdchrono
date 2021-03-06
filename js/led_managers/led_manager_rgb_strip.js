'use strict';

const pixel = require('node-pixel');
const LedManager = require('./led_manager');
const utils = require('../utils');

const COLOR_GREEN = '#66cc33';
const COLOR_BLUE = '#188bc8';
const COLOR_RED = '#ff0100';

const COLOR_POS1 = COLOR_GREEN;
const COLOR_POS2 = COLOR_BLUE;
const COLOR_POS3 = COLOR_RED;

const COLOR_TAMIYA_RED = '#e62227';
const COLOR_TAMIYA_WHITE = '#f8f8f8';
const COLOR_TAMIYA_BLUE = COLOR_BLUE;

// Manager for a 9 LEDs WS2812b strip and a buzzer.
class LedManagerRgbStrip extends LedManager {
	constructor(board, pin, pinBuzzer) {
		super(board, pinBuzzer);
		this.pin = pin;
		this.ready = false;
	}

	static getInstance(board, pin, pinBuzzer) {
		if (!!LedManagerRgbStrip.instance) {
      return LedManagerRgbStrip.instance;
    }

		LedManagerRgbStrip.instance = new LedManagerRgbStrip(board, pin, pinBuzzer);
		return LedManagerRgbStrip.instance;
	}

	connected() {
		super.connected();

		// board is connected, init hardware
		this.strip = new pixel.Strip({
			board: this.board,
			controller: "FIRMATA",
			strips: [{ pin: this.pin, length: 9 }],
			gamma: 2.8
		});

		// light animation
		var manager = this;
		this.strip.on("ready", function () {
			manager.tamiyaSlide();
		});
	}

	disconnected() {
		super.disconnected();
		try {
			this.strip.off();
		} catch (e) { }
	}

	roundStart(startTimerCallback) {
		var stripp = this.strip;
		this.beep(1500);
		this.kitt(COLOR_BLUE);
		utils
			.delay(() => { stripp.off(); }, 1500)
			.delay(() => { stripp.pixel(0).color(COLOR_RED); stripp.show(); this.beep(200); }, 1000)
			.delay(() => { stripp.pixel(1).color(COLOR_RED); stripp.show(); }, 400)
			.delay(() => { stripp.pixel(2).color(COLOR_RED); stripp.show(); }, 400)
			.delay(() => { stripp.pixel(3).color(COLOR_RED); stripp.show(); this.beep(200); }, 400)
			.delay(() => { stripp.pixel(4).color(COLOR_RED); stripp.show(); }, 400)
			.delay(() => { stripp.pixel(5).color(COLOR_RED); stripp.show(); }, 400)
			.delay(() => { stripp.pixel(6).color(COLOR_RED); stripp.show(); this.beep(200); }, 400)
			.delay(() => { stripp.pixel(7).color(COLOR_RED); stripp.show(); }, 400)
			.delay(() => { stripp.pixel(8).color(COLOR_RED); stripp.show(); }, 400)
			.delay(() => { stripp.color(COLOR_GREEN); stripp.show(); this.beep(1000); startTimerCallback(); }, 1500)
			.delay(() => { stripp.off(); }, 2500)
	}

	roundFinish(cars) {
		// color lanes based on positions
		let finishCars = _.filter(cars, (c) => { return !c.outOfBounds && c.lapCount == 4 });
		utils.delay(() => {
			_.each(finishCars, (c) => {
				if (c.position == 1) {
					this.colorLane(c.startLane, COLOR_POS1);
				}
				else if (c.position == 2) {
					this.colorLane(c.startLane, COLOR_POS2);
				}
				else if (c.position == 3) {
					this.colorLane(c.startLane, COLOR_POS3);
				}
			})
		}, 1500);
	}

	lap(lane) {
		// flash lane led for 1 sec
		if (this.ready) {
			this.colorLane(lane, COLOR_GREEN);
			utils.delay(() => {
				this.clearLane(lane);
			}, 1000);
		}
	}

	colorLane(lane, color) {
		let start = lane * 3;
		for (let i = start; i <= start + 2; i++) {
			this.strip.pixel(i).color(color);
		}
		this.strip.show();
	}

	clearLane(lane) {
		let start = lane * 3;
		for (let i = start; i <= start + 2; ++i) {
			this.strip.pixel(i).off();
		}
		this.strip.show();
	}

	kitt(color) {
		var manager = this;
		let direction = 0, curr = 0, prev = -1, millis = 50;
		let shift = setInterval(function () {
			manager.strip.pixel(curr).color(color);
			if (prev >= 0) {
				manager.strip.pixel(prev).off();
			}
			manager.strip.show();

			if (direction == 0) {
				curr++; prev++;
				if (curr > 8) {
					direction = 1;
					curr = 7;
				}
			}
			else {
				curr--; prev--;
				if (curr < 0) {
					direction = 0;
					curr = 1;
				}
			}
		}, millis);
		utils
			.delay(() => { clearInterval(shift); }, 1500)
			.delay(() => { manager.strip.off(); }, millis);
	}

	tamiyaSlide() {
		var manager = this;
		let millis = 100;
		manager.strip.pixel(0).color(COLOR_TAMIYA_BLUE);
		manager.strip.pixel(1).color(COLOR_TAMIYA_BLUE);
		manager.strip.pixel(2).color(COLOR_TAMIYA_BLUE);
		manager.strip.pixel(3).color(COLOR_TAMIYA_RED);
		manager.strip.pixel(4).color(COLOR_TAMIYA_RED);
		manager.strip.pixel(5).color(COLOR_TAMIYA_RED);
		manager.strip.pixel(6).color(COLOR_TAMIYA_WHITE);
		manager.strip.pixel(7).color(COLOR_TAMIYA_WHITE);
		manager.strip.pixel(8).color(COLOR_TAMIYA_WHITE);
		manager.strip.show();

		let shift = setInterval(function () {
			manager.strip.shift(1, pixel.FORWARD, true);
			manager.strip.show();
		}, millis);
		utils
			.delay(() => { clearInterval(shift); }, 3000)
			.delay(() => { manager.strip.off(); manager.ready = true; }, millis);
	}
}

module.exports = LedManagerRgbStrip;
