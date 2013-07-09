define([
	'lodash', 
	'microevent', 
	'jazzmidibridge', 
	'app/eventbus', 
	'app/midi/instruments'
], function(_, MicroEvent, JMB, eventBus, midiInstruments) {

	/**
	 * The MIDI Router is responsible for translating and routing MIDI 
	 * messages from both external keyboard devices and onscreen devices.
	 *
	 * It directly interfaces with external devices using the Jazz Midi Bridge
	 * (JMB) and depends on the event bus to interface with other system 
	 * components. 
	 */
	var MIDIRouter = function() {};

	_.extend(MIDIRouter.prototype, {
		eventBus: eventBus,

		channel: 0,
		program: 0,
		outputDevices: [],
		inputDevices: [],
		output: null,
		input: null,
		midiAccess: null, // api via jazzmidibridge
		defaults: { 
			outputIndex: 0, 
			inputIndex: 0,
			instrumentNum: 0
		},

		/**
		 * Initializes the MIDI router to send and receive MIDI messages.
		 *
		 * @return {this}
		 */
		init: function() {
			_.bindAll(this, [
				'onJMBInit',
				'onNoteInput',
				'onNoteOutput',
				'onPedalChange',
				'onChangeInstrument'
			]);
			JMB.init(this.onJMBInit);
		},

		/**
		 * Initializes the Jazz Midi Bridge (JMB) and related event handlers.
		 *
		 * @param {object} MIDIAccess object
		 */
		onJMBInit: function(MIDIAccess) {
			this.midiAccess = MIDIAccess;
			this.detectDevices();
			this.selectDefaultDevices();
			this.initListeners();
		},

		/**
		 * Detects midi devices.
		 */
		detectDevices: function() {
			this.outputDevices = this.midiAccess.enumerateOutputs() || [];
			this.inputDevices = this.midiAccess.enumerateInputs() || [];
			this.trigger('devices', this.inputDevices, this.outputDevices, this.defaults);
		},

		/**
		 * Selects a default midi input and output device (if any). 
		 */
		selectDefaultDevices: function() {
			var outputs = this.outputDevices;
			var inputs = this.inputDevices;
			if(outputs && outputs.length > 0) {
				this.output = outputs[this.defaults.outputIndex];
			}
			if(inputs && inputs.length > 0) {
				this.input = inputs[this.defaults.inputIndex];
			}
		},

		/**
		 * Initializes listeners.
		 */
		initListeners: function() {

			this.eventBus.bind('note:output', this.onNoteOutput);
			this.eventBus.bind('pedal', this.onPedalChange);
			this.eventBus.bind('instrument', this.onChangeInstrument);

			if(this.input) {
				this.input.addEventListener('midimessage', this.onNoteInput);
			}
		},

		/**
		 * Initializes listeners.
		 */
		onNoteInput: function(msg) {
			var output = this.output;
			var channel = this.channel;
			var m = this.midiAccess.createMIDIMessage(msg.command,msg.data1,msg.data2,channel);
			if(output) {
				output.sendMIDIMessage(m);
			}

			if(msg.command === JMB.NOTE_ON || msg.command === JMB.NOTE_OFF) {
				var noteState = (msg.command === JMB.NOTE_ON ? 'on' : 'off');
				var noteNumber = msg.data1;
				var noteVelocity = msg.data2;
				this.eventBus.trigger('note:render', noteState, noteNumber, noteVelocity);
				this.eventBus.trigger('note:input', noteState, noteNumber, noteVelocity);
			}
		},

		/**
		 * Handles sustain, sostenuto, soft pedal events.
		 */
		onPedalChange: function(pedal, state) {
			var controlNumberOf = { 'sustain': 64, 'sostenuto': 66, 'soft': 67 },
				controlValueOf = { 'on': 127, 'off': 0 },
				command = JMB.CONTROL_CHANGE,
				controlNumber = controlNumberOf[pedal], 
				controlValue = controlValueOf[state],
				msg = this.midiAccess.createMIDIMessage(command,controlNumber,controlValue,this.channel);

				if(this.output) {
					this.output.sendMIDIMessage(msg);
				}
		},

		/**
		 * Handles change of instrument.
		 */
		onChangeInstrument: function(instrumentName) {
			var command = JMB.PROGRAM_CHANGE;
			var instrumentNum = midiInstruments.numberOf(instrumentName);
			if(instrumentNum < 0) {
				instrumentNum = this.defaults.instrumentNum;
			}
			var msg = this.midiAccess.createMIDIMessage(command,instrumentNum,0,this.channel);

			if(this.output) {
				this.output.sendMIDIMessage(msg);
			}
		},

		/**
		 * Handles note on/off events by creating and transmitting the
		 * appropriate MIDI message.
		 *
		 * @param {string} noteState on|off
		 * @param {integer} noteNumber the midi note number
		 * @param {integer} noteVelocity defaults to 100
		 */
		onNoteOutput: function(noteState, noteNumber, noteVelocity) {
			var midiMessage, midiCommand;
			midiCommand = (noteState === 'on' ? JMB.NOTE_ON : JMB.NOTE_OFF);
			noteVelocity = noteVelocity || 100;
			midiMessage = this.midiAccess.createMIDIMessage(midiCommand, noteNumber, noteVelocity);

			this.output.sendMIDIMessage(midiMessage);
			this.eventBus.trigger('note:render', noteState, noteNumber, noteVelocity);
		}
	});

	MicroEvent.mixin(MIDIRouter);

	return MIDIRouter;
});
