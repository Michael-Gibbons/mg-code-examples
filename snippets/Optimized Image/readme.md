
# Optimized Image

This is a snippet which attempts to show the most appropriate sized image to the user.


## Properties

The following properties are able to be passed into the snippet as variables.

| Property      | Type | Description |
| ----------- | ----------- | ----------- |
| imageObject      | Shopify Image       | [Normal shopify image object](https://shopify.dev/api/liquid/objects/image) |
| imageSizes   | String        | Comma seperated list of intrinsic image sizes(no px). ie, integers. ex: "350, 450, 550" |
| media   | Boolean        | determines if `media` will be used to change image sources. It uses `sizes` by default |
| breakpoints   | String        | Comma seperated list of media queries. Can accept any number of queries but Mobile, Tablet, and Desktop is recommended |
| reserveSpace   | Boolean        | Determines if padding should be added to correct CLS. True by default. You may want to turn this off if you're already correcting CLS another way or if it is causing style issues.|


## Usage/Examples
```
{% render 'optimized-image', imageObject: product.featured_image, imageSizes: '350, 500, 650', media: true, breakpoints: '480px, 960px, 1440px' %}
```

From a metafield CDN:
```
    {% assign filename =  METAFIELD_CDN | split: 'files/' | last | split: '?' | first %}
    {% assign imageObject = images[filename] %}
    {% render 'optimized-image', imageObject: imageObject, imageSizes: '350, 500, 650', breakpoints: '480px, 960px, 1440px' %}
```

