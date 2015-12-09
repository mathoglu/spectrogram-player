let db = (x, type)=> {
	return 10*Math.log(x);
};

let sqrt = Math.sqrt,
	mag = (point)=> {
		return sqrt(point.r * point.r + point.i * point.i);
	};

let table = (type, length, windowSize)=> {

	let _sin = ( N )=> {
			let table = new Float32Array( N ),
				twoPi = Math.PI * 2;
			for (let i = 0; i < N; i++) {
				table[i] = Math.sin( twoPi * i / windowSize )
			}
			return table
		},
		_cos = ( N )=> {
			let table = new Float32Array( N ),
				twoPi = Math.PI * 2;
			for (let i = 0; i < N; i++) {
				table[i] = Math.cos( -twoPi * i / windowSize )
			}
			return table
		};

	if(type === 'sin') {
		return _sin(length);
	}
	else if (type === 'cos') {
		return _cos(length);
	}
	else {
		return [];
	}
};

let sinus = Math.sin,
	cosinus = Math.cos,
	twoPi = Math.PI * 2,
	trigonometric = {
		sin: (k, N)=>{ return sinus( -twoPi * (k / N) ) },
		cos: (k, N)=> { return cosinus( -twoPi * (k / N) ) }
	};

let splitEvenOdd = (array)=> {
	let even = [],
		odd = [];

	for(let i = 0; i < array.length; i++) {
		if((i+2) % 2 == 0) {
			even.push(array[i])
		}
		else {
			odd.push(array[i])
		}
	}
	return {even: even, odd: odd}
};

let complex = {
	add: (a, b)=> { return { r: a.r + b.r, i: a.i + b.i  } },
	subtract: (a, b)=> { return { r: a.r - b.r, i: a.i - b.i  } },
	multiply: (a, b)=> {
		return {
			r: (a.r * b.r - a.i * b.i),
			i: (a.r * b.i + a.i * b.r)
		}
	}
};

let formatters = {
	magnitude: (x)=> {
		return 2 * distance(real,img) / windowSize;
	}
};

export default {
	db,
	mag,
	table,
	splitEvenOdd,
	complex,
	formatters,
	trigonometric
}