'use strict';

const j5 = require('johnny-five');
const LedManager = require('./led_manager');
const utils = require('../utils');

// LED manager for 4 green LEDs.
class LedManagerRicky extends LedManager {
	constructor(board, pinLeds, pinBuzzer) {
		super(board, pinBuzzer);
		this.pinLeds = pinLeds;
		this.ready = false;
	}

	static getInstance(board, pinLeds, pinBuzzer) {
		if (!!LedManagerRicky.instance) {
      return LedManagerRicky.instance;
    }

		LedManagerRicky.instance = new LedManagerRicky(board, pinLeds, pinBuzzer);
		return LedManagerRicky.instance;
	}

	connected() {
		super.connected();

		// board is connected, init hardware
		this.led1 = new j5.Led({
			board: this.board,
			pin: this.pinLeds[0]
		});
		this.led2 = new j5.Led({
			board: this.board,
			pin: this.pinLeds[1]
		});
		this.led3 = new j5.Led({
			board: this.board,
			pin: this.pinLeds[2]
		});
		this.led4 = new j5.Led({
			board: this.board,
			pin: this.pinLeds[3]
		});
		this.leds = [this.led1, this.led2, this.led3, this.led4];

		// blink all leds for 3 sec
		this.led1.blink(125); this.led2.blink(125); this.led3.blink(125); this.led4.blink(125);
		utils.delay(() => { this.led1.stop().off(); this.led2.stop().off(); this.led3.stop().off(); this.led4.stop().off(); this.ready = true; }, 3000);
	}

	disconnected() {
		super.disconnected();
		try {
			this.led1.stop().off();
			this.led2.stop().off();
			this.led3.stop().off();
			this.led4.stop().off();
		} catch (e) { }
	}

	roundStart(startTimerCallback) {
		this.led1.on(); this.led2.on(); this.led3.on(); this.led4.on(); this.beep(1500);
		utils
			.delay(() => { this.led1.off(); this.led2.off(); this.led3.off(); this.led4.off(); }, 1500)
			.delay(() => { this.led1.on(); this.beep(500); }, 1000)
			.delay(() => { this.led2.on(); this.beep(500); }, 1000)
			.delay(() => { this.led3.on(); this.beep(500); }, 1000)
			.delay(() => { this.led4.on(); this.led1.off(); this.led2.off(); this.led3.off(); startTimerCallback(); }, 4000)
			.delay(() => { this.led4.off(); }, 1000)
	}

	roundFinish(cars) {
		// turn on winner car led
		let finishCars = _.filter(cars, (c) => { return !c.outOfBounds && c.lapCount == 4 });
		utils.delay(() => {
			_.each(finishCars, (c) => {
				if (c.position == 1) {
					this.leds[c.startLane].on();
				}
			})
		}, 1500);
	}

	lap(lane) {
		// flash lane led for 1 sec
		if (this.ready) {
			let led = this.leds[lane];
			led.on();
			utils.delay(() => { led.off(); }, 1000);
		}
	}
}

module.exports = LedManagerRicky;
