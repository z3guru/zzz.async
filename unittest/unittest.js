var events = require('events');
var assert = require('assert');
var sleep = require('system-sleep');

var zcc = require('../index.js');

describe("TestExchanger", function() {

	async function f1(exchanger)
	{
		try
		{
			let promise = await exchanger.exchange('M1');
			console.log('promise=' + promise);
			//promise.then((value)=>{ check[0] = value; })
		}
		catch(e)
		{
			console.error(e);
		}
	}

	it("testCase1", function() {
		let exchanger = new zcc.Exchanger();
		let emitter = new events.EventEmitter();
		let check = [];

		emitter.on('m1', async ()=>{
			let promise = await exchanger.exchange('M1');
			console.log('M1 promise=' + promise);
			check[0] = promise;
			//promise.then((value)=>{ check[0] = value; })
		});

		emitter.on('m2', async ()=>{
			let promise = await exchanger.exchange('M2');
			console.log('M2 promise=' + promise);
			check[1] = promise;
		});

		emitter.emit('m1');
		sleep(1 * 1000);
		emitter.emit('m2');
		sleep(200); // wait all has been finished...

		assert.equal('M2', check[0]);
		assert.equal('M1', check[1]);

		sleep(100); // wait all has been finished...
	});

	it("testTimeout", function() {
		let exchanger = new zcc.Exchanger();
		let emitter = new events.EventEmitter();
		let check = [];

		emitter.on('m1', async ()=>{
			let promise = await exchanger.exchange('M1', 500).catch(()=> { console.log("on rejected !!!!!"); });
			console.log('[M1]' + promise);
			check[0] = promise;
			console.log('m1=' + check[0]);
		});

		emitter.on('m2', async ()=>{
			let promise = await exchanger.exchange('M2', 1000).catch(()=> { console.log("on rejected !!!!!"); });
			console.log('[M2]' + promise);
			check[1] = promise;
			console.log('m2=' + check[1]);
		});

		emitter.on('m3', async ()=>{
			let promise = await exchanger.exchange('M3', 1000).catch(()=> { console.log("on rejected !!!!!"); });
			console.log('[M3]' + promise);
			check[2] = promise;
			console.log('m3=' + check[2]);
		});

		emitter.emit('m1');
		sleep(800);
		emitter.emit('m2');
		sleep(500);
		emitter.emit('m3');
		sleep(100); // wait all has been finished...

		assert.equal(undefined, check[0]);
		assert.equal('M3', check[1]);
		assert.equal('M2', check[2]);
	});
});