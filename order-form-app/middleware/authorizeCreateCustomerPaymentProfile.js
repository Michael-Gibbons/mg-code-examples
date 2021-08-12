'use strict';

var ApiContracts = require('authorizenet').APIContracts;
var ApiControllers = require('authorizenet').APIControllers;

function createCustomerPaymentProfile(callback, tokenized) {

	var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName(process.env.AUTHORIZE_LOGIN_ID);
	merchantAuthenticationType.setTransactionKey(process.env.AUTHORIZE_TRANSACTION_KEY);

	var opaqueData = new ApiContracts.OpaqueDataType();
	opaqueData.setDataDescriptor(tokenized.opaqueData.dataDescriptor);
	opaqueData.setDataValue(tokenized.opaqueData.dataValue);

	var payment = new ApiContracts.PaymentType();
	payment.setOpaqueData(opaqueData);

	var customerAddress = new ApiContracts.CustomerAddressType();
	customerAddress.setFirstName(tokenized.billingAddress.firstName);
	customerAddress.setLastName(tokenized.billingAddress.lastName);
	customerAddress.setCompany(tokenized.billingAddress.company);
	customerAddress.setAddress(tokenized.billingAddress.address1 + ' ' + tokenized.billingAddress.address2);
	customerAddress.setCity(tokenized.billingAddress.city);
	customerAddress.setState(tokenized.billingAddress.provinceCode);
	customerAddress.setZip(tokenized.billingAddress.zip);
	customerAddress.setCountry(tokenized.billingAddress.country);
	customerAddress.setPhoneNumber(tokenized.billingAddress.phone);

	var profile = new ApiContracts.CustomerPaymentProfileType();
	profile.setBillTo(customerAddress);
	profile.setPayment(payment);
	// profile.setDefaultPaymentProfile(true);

	var createRequest = new ApiContracts.CreateCustomerPaymentProfileRequest();

	createRequest.setMerchantAuthentication(merchantAuthenticationType);
	createRequest.setCustomerProfileId(tokenized.customerProfileId);
	createRequest.setPaymentProfile(profile);

	//pretty print request
	//console.log(JSON.stringify(createRequest.getJSON(), null, 2));

	var ctrl = new ApiControllers.CreateCustomerPaymentProfileController(createRequest.getJSON());

	ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.CreateCustomerPaymentProfileResponse(apiResponse);

		//pretty print response
		//console.log(JSON.stringify(response, null, 2));

		if(response != null)
		{
			if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK)
			{
				console.log('createCustomerPaymentProfile: Successfully created a customer payment profile with id: ' + response.getCustomerPaymentProfileId());
			}
			else
			{
				console.log('Result Code: ' + response.getMessages().getResultCode());
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
	createCustomerPaymentProfile('41003872',function(){
		console.log('createCustomerPaymentProfile call complete.');
	});
}

module.exports.createCustomerPaymentProfile = createCustomerPaymentProfile;