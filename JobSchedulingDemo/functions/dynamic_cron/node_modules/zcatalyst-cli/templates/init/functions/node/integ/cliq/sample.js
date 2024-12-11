'use strict';
import Cliq from 'zcatalyst-integ-cliq';
import catalyst from 'zcatalyst-sdk-node';

export default async (request, response) => {
	try {
		const app = catalyst.initialize(request);
		const handlerResponse = await Cliq.execute(request, app);
		response.end(handlerResponse);
	} catch (err) {
		console.log('Error while executing handler. ', err);
		throw err;
	}
};
