
const express = require('express');
const fetch = require('node-fetch');

describe('src/server.js', function(){
	let app = null;
	let server = null;

	beforeEach(async function(){
		app = express();

		return new Promise((resolve) => {
			server = app.listen(3000, resolve);
		});
	});

	afterEach(async function(){
		return new Promise((resolve) => {
			server.close(resolve);
		});
	});

	it('should do something', async function(){
		const router = express.Router();

		router.get('/hello', function(req, res){
			res.json({
				hello: 'world'
			});
		});

		app.use(router);

		const res = await (await fetch('http://localhost:3000/hello')).json();

		console.log('->', res);
	});
});
