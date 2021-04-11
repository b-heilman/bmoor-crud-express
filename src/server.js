
const express = require('express');
const {Bootstrap, config: bootConfig} = require('bmoor-crud/src/env/bootstrap.js');
const {Context} = require('bmoor-crud/src/server/context.js');

const config = bootConfig.extend({
	hooks: {
		buildContext: req => new Context(req),
		beforeLoad: async () => null,
		beforeConfigure: async () => null,
		beforeStart: async () => null,
		afterStart: async () => null
	}
});

function buildRouter(crudRouter){
	const router = express.Router();

	crudRouter.getRouters().forEach(subRouter => {
		router.use(subRouter.path, buildRouter(subRouter));
	});

	crudRouter.getRoutes().forEach(route => {
		router[route.method](route.path, async (req, res) => {
			try {
				const hooks = config.get('hooks');
				
				const ctx = hooks.buildContext(req);
				console.log('ctx.toJSON', ctx.toJSON());
				const rtn = await route.action(ctx);

				res.json(rtn);
			} catch(ex){
				console.log('-> server failure');
				console.log(ex);

				res.status(500);
				res.json({
					message: 'server having a bad day'
				});
			}
		});
	});

	return router;
}

async function configure(cfg){
	const hooks = config.get('hooks');

	await hooks.beforeLoad();

	const bootstrap = new Bootstrap(cfg);

	await hooks.beforeConfigure();

	await bootstrap.install();

	return bootstrap;
}

async function build(bootstrap, mount){
	const crudRouter = bootstrap.router;

	mount.use(crudRouter.path, buildRouter(crudRouter));
}

module.exports = {
	config,
	configure,
	build
};

