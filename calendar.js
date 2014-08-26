$.provide("$.ui.Calendar");

$.ui.Calendar = function(opt_date, opt_doc) {
	$.ui.Component.call(this, opt_doc);
	
	this.date_ = new $.date.Date(opt_date);
	this.date_.setFirstWeekCutOffDay(6);
	this.date_.setFirstDayOfWeek(0);
	
	this.activeMonth_ = this.date_.clone();
	this.activeMonth_.setDate(1);
};
$.inherits($.ui.Calendar, $.ui.Component);

$.ui.Calendar.prototype.updateCalendarGrid_ = function() {
	var date = this.activeMonth_.clone();
	date.setDate(1);
	
	var wday = date.getWeekday();
	var days = date.getNumberOfDaysInMonth();
	
	date.add(new $.date.Interval($.date.Interval.MONTHS, -1));
	date.setDate(date.getNumberOfDaysInMonth() - (wday - 1));
	
	if (this.showFixedNumWeeks_ && !this.extraWeekAtEnd_ && days + wday < 33) {
		date.add(new $.date.Interval($.date.Interval.DAYS, -7));
	}
	
	// Create weekday/day grid
	var dayInterval = new $.date.Interval($.date.Interval.DAYS, 1);
	this.grid_ = [];
	for (var y = 0; y < 6; y++) { // Weeks
		this.grid_[y] = [];
		for (var x = 0; x < 7; x++) { // Weekdays
			this.grid_[y][x] = date.clone();
			date.add(dayInterval);
		}
	}
	this.redrawCalendarGrid_();
};

$.ui.Calendar.prototype.redrawCalendarGrid_ = function() {
	
};

$.ui.Calendar.prototype.previousMonth = function() {
	this.activeMonth_.add(new $.date.Interval($.date.Interval.MONTHS, -1));
	this.updateCalendarGrid_();
};

$.ui.Calendar.prototype.nextMonth = function() {
	this.activeMonth_.add(new $.date.Interval($.date.Interval.MONTHS, 1));
	this.updateCalendarGrid_();
};

$.ui.Calendar.prototype.getActiveMonth = function() {
	return this.activeMonth_();
};




