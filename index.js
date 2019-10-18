const express = require("express");
const bodyParser = require("body-parser");


const app = express();
app.use(bodyParser.json());

// localize date to timezone
function localize(d, tz) {
	// this is ugly solution but works without having to use another library
	return new Date(
		d.toLocaleString("en-US", { 
			timeZone: tz } ));
}

// get name for day of week on given Date
function weekday(d) {
	const dayNames = [
		"Monday", "Tuesday", "Wednesday", "Thursday", 
		"Friday", "Saturday", "Sunday"
	];
	return dayNames[d.getDay()];
}

// normal operations
app.post("/invoke/realtime", (req, res) => {
	const tz = req.body.arguments.Timezone;
	res.json(weekday(localize(new Date(), tz)));
});

// used for backtesting
app.post("/invoke/timeline", (req, res) => {
	
	// localize start and end of period
	const tz = req.body.arguments.Timezone;
	const [ start, end ] = req.body.period.map(d => localize(new Date(d), tz));

	// this will be our timeline
	let ret = {};

	// day of week at start of period
	ret["start"] = weekday(start);

	let ts = start;

	// truncate to date, convert to epoch milliseconds
	ts = ts.setUTCHours(0, 0, 0, 0);

	// ms/day
	const oneDay = 1000 * 60 * 60 * 24;
	ts += oneDay;

	// enter weekdays for each day in period
	while (ts < end) {
		const d = new Date(ts);
		ret[d.toDateString()] = weekday(d);
		ts += oneDay;
	}

	res.json({
		timeline: ret,
		warn: [], // nothing bad happened
		resolutions: [] // nothings for user to click on
	});
});

app.listen(5051, () => 
    console.log("Extension Server Started successfully"))
