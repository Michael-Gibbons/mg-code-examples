var ApiContracts = require('authorizenet').APIContracts;
var ApiControllers = require('authorizenet').APIControllers

function createCustomerProfile(callback, tokenized) {

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
	customerAddress.setAddress(tokenized.billingAddress.address1);
	customerAddress.setCity(tokenized.billingAddress.city);
	customerAddress.setState(tokenized.billingAddress.provinceCode);
	customerAddress.setZip(tokenized.billingAddress.zip);
	customerAddress.setCountry(tokenized.billingAddress.country);
	customerAddress.setPhoneNumber(tokenized.billingAddress.phone);

	var customerPaymentProfileType = new ApiContracts.CustomerPaymentProfileType();
	customerPaymentProfileType.setCustomerType(ApiContracts.CustomerTypeEnum.INDIVIDUAL);
	customerPaymentProfileType.setPayment(payment);
	customerPaymentProfileType.setBillTo(customerAddress);

	var paymentProfilesList = [];
	paymentProfilesList.push(customerPaymentProfileType);

	var customerProfileType = new ApiContracts.CustomerProfileType();
	customerProfileType.setMerchantCustomerId(tokenized.AuthorizeIDHash);
	customerProfileType.setDescription('');
	customerProfileType.setEmail(tokenized.customerEmail);
	customerProfileType.setPaymentProfiles(paymentProfilesList);


	var createRequest = new ApiContracts.CreateCustomerProfileRequest();
	createRequest.setProfile(customerProfileType);
	createRequest.setMerchantAuthentication(merchantAuthenticationType);

	var ctrl = new ApiControllers.CreateCustomerProfileController(createRequest.getJSON());

	ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.CreateCustomerProfileResponse(apiResponse);

		if(response != null)
		{
			if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK)
			{
				console.log('Successfully created a customer profile with id: ' + response.getCustomerProfileId());
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
	createCustomerProfile(function(){
		console.log('createCustomerProfile call complete.');
	});
}
module.exports.createCustomerProfile = createCustomerProfile;