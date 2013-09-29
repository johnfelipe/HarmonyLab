/* global define:false */
define(['lodash', 'jquery', 'microevent'], function(_, $, MicroEvent) {
	"use strict";

	var ITEMS = [{
		'label': 'Analyze', 
		'value': 'analyze'
	},{
		'label': 'Highlight', 
		'value': 'highlight',
		'items': [
			{'label': 'Roots', 'value': 'highlight.roots'},
			{'label': 'Tritones', 'value': 'highlight.tritones'},
			{'label': 'Awk. Doublings', 'value': 'highlight.doubles'},
			{'label': '8ves &amp; 5ths', 'value': 'highlight.octaves'}
		]
	}];

	var AnalyzeWidget = function() {
		this.el = $('<div></div>');
		this.items = ITEMS;
	};

	_.extend(AnalyzeWidget.prototype, {
		listTpl: _.template('<ul class="notation-checkboxes"><%= items %></ul>'),
		itemTpl: _.template('<li><label><input type="checkbox" class="js-notation-checkbox" name="<%= label %>" value="<%= value %>" <%= checked %> /><%= label %></label><%= itemlist %></li>'),
		initListeners: function() {
			var that = this;
			this.el.on('change', 'li', null, function(e) {
				var currentTarget = e.currentTarget;
				var target = e.target;
				var $children = $(currentTarget).children('ul');
				var val = $(target).val();
				var checked = $(target).is(':checked');
				var valDot, valCat, valOpt;

				if($children.length > 0) {
					$children.find('input').attr('disabled', (checked ? null : 'disabled'));
					that.trigger('changeCategory', val, checked);
				} else {
					valDot = val.indexOf('.');
					valCat = val.substr(0, valDot);
					valOpt = val.substr(valDot + 1);
					that.trigger('changeOption', valCat, valOpt, checked);
				}

				e.stopPropagation();
				e.preventDefault();

				return false;
			});
			return this;
		},
		render: function() {
			var content = this.listTpl({ items: this.renderItems(this.items) })
			this.el.remove();
			this.el.append(content);
			this.el.find('ul').each(function(index, el) {
				var $parents = $(el).parents('ul');
				if($parents.length > 0) {
					$(el).find('input').attr('disabled', 'disabled');
				}
			});
			this.initListeners();
			return this;
		},
		renderItems: function(items) {
			return _.map(items, function(item) {
				var itemlist = item.items ? this.listTpl({ items: this.renderItems(item.items) }) : ""; 
				return this.itemTpl({
					label: item.label,
					value: item.value,
					checked: item.checked || "",
					itemlist: itemlist
				});
			}, this).join('');
		}
	});

	MicroEvent.mixin(AnalyzeWidget);

	return AnalyzeWidget;
});
