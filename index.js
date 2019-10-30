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
app.post("/invoke/historic", (req, res) => {
	
	// localize start and end of period
	const tz = req.body.arguments.Timezone;
	const [ start, end ] = req.body.period.map(d => moment(d).tz(tz));

	// this will be our timeline
	let ret = {
		// day of week at start of period
		[ start.format() ] : start.format("dddd")
	};

	// go to start of next day
	let d = start.startOf("day").add(1, "days");

	// add entry for each day in period
	while (!d.isAfter(end)) {
		ret[d.format()] = { value: d.format("dddd") };
		d = d.add(1, "days");
	}
	
	// send response to extension server
	res.json({
		timeline: ret,
		warn: [], // nothing bad happened
		resolutions: [] // no machine-led decisions made
	});
});

app.listen(5051, () => 
    console.log("Extension Server Started successfully"))
