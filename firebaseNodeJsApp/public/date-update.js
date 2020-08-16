// Copyright (c) 2020 Matteo Benzi <matteo.benzi97@gmail.com>
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following
// conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.
//
// ============================================================
// 
// date-update 0.1.0 — an update for js' Date class
//
// https://github.com/Bnz-0/date-update
//


const time_unit = ['y','M','d','h','m','s','ms'];
const time_resetter = [
	(date) => date.setUTCFullYear(1970),
	(date) => date.setUTCMonth(0),
	(date) => date.setUTCDate(1),
	(date) => date.setUTCHours(0),
	(date) => date.setUTCMinutes(0),
	(date) => date.setUTCSeconds(0),
	(date) => date.setUTCMilliseconds(0),
];
const time_modifiers = {
	'y': (date, x) => date.setUTCFullYear(date.getUTCFullYear() + x),
	'M': (date, x) => date.setUTCMonth(date.getUTCMonth() + x),
	'd': (date, x) => date.setUTCDate(date.getUTCDate() + x),
	'h': (date, x) => date.setUTCHours(date.getUTCHours() + x),
	'm': (date, x) => date.setUTCMinutes(date.getUTCMinutes() + x),
	's': (date, x) => date.setUTCSeconds(date.getUTCSeconds() + x),
	'ms': (date, x) => date.setUTCMilliseconds(date.getUTCMilliseconds() + x),
};


/**
 * returns a new date resetting the date/time not in `[a; b]`
 * @param {string} a one of `y`, `M`, `d`, `h`, `m`, `s`, `ms`
 * @param {string} b one of `y`, `M`, `d`, `h`, `m`, `s`, `ms`
 * 
 * @example
 * var time = new Date().trim('h', 'ms') //keep only the time form hours to milliseconds
 */
Date.prototype.trim = function(a, b='ms') {
	const date = new Date(this.getTime());
	const f = time_unit.indexOf(a);
	const t = time_unit.indexOf(b);
	for(let i in time_resetter) {
		if(f > i || i > t)
			time_resetter[i](date);
	}
	return date;
}


/**
 * add an amount of time to the date and return it in a new Date
 * @param {string} time2add a string representing an expression of the amount of time to add.  
 * the expression must be a sequence of **integer** and **time unit of measure**
 * (which could be one of these: `y`, `M`, `d`, `h`, `m`, `s`, `ms`)
 * 
 * @example
 * var date = new Date().add("+3d -1h") //adds 3 days and subtract 1 hour
 */
Date.prototype.add = function(time2add) {
	const date = new Date(this.getTime());
	const tm_regex = /([+-]{0,1}[0-9]+)\s*(ms|[yMdhms])/g;
	let t;
	while((t = tm_regex.exec(time2add)) !== null) {
		time_modifiers[t[2]](date, parseInt(t[1]));
	}
	return date;
}
