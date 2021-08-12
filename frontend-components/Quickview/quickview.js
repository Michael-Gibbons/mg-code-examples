export default class QuickView {
  constructor(request, modals) {
    this.selectors = {
      swiper:{
        slider: '.ambaum-quickview-modal__product-slider',
        pagination: '.swiper-pagination',
        nextEl: '.ambaum-quickview-modal__product-slider--next',
        prevEl: '.ambaum-quickview-modal__product-slider--prev',
        slideImageWrapper: '.ambaum-swiper-slide-image-wrapper',
        slideImage: '.ambaum-swiper-slide-image'
      },
      modalLoader: '.ambaum-quickview-modal__loading',
      atcLoader: '.add-to-cart-loader',
      ctaSuccess: '.amb_quickview-item__cta-button--success',
      linePrice: '.ambaum-quickview-modal__product-line-price',
      productLink: '.ambaum-quickview-modal__product-link',
      title: '.ambaum-quickview-modal__title',
      description: '.ambaum-quickview-modal__description',
      qtyInput: '.ambaum-quickview-modal__product-qty-adjust-input input',
      variantInput: '.ambuam-quickview-modal__variant-select-input',
      qtyPlus:'.ambaum-quickview-modal__product-qty-adjust-plus',
      qtyMinus: '.ambaum-quickview-modal__product-qty-adjust-minus',
      atcSubmit: '.ambaum-quickview-modal__product-cart-submit'
    }

    this.settings = {
      trucateProductDesciption: 100,
    }

    this.request = request;
    this.modals = modals;
    this.currentProduct = {};
    this.currentVariant = {};
    this.swiper = new Swiper(this.selectors.swiper.slider, {
      loop: true,
      threshold:20,
      centeredSlides: true,
      pagination: {
        el: this.selectors.swiper.pagination,
        dynamicBullets: true,
      },
      navigation: {
        nextEl: this.selectors.swiper.nextEl,
        prevEl:  this.selectors.swiper.prevEl,
      },
    });
  }

  init(){
    this.swiper.init();
    $("body").on('click','[data-amb-quickview-modal]', async (e) => {
      if(!$(e.target).data('amb-quickview-modal')){return}// only fires if the trigger element was clicked, not children or parents.
      this.modalLoading(true);
      let productHandle = $(e.target).parent().data('product');
      let productJSON = await this.request.getProductData(productHandle);
      this.populateQuickViewModal(productJSON);
      this.modalLoading(false);
    });

    $("body").on('click', '[data-amb-quickview-atc]',(e) => {
      if(!$(e.target).data('amb-quickview-atc')){return}// only fires if the trigger element was clicked, not children or parents.
      let qtyInput = $(this.selectors.qtyInput);
      let qtyInputVal = parseInt(qtyInput.val());
      let atcButton = $(e.target);
      this.request.getProductData($(e.target).parent().data('product')).then(response => {
        this.currentProduct = response;
        this.currentVariant = this.currentProduct.variants[0];
        this.addItemToCart(this.currentVariant.id, qtyInputVal);
        atcButton.html('Added! &#10003;');
        atcButton.addClass(this.selectors.ctaSuccess.replace(/^./, ''));
      });
    });

    $(this.selectors.variantInput).on('change', (e) => {
      this.updateCurrentVariant($(e.target).val());
    });

    $(this.selectors.qtyPlus).on('click', (e) => {
      let qtyInput = $(this.selectors.qtyInput);
      let qtyInputVal = parseInt(qtyInput.val()) + 1;
      qtyInput.val(qtyInputVal);
      this.updateQuickViewModalPrice(qtyInputVal, this.currentVariant.price);
    });

    $(this.selectors.qtyMinus).on('click', (e) => {
      let qtyInput = $(this.selectors.qtyInput);
      let qtyInputVal = parseInt(qtyInput.val());
      if(qtyInputVal > 1){
        qtyInputVal = qtyInputVal - 1;
        qtyInput.val(qtyInputVal);
        this.updateQuickViewModalPrice(qtyInputVal, this.currentVariant.price);
      }
    });

    $(this.selectors.qtyInput).on('input', (e) => {
      if($(e.target).val() < 1 && $(e.target).val() !== ""){
        $(e.target).val(1);
      }
    });

    $(this.selectors.qtyInput).on('blur', (e) => {
      if($(e.target).val() < 1 || $(e.target).val() == ""){
        $(e.target).val(1);
      }
      this.updateQuickViewModalPrice($(e.target).val(), this.currentProduct.price);
    });

    $(this.selectors.atcSubmit).on('click', (e) => {
      let qtyInput = $(this.selectors.qtyInput);
      let qtyInputVal = parseInt(qtyInput.val());
      this.addItemToCart(this.currentVariant.id, qtyInputVal);
    });
  }

  formatMoney(cents, format) {
    var moneyFormat = '${{amount}}';
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = (format || moneyFormat);

    function defaultTo(value, defaultValue) {
      return value == null || value !== value ? defaultValue : value;
    }

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = defaultTo(precision, 2);
      thousands = defaultTo(thousands, ',');
      decimal = defaultTo(decimal, '.');

      if (isNaN(number) || number == null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);

      var parts = number.split('.');
      var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      var centsAmount = parts[1] ? (decimal + parts[1]) : '';

      return dollarsAmount + centsAmount;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
    }

    return formatString.replace(placeholderRegex, value);
  }

  async getProductData(handle) {
    return this.request.getProductData(handle);
  }

  async addItemToCart(id, qty){
    this.toggleLoading(true);
    this.request
      .addItemToCart(id, qty)
      .then(response => {
        this.modals.closeAllModals();
        this.toggleLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  toggleLoading(isLoading = true) {
    $(this.selectors.atcLoader).toggle(isLoading);
  }

  modalLoading(state = true){
    $(this.selectors.modalLoader).toggle(state)
  }

  updateCurrentVariant(id){
    this.currentVariant = this.currentProduct.variants.find(function(variant){return variant.id == id});
    $(this.selectors.linePrice).empty().html(this.formatMoney(this.currentVariant.price));
    $(this.selectors.productLink).attr("href", this.currentProduct.url + `?variant=${this.currentVariant.id}`);
    const featuredVariantImage = this.currentVariant.featured_image ?  this.currentVariant.featured_image.src : null;
    if(featuredVariantImage){
      const imageInSlider = $(`${this.selectors.swiper.slideImage}[src="${featuredVariantImage}"]`);
      const firstInstance = $(imageInSlider[0]);
      const firstInstanceSlideIndex = firstInstance.parent().parent().data('swiper-slide-index') + 1;
      this.swiper.slideTo(firstInstanceSlideIndex);
    }
  }

  stripHtml(html){
    var temporalDivElement = document.createElement("div");
    temporalDivElement.innerHTML = html;
    return temporalDivElement.textContent || temporalDivElement.innerText || "";
  }

  populateQuickViewModal(product){
    this.currentProduct = product;
    let productDescription = product.shortDescription || this.stripHtml(product.description).substring(0, this.settings.trucateProductDesciption) + '...';
    $(this.selectors.title).text(product.title);
    $(this.selectors.description).empty().html(productDescription);
    $(this.selectors.productLink).attr("href", product.url);
    $(this.selectors.linePrice).empty().html(this.formatMoney(product.price));
    $(this.selectors.qtyInput).val(1);
    this.swiper.removeAllSlides();

    $(product.images).each((i, el) => {
      this.swiper.appendSlide(`
        <div class="swiper-slide">
          <div class="${this.selectors.swiper.slideImageWrapper.replace(/^./, '')}">
            <img class="${this.selectors.swiper.slideImage.replace(/^./, '')}"src="${el}"/>
          </div>
        </div>
      `);
    });

    $(product.variants).each((i, el) => {
      if(product.variants.length == 1){return}
      let featuredVariantImage = el.featured_image ? el.featured_image.src: null;
      if(featuredVariantImage){
        this.swiper.appendSlide(`
          <div class="swiper-slide">
            <div class="${this.selectors.swiper.slideImageWrapper.replace(/^./, '')}">
              <img class="${this.selectors.swiper.slideImage.replace(/^./, '')}" src="${featuredVariantImage}"/>
            </div>
          </div>
        `);
      }
    });

    this.swiper.slideTo(1);
    let variantSelect = $(this.selectors.variantInput).empty().hide();
    if(product.variants.length > 1){
      product.variants.forEach(variant => {
        let text = variant.available ? variant.title : variant.title + '- Sold Out'
        $('<option />', {value: variant.id, text: text, disabled: !variant.available}).appendTo(variantSelect);
      });
      variantSelect.show();
    }
    this.updateCurrentVariant(this.currentProduct.variants[0].id);

  }

  updateQuickViewModalPrice(qty, price){
    const linePrice = price * qty;
    $(this.selectors.linePrice).empty().html(this.formatMoney(linePrice));
  }

}

