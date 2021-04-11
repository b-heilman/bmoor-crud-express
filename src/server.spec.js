
const {expect} = require('chai');
const sinon = require('sinon');
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const sut = require('./server.js');

describe('src/server.js', function(){
	let app = null;
	let stubs = null;
	let server = null;
	let bootstrap = null;

	beforeEach(async function(){
		stubs = {
		};

		app = express();

		app.use(bodyParser.urlencoded({ extended: false }));
		app.use(bodyParser.json());

		const cfg = sut.config.extend({
			connectors: {
				'http': () => ({
					execute: stubs.execute
				})
			},
			directories: {
				model: '/models',
				decorator: '/decorators',
				hook: '/hooks',
				effect: '/effects',
				composite: '/composites',
				guard: '/guards',
				action: '/actions',
				utility: '/utilities',
				document: '/documents'
			}
		});

		const mockery = cfg.sub('stubs');

		mockery.set('model', [{
			name: 'service-1',
			path: 'model-path-1',
			settings: {
				connector: 'http',
				fields: {
					id: {
						create: false,
						read: true,
						update: false,
						delete: true,
						key: true
					},
					name: true
				},
				security: {
					filter: 'can-read'
				}
			}
		},{
			name: 'service-2',
			path: 'model-path-2',
			settings: {
				connector: 'http',
				fields: {
					id: {
						create: false,
						read: true,
						update: false,
						delete: true,
						key: true
					},
					name: true,
					link: {
						name: 'service-1',
						field: 'id'
					}
				}
			}
		}]);

		// composites
		mockery.set('composite', [{
			name: 'composite-1',
			settings: {
				base: 'service-1',
				key: 'id',
				connector: 'http',
				fields: {
					'id': '.id',
					'name': '.name',
					'other': '> $service-2.name'
				}
			}
		}]);

		// decorators
		mockery.set('decorator', [{
			name: 'service-1',
			path: 'decorator-path-1',
			settings: {
				hello: function(){
					expect(this.create)
					.to.not.equal(undefined);

					return 'world';
				}
			}
		}]);

		const trace = [];
		// hooks
		mockery.set('hook', [{
			name: 'service-1',
			path: 'hook-path-1',
			settings: {
				afterCreate: async function(){
					trace.push(1);
				}
			}
		}]);

		// actions
		stubs.action = sinon.stub();
		mockery.set('effect', [{
			name: 'service-1',
			path: 'action-path-1',
			settings: [{
				model: 'service-2',
				action: 'update',
				callback: stubs.action
			}]
		}]);

		mockery.set('guard', [{
			name: 'service-1',
			settings: {
				read: true,
				query: true,
				create: true,
				update: true,
				delete: true
			}
		}]);

		mockery.set('action', [{
			name: 'service-1',
			settings: {
				hello: {
					method: 'get'
				}
			}
		}]);

		mockery.set('utility', [{
			name: 'service-1',
			settings: {
				hello: {
					method: 'get'
				}
			}
		}]);

		mockery.set('synthetic', [{
			name: 'composite-1',
			settings: {
				read: 'can-read'
			}
		}]);

		bootstrap = await sut.configure(cfg);

		sut.build(bootstrap, app);

		console.log('bootstrap', JSON.stringify(bootstrap.toRoutes(), null, 2));

		return new Promise((resolve) => {
			server = app.listen(3000, resolve);
		});
	});

	afterEach(async function(){
		for(let key in stubs){
			if (stubs[key].restore){
				stubs[key].restore();
			}
		}

		return new Promise((resolve) => {
			server.close(resolve);
		});
	});

	describe('/crud/service-1', function(){
		describe('method:post', function(){
			describe('/bmoor/crud/service-1', function(){
				it('/bmoor/crud/service-1', async function(){
					const service = bootstrap.nexus.getService('service-1');

					stubs.create = sinon.stub(service, 'create')
					.resolves({hello: 'world'});

					const res = await (await fetch(
						'http://localhost:3000/bmoor/crud/service-1', {
							method: 'post',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({foo: 'bar'})
						}
					)).json();

					expect(res)
					.to.deep.equal({
						result: {
							hello: 'world'
						}
					});

					expect(stubs.create.getCall(0).args[0])
					.to.deep.equal({
						foo: 'bar'
					});
				});
			});
		});

		describe('method:get', function(){
			describe('/bmoor/crud/service-1/:id', function(){
				xit('/bmoor/crud/service-1', async function(){
					const service = bootstrap.nexus.getService('service-1');

					stubs.create = sinon.stub(service, 'create')
					.resolves({hello: 'world'});

					const res = await (await fetch(
						'http://localhost:3000/bmoor/crud/service-1', {
							method: 'post',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({foo: 'bar'})
						}
					)).json();

					expect(res)
					.to.deep.equal({
						result: {
							hello: 'world'
						}
					});

					expect(stubs.create.getCall(0).args[0])
					.to.deep.equal({
						foo: 'bar'
					});
				});
			});


			describe('/bmoor/crud/service-1', function(){
				xit('/bmoor/crud/service-1', async function(){
					const service = bootstrap.nexus.getService('service-1');

					stubs.create = sinon.stub(service, 'create')
					.resolves({hello: 'world'});

					const res = await (await fetch(
						'http://localhost:3000/bmoor/crud/service-1', {
							method: 'post',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({foo: 'bar'})
						}
					)).json();

					expect(res)
					.to.deep.equal({
						result: {
							hello: 'world'
						}
					});

					expect(stubs.create.getCall(0).args[0])
					.to.deep.equal({
						foo: 'bar'
					});
				});
			});

			describe('/bmoor/action/service-1/hello/:id', function(){
				xit('/bmoor/crud/service-1', async function(){
					const service = bootstrap.nexus.getService('service-1');

					stubs.create = sinon.stub(service, 'create')
					.resolves({hello: 'world'});

					const res = await (await fetch(
						'http://localhost:3000/bmoor/crud/service-1', {
							method: 'post',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({foo: 'bar'})
						}
					)).json();

					expect(res)
					.to.deep.equal({
						result: {
							hello: 'world'
						}
					});

					expect(stubs.create.getCall(0).args[0])
					.to.deep.equal({
						foo: 'bar'
					});
				});
			});


			describe('/bmoor/utility/service-1/hello', function(){
				xit('/bmoor/crud/service-1', async function(){
					const service = bootstrap.nexus.getService('service-1');

					stubs.create = sinon.stub(service, 'create')
					.resolves({hello: 'world'});

					const res = await (await fetch(
						'http://localhost:3000/bmoor/crud/service-1', {
							method: 'post',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({foo: 'bar'})
						}
					)).json();

					expect(res)
					.to.deep.equal({
						result: {
							hello: 'world'
						}
					});

					expect(stubs.create.getCall(0).args[0])
					.to.deep.equal({
						foo: 'bar'
					});
				});
			});

			describe('/bmoor/synthetic/composite-1/:id', function(){
				xit('/bmoor/crud/service-1', async function(){
					const service = bootstrap.nexus.getService('service-1');

					stubs.create = sinon.stub(service, 'create')
					.resolves({hello: 'world'});

					const res = await (await fetch(
						'http://localhost:3000/bmoor/crud/service-1', {
							method: 'post',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({foo: 'bar'})
						}
					)).json();

					expect(res)
					.to.deep.equal({
						result: {
							hello: 'world'
						}
					});

					expect(stubs.create.getCall(0).args[0])
					.to.deep.equal({
						foo: 'bar'
					});
				});
			});


			describe('/bmoor/synthetic/composite-1', function(){
				xit('/bmoor/crud/service-1', async function(){
					const service = bootstrap.nexus.getService('service-1');

					stubs.create = sinon.stub(service, 'create')
					.resolves({hello: 'world'});

					const res = await (await fetch(
						'http://localhost:3000/bmoor/crud/service-1', {
							method: 'post',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({foo: 'bar'})
						}
					)).json();

					expect(res)
					.to.deep.equal({
						result: {
							hello: 'world'
						}
					});

					expect(stubs.create.getCall(0).args[0])
					.to.deep.equal({
						foo: 'bar'
					});
				});
			});
		});

		describe('method:delete', function(){
			describe('/bmoor/crud/service-1/:id', function(){
				xit('/bmoor/crud/service-1', async function(){
					const service = bootstrap.nexus.getService('service-1');

					stubs.create = sinon.stub(service, 'create')
					.resolves({hello: 'world'});

					const res = await (await fetch(
						'http://localhost:3000/bmoor/crud/service-1', {
							method: 'post',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({foo: 'bar'})
						}
					)).json();

					expect(res)
					.to.deep.equal({
						result: {
							hello: 'world'
						}
					});

					expect(stubs.create.getCall(0).args[0])
					.to.deep.equal({
						foo: 'bar'
					});
				});
			});


			describe('/bmoor/crud/service-1', function(){
				xit('/bmoor/crud/service-1', async function(){
					const service = bootstrap.nexus.getService('service-1');

					stubs.create = sinon.stub(service, 'create')
					.resolves({hello: 'world'});

					const res = await (await fetch(
						'http://localhost:3000/bmoor/crud/service-1', {
							method: 'post',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({foo: 'bar'})
						}
					)).json();

					expect(res)
					.to.deep.equal({
						result: {
							hello: 'world'
						}
					});

					expect(stubs.create.getCall(0).args[0])
					.to.deep.equal({
						foo: 'bar'
					});
				});
			});
		});

		describe('method:put', function(){
			describe('/bmoor/crud/service-1/:id', function(){
				xit('/bmoor/crud/service-1', async function(){
					const service = bootstrap.nexus.getService('service-1');

					stubs.create = sinon.stub(service, 'create')
					.resolves({hello: 'world'});

					const res = await (await fetch(
						'http://localhost:3000/bmoor/crud/service-1', {
							method: 'post',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({foo: 'bar'})
						}
					)).json();

					expect(res)
					.to.deep.equal({
						result: {
							hello: 'world'
						}
					});

					expect(stubs.create.getCall(0).args[0])
					.to.deep.equal({
						foo: 'bar'
					});
				});
			});
		});

		describe('method:patch', function(){
			describe('/bmoor/crud/service-1', function(){
				xit('/bmoor/crud/service-1', async function(){
					const service = bootstrap.nexus.getService('service-1');

					stubs.create = sinon.stub(service, 'create')
					.resolves({hello: 'world'});

					const res = await (await fetch(
						'http://localhost:3000/bmoor/crud/service-1', {
							method: 'post',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({foo: 'bar'})
						}
					)).json();

					expect(res)
					.to.deep.equal({
						result: {
							hello: 'world'
						}
					});

					expect(stubs.create.getCall(0).args[0])
					.to.deep.equal({
						foo: 'bar'
					});
				});
			});
		});
	});

	/*
	{
	"path": "",
	"method": "get"
	},
	{
	"path": "",
	"method": "get"
	},
	{
	"path": "",
	"method": "get"
	},
	{
	"path": "",
	"method": "get"
	}
	*/
	/*
	it('should do something', async function(){
		const router = express.Router();

		router.get('/hello', function(req, res){
			res.json({
				hello: 'world'
			});
		});

		app.use(router);

		const res = await (await fetch('http://localhost:3000/hello')).json();
	});
	*/
});
