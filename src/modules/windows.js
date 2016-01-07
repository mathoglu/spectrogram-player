let hann = (size)=> {
		let table = new Float32Array(size),
			cos = Math.cos,
			twoPi = Math.PI*2;

		for(let i = 0; i < size; i++) {
			table[i] = 0.5*(1-cos((twoPi*i)/size-1));
		}

		return (i)=> { return table[i] };
	};

let blackman = (size)=> {
		let table = new Float32Array(size),
			cos = Math.cos,
			twoPi = Math.PI*2;

		for(let i = 0; i < size; i++) {

		}
		return (i)=> { return table[i] };
	};

export default {
	hann,
	blackman
}