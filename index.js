const moment = require("moment-timezone");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());


// normal operations
app.post("/invoke/realtime", (req, res) => {
	const tz = req.body.arguments.Timezone;
	res.json({
		return: moment().tz(tz).format("dddd"),
	});
});

// used for backtesting
app.post("/invoke/timeline", (req, res) => {
	
	// localize start and end of period
	const tz = req.body.arguments.Timezone;
	const [ start, end ] = req.body.period.map(d => moment(d).tz(tz));

	// this will be our timeline
	let ret = {};

	// day of week at start of period
	ret["start"] = start.format("dddd");

	// go to start of next day
	let d = start.clone().startOf("day").add(1, "days");

	while (!d.isAfter(end)) {
		ret[d.format()] = d.format("dddd");
		d = d.add(1, "days");
	}

	res.json({
		timeline: ret,
		warn: [], // nothing bad happened
		resolutions: [] // nothings for user to click on
	});
});

app.listen(5051, () => 
    console.log("Extension Started successfully"))
