
const express = require('express');
const app = express();
const port = 9000;

const router = express.Router();

app.get('/', (req, res) => {
	res.json({
		foo: 'bar'
	});
});

router.get('/', (req, res) => {
	res.json({
		hello: 'world'
	});
});

app.use('/crud', router);

app.listen(port, () => {
	console.log(`App listening to: ${port}`);
});
