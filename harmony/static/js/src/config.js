// Configuration reader. 
//
// Configuration data should only be read using the
// interface provided by this module.

/* global define: false */
define([
	'lodash', 
	'app/config/general',
	'app/config/help_text',
	'app/config/highlight',
	'app/config/instruments',
	'app/config/keyboard_shortcuts',
	'app/config/analysis/hChords',
	'app/config/analysis/hIntervals',
	'app/config/analysis/iChords',
	'app/config/analysis/iDegrees',
	'app/config/analysis/ijIntervals',
	'app/config/analysis/jChords',
	'app/config/analysis/jDegrees'
], function(
	_, 
	ConfigGeneral, 
	ConfigHelpText,
	ConfigHighlight,
	ConfigInstruments,
	ConfigKeyboardShortcuts,
	ConfigAnalysis_hChords,
	ConfigAnalysis_hIntervals,
	ConfigAnalysis_iChords,
	ConfigAnalysis_iDegrees,
	ConfigAnalysis_ijIntervals,
	ConfigAnalysis_jChords,
	ConfigAnalysis_jDegrees
) {
	"use strict";

	var Config = {

		// private cache of config data
		__config: {
			'general': ConfigGeneral,
			'helpText': ConfigHelpText,
			'highlight': ConfigHighlight,
			'instruments': ConfigInstruments,
			'keyboardShortcuts': ConfigKeyboardShortcuts,
			'analysis': {
				'hChords': ConfigAnalysis_hChords,		
				'hIntervals': ConfigAnalysis_hIntervals,		
				'iChords': ConfigAnalysis_iChords,
				'iDegrees': ConfigAnalysis_iDegrees,
				'ijIntervals': ConfigAnalysis_ijIntervals,
				'jChords': ConfigAnalysis_jChords,
				'jDegrees': ConfigAnalysis_jDegrees
			}
		},

		// public method that returns the value of a key.
		//
		// For convenience, nested values may be retrieved 
		// using dot notation: get("x.y.z") => value of z.
		//
		get: function(key) {
			if(typeof key !== 'string') {
				throw new Error("Config key must be a string: " + key);
			}

			var config = this.__config;

			_.each(key.split('.'), function(value) {
				if(config.hasOwnProperty(value)) {
					config = config[value];
				} else {
					throw new Error("Key not found: " + key);
				}
			});

			return config;
		},
		set: function(key, value) {
			throw new Error("config is read-only");
		}
	};

	return Config;
});
