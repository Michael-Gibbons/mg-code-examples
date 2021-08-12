import {useCallback, useState, useEffect} from 'react';
import {Modal, TextField, Select, FormLayout} from '@shopify/polaris';
import CountryRegionData from '../node_modules/country-region-data/data.json';

export default function CustomerShippingEditModal({ active, modalToggle, updateAddress, lastSavedAddress }) {
  const countries = CountryRegionData.map(country => ({label: country.countryName, value: country.countryName}));
  const [userCountry, setUserCountry] = useState('');
  const [provinces, setProvinces] = useState('');
  const [province, setProvince] = useState('');
  let UsersCountry = '';
  let UsersRegions = '';
  let UsersRegion  = '';

  const [address, setAddress] = useState({ ...lastSavedAddress });

  useEffect(()=>{
    const { country: savedCountry = 'United States' } = lastSavedAddress;
    UsersCountry = CountryRegionData.find(country => country.countryName === savedCountry);
    UsersRegions = UsersCountry.regions.map(region => ({label: region.name, value: region.shortCode}));
    setUserCountry(UsersCountry.countryName);
    setProvinces(UsersRegions);

    const { provinceCode: savedProvinceCode = UsersCountry.regions[0].shortCode } = lastSavedAddress;
    UsersRegion = UsersCountry.regions.find(region => region.shortCode === savedProvinceCode).shortCode;
    setProvince(UsersRegion);

    setAddress({ ...lastSavedAddress, country: UsersCountry.countryName, provinceCode: UsersRegion });

  }, [lastSavedAddress.country, lastSavedAddress.provinceCode]);

  const handleCountryChange = useCallback((value) => {
    const selectedCountry = CountryRegionData.find(country => country.countryName === value);
    const currentRegions = selectedCountry.regions.map(region => ({label: region.name, value: region.shortCode}));
    setProvinces(currentRegions);
    setUserCountry(value);
    setAddress({...address, country: value, provinceCode: currentRegions[0].value});
  }, [address, CountryRegionData]);

  const handleProvinceChange = useCallback((province) => {
    setProvince(province);
    setAddress({...address, provinceCode: province});
  }, [address]);

  const handleAddressCancel = () => {
    const { country: savedCountry = 'United States' } = lastSavedAddress;
    UsersCountry = CountryRegionData.find(country => country.countryName === savedCountry);
    UsersRegions = UsersCountry.regions.map(region => ({label: region.name, value: region.shortCode}));

    const { provinceCode: savedProvinceCode = 'AL' } = lastSavedAddress;
    UsersRegion = UsersCountry.regions.find(region => region.shortCode === savedProvinceCode).shortCode;
    setUserCountry(UsersCountry.countryName);
    setProvinces(UsersRegions);
    setProvince(UsersRegion);
    setAddress({ ...lastSavedAddress });
    modalToggle();
  }

  return (
    <Modal
      open={active}
      onClose={handleAddressCancel}
      title="Edit shipping address"
      primaryAction={{
        content: 'Apply',
        onAction: () => {
          setAddress({...address,
            firstName: address.firstName.trim(),
            lastName: address.lastName.trim(),
            company: address.company.trim(),
            phone: address.phone.trim(),
            address1: address.address1.trim(),
            address2: address.address2.trim(),
            city: address.city.trim(),
            zip: address.zip.trim()
          });
          updateAddress(address);
        }
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: handleAddressCancel,
        },
      ]}
    >
    <Modal.Section>
      <FormLayout>
        <FormLayout.Group>
          <TextField label="First name" onChange={(value) => setAddress({...address, firstName: value})} value={ address.firstName }></TextField>
          <TextField label="Last name"  onChange={(value) => setAddress({...address, lastName: value})} value={ address.lastName }></TextField>
        </FormLayout.Group>
        <FormLayout.Group>
          <TextField label="Company (optional)"  onChange={(value) => setAddress({...address, company: value})} value={ address.company } ></TextField>
          <TextField label="Phone Number (optional)" onChange={(value) => setAddress({...address, phone: value})} value={ address.phone } ></TextField>
        </FormLayout.Group>
        <FormLayout.Group>
          <TextField label="Address" onChange={(value) => setAddress({...address, address1: value})} value={ address.address1 }></TextField>
          <TextField label="Apartment, suite, etc. (optional)" onChange={(value) => setAddress({...address, address2: value})} value={ address.address2 }></TextField>
        </FormLayout.Group>
        <FormLayout.Group>
          <TextField label="City" onChange={(value) => setAddress({...address, city: value})} value={ address.city }></TextField>
          <Select
            label="Country/Region"
            options={countries}
            onChange={handleCountryChange}
            value={userCountry}
          />
        </FormLayout.Group>
        <FormLayout.Group>
        <Select
            label="State/Province"
            options={provinces}
            onChange={handleProvinceChange}
            value={province}
          />
          <TextField label="ZIP/Postal code" onChange={(value) => setAddress({...address, 'zip': value})} value={ address.zip }></TextField>
        </FormLayout.Group>
      </FormLayout>
    </Modal.Section>
  </Modal>
  )
}