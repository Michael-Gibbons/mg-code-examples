'use strict';

var ApiContracts = require('authorizenet').APIContracts;
var ApiControllers = require('authorizenet').APIControllers;

function getAnAcceptPaymentPage(callback) {

	var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName(process.env.AUTHORIZE_LOGIN_ID);
	merchantAuthenticationType.setTransactionKey(process.env.AUTHORIZE_TRANSACTION_KEY);

	var transactionRequestType = new ApiContracts.TransactionRequestType();
	transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHONLYTRANSACTION);
	transactionRequestType.setAmount('3.00');
	const billTo = {
		"firstName": "Ellen",
		"lastName": "Johnson",
		"company": "Souveniropolis",
		"address": "14 Main Street",
		"city": "Pecan Springs",
		"state": "TX",
		"zip": "44628",
		"country": "USA"
	};
	transactionRequestType.setBillTo(billTo);
	
	var setting1 = new ApiContracts.SettingType();
	setting1.setSettingName('hostedPaymentButtonOptions');
	setting1.setSettingValue('{\"text\": \"Pay\"}');

	var setting2 = new ApiContracts.SettingType();
	setting2.setSettingName('hostedPaymentOrderOptions');
	setting2.setSettingValue('{\"show\": false}');

	var setting3 = new ApiContracts.SettingType();
	setting3.setSettingName('hostedPaymentIFrameCommunicatorUrl');
	setting3.setSettingValue('{\"url\": \"https://myellura.myshopify.com/admin/apps/myellura-custom-order-form\"}');

	var setting4 = new ApiContracts.SettingType();
	setting4.setSettingName('hostedPaymentIFrameCommunicatorUrl');
	setting4.setSettingValue('{\"url\": \"https://myellura.myshopify.com/admin/apps/myellura-custom-order-form\"}');
	

	var settingList = [];
	settingList.push(setting1);
	settingList.push(setting2);
	settingList.push(setting3);

	var alist = new ApiContracts.ArrayOfSetting();
	alist.setSetting(settingList);

	var getRequest = new ApiContracts.GetHostedPaymentPageRequest();
	getRequest.setMerchantAuthentication(merchantAuthenticationType);
	getRequest.setTransactionRequest(transactionRequestType);
	getRequest.setHostedPaymentSettings(alist);

	//console.log(JSON.stringify(getRequest.getJSON(), null, 2));
		
	var ctrl = new ApiControllers.GetHostedPaymentPageController(getRequest.getJSON());

	ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.GetHostedPaymentPageResponse(apiResponse);

		//pretty print response
		//console.log(JSON.stringify(response, null, 2));

		if(response != null) 
		{
			if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK)
			{
				console.log('Hosted payment page token :');
				console.log(response.getToken());
			}
			else
			{
				//console.log('Result Code: ' + response.getMessages().getResultCode());
				console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		}
		else
		{
			console.log('Null response received');
		}

		callback(response);
	});
}

if (require.main === module) {
	getAnAcceptPaymentPage(function(){
		console.log('getAnAcceptPaymentPage call complete.');
	});
}

module.exports.getAnAcceptPaymentPage = getAnAcceptPaymentPage;
