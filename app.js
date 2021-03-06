'use strict';

const Homey = require('homey');
const Client = require('./lib/Client.js');

class App extends Homey.App {
	
	onInit() {
		super.onInit();

		this.log('Home-Assistant is running...');

		let address = Homey.ManagerSettings.get("address");
		let token = Homey.ManagerSettings.get("token");

		this._client = new Client(address, token)
			.on("connection_update", (state) => {
				Homey.ManagerApi.realtime('connection_update', state);
			});

		this._onFlowActionCallService = this._onFlowActionCallService.bind(this);

		new Homey.FlowCardAction('callService')
			.register()
			.registerRunListener( this._onFlowActionCallService );

		Homey.ManagerSettings.on("set", this._reconnectClient.bind(this));
	}

	getClient() {
		return this._client;
	}

	_reconnectClient(arg) {
		console.log("settings updated.... reconnecting");

		let address = Homey.ManagerSettings.get("address");
		let token = Homey.ManagerSettings.get("token");

		this._client.connect(address, token, true);
	}

	_onFlowActionCallService(args) {
		this._client.callService(args.domain, args.service, args.data);
	}
}

module.exports = App;