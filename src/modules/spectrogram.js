import {mag} from './utils.js';

let _validateOpts = (opts) => {
	return true;
};
let _graph,
	_canvas,
	_svg,
	x,
	y,
	z,
	xAxis,
	yAxis,
	nr = 0,
	margin = {
		top: 50,
		right: 30,
		bottom: 50,
		left: 100
	},
	dot = {
		h: 0.0,
		w: 0.0
	},
	_addColumn = ()=>{};

let _initGraph = (opts)=> {

	dot.h = opts.height / (opts.N / opts.zoomFactor);
	dot.w = 1;

	let width;
	console.log(opts.screenWidth, opts.lengthInFrames);
	if(opts.screenWidth > opts.lengthInFrames) {
		width = opts.screenWidth - margin.left - margin.right;
		dot.w = opts.screenWidth / opts.lengthInFrames;
	}
	else {
		width = opts.lengthInFrames*dot.w - margin.left - margin.right;
	}

	x = d3.scale.linear()
		.domain([0, opts.lengthInFrames * opts.secondsPerFrame])
		.range([0, width]);

	y = d3.scale.linear()
		.domain([0, opts.fs/ (2*opts.zoomFactor)])
		.range([opts.height,0]);

	z = d3.scale.linear()
		.domain([opts.limits.min, (opts.limits.min + (opts.limits.max-opts.limits.min)/2) , opts.limits.max])
		.range(["white", "yellow", "red"])
		.interpolate(d3.interpolateLab);

	_graph = d3.select(opts.selector);
	_svg = _graph.append('svg')
		.attr('height', opts.height + margin.top + margin.bottom)
		.attr('width', width + margin.left + margin.right)
		.append('g')
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	_canvas = d3.select(opts.selector).append('canvas')
		.attr('class','spectrogram')
		.attr('height', opts.height + margin.top)
		.attr('width', width)
		.style("padding", d3.map(margin).values().join("px ") + "px");

	let commasFormatter = d3.format(",.1f");
	 xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
		.tickSize(-opts.height - 15)
		.tickPadding(10)
		.tickFormat(function(d) {return commasFormatter(d) + "s";});

	yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(10)
		.tickSize(-width - 10, 0, 0)
		.tickPadding(10)
		.tickFormat(function(d) {return d3.round(d, 0) + 'Hz';});

	_svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (opts.height + 10)  + ")")
		.call(xAxis);

	_svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + (-10) + ",0)")
		.call(yAxis);

	let coll = 0;
	_addColumn = (data) => {
		let ctx = _canvas[0][0].getContext('2d'),
			_x = x,
			_y = y,
			_z = z,
			_dot = dot,
			fPs = opts.secondsPerFrame,
			btf = opts.getBinFrequency,
			magnitude = mag;

		_svg.select(".x.axis").call(xAxis);
		_svg.select(".y.axis").call(yAxis);

		for(let i = 0; i < data.length /opts.zoomFactor; i++) {
			let px = _x( coll * fPs );
			let py = _y( btf(i) );
			ctx.fillStyle = _z(magnitude(data[i]));
			ctx.fillRect(px, py, _dot.w, _dot.h);
		}
		coll++;
	};
};

let spectrogram = (opts)=> {
	if(!_validateOpts(opts)) {
		return null
	}

	_initGraph(opts);

	let draw = (data)=> {
		if(nr < opts.lengthInFrames) _addColumn(data);
		nr++;
	};

	return {draw}
};

export default {spectrogram}