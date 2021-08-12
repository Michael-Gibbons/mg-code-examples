export default class CartDrawer {
  constructor() {
    this.selectors = {
      cartData: document.querySelector('[data-cart-json]'),
      cartDrawerWrapper: document.querySelector('[data-cart-wrapper]'),
      cartTotalQuantity: document.querySelector('[data-cart-count]'),
      cartDrawerContent: document.querySelector('[data-cart-content]'),
      cartClose: document.querySelector('[data-cart-close]'),
      cartNoteWrapper: document.querySelector('[data-cart-note]'),
      cartNoteContent: document.querySelector('[data-cart-note-content]'),
      cartSubtotal: document.querySelectorAll('[data-cart-subtotal]'),
      checkoutBtn: document.querySelector('[data-cart-checkout]'),
      cartInformation: document.querySelector('.cart-drawer__information-container'),
      lineItems:{//these selectors must be delegated therefore they must not be in a query selector.
        lineItem: 'data-cart-line-item',
        lineItemKey: 'data-cart-line-item-key',
        remove: 'data-cart-remove',
        qtyWrapper: 'data-cart-quantity-wrapper',
        qtyIncDec: 'data-cart-quantity-incdec',
        qtyInc: 'data-cart-quantity-inc',
        qtyDec: 'data-cart-quantity-dec',
        qtyInput: 'data-cart-quantity-input'
      },
      hiddenClass: 'hidden',
      disabledClass: 'is-disabled',
      emptyClass: 'cart-drawer--empty',
    }

    this.triggers = {
      drawerOpen: 'data-cart-open',
      addID: 'data-cart-add',
      addQTY: 'data-cart-add-qty'
    }

    this.emptyState ={
      defaultEmptyText: "Your cart is empty."
    }

    this.lineItemTemplate = document.querySelector('[data-cart-line-item-template]').innerHTML;

  }

  getSafeQtyValue(quantityInput){
    return parseInt(quantityInput.replace(/[^0-9]/g, ''));
  }

  triggerCartEmptyState(){
    this.selectors.cartDrawerWrapper.classList.add(this.selectors.emptyClass);
    this.selectors.cartTotalQuantity.textContent = '';
    this.selectors.cartDrawerContent.innerHTML = '<div class="cart-drawer__empty-text">' + this.emptyState.defaultEmptyText + '</div>';
    this.selectors.cartNoteWrapper.classList.add(this.selectors.hiddenClass);
    this.selectors.cartSubtotal.forEach(subtotal => subtotal.textContent = this.formatMoney(0));
    this.selectors.checkoutBtn.style.display = 'none';
    this.selectors.checkoutBtn.classList.add(this.selectors.disabledClass);
    this.selectors.cartInformation.style.display = 'none';
  }

  populateLineItems(itemsCount, lineItemsHTML, totalPrice){
    this.selectors.cartTotalQuantity.textContent = `(${itemsCount})`;
    if(lineItemsHTML){
      this.selectors.cartDrawerContent.innerHTML = lineItemsHTML;
    }
    this.selectors.cartSubtotal.forEach(subtotal => subtotal.textContent = this.formatMoney(totalPrice));
    this.selectors.checkoutBtn.style.display = 'block';
    this.selectors.checkoutBtn.classList.remove(this.selectors.disabledClass);
  }

  templateReplace(template, data) {
    const pattern = /{\s*(\w+?)\s*}/g; // {property}
    return template.replace(pattern, (_, token) => data[token] || '');
  }

  getLineItemProperties(item){
    let properties = '';
    //site by site magic in case you need to display line item properties for subscription intervals, custom products, etc.
    return properties;
  }

  formatMoney(cents, format) {
    let moneyFormat = '${{amount}}';
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }
    let value = '';
    let placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    let formatString = (format || moneyFormat);

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

      let parts = number.split('.');
      let dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      let centsAmount = parts[1] ? (decimal + parts[1]) : '';

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

  updateNote(){
    const cartNote = {
      note: this.selectors.cartNoteContent.value
    }

    return fetch('/cart/update.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cartNote),
    }).then((response) => response.json());
  }

  removeItem(key){
    let data = { updates: {}};
    data.updates[key] = 0;

    return fetch('/cart/update.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) =>{
      this.updateCartCache().then(() =>{
        this.populateCartDrawer();
      });
      return response.json()
    });
  }

  updateItem(key, qty){
    let data = { updates: {}};
    data.updates[key] = qty;

    return fetch('/cart/update.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) =>{
      this.updateCartCache().then(() =>{
        this.populateCartDrawer();
      });
      return response.json()
    });
  }

  addItem(key, qty){
    const data = {
      items: [
        {
          quantity: qty,
          id: key
        }
      ]
    };

    return fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) =>{
      this.updateCartCache().then(() =>{
        this.populateCartDrawer();
      });
      return response.json()
    });
  }

  updateCartCache(){
    return fetch('/cart.js', {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.json())
    .then((data) => {
      this.selectors.cartData.textContent = JSON.stringify(data);
      return data;
    });
  }

  populateCartDrawer(){
    const cartData = JSON.parse(this.selectors.cartData.innerHTML);
    this.selectors.cartDrawerContent.innerHTML = '';

    if(cartData.item_count == 0){
      this.triggerCartEmptyState();
      return;
    }

    // populate total count
    this.selectors.cartTotalQuantity.textContent =  `(${cartData.item_count})`;
    this.selectors.cartInformation.style.display = 'block';
    this.selectors.cartDrawerWrapper.classList.remove(this.selectors.emptyClass);

    // populate cart content
    let lineItemsHTML = '';
    cartData.items.forEach((item, index) => {
      let title = item.product_title;
      let featuredImage = item.featured_image;
      let featuredImageAlt = (featuredImage.alt.length > 0) ? featuredImage.alt : title;
      let data = {
        item_id: item.id,
        item_key: item.key,
        item_img_url: featuredImage.url,
        item_img_alt: featuredImageAlt,
        item_title: title,
        item_quantity: item.quantity,
        item_price: this.formatMoney(item.price * item.quantity),
        item_properties: this.getLineItemProperties(item),
        item_index: index + 1
      };
      let currentLineItemHTML = this.templateReplace(this.lineItemTemplate, data);
      lineItemsHTML += currentLineItemHTML;
    });

    let itemsCount = cartData.item_count;
    let totalPrice = cartData.total_price;
    this.populateLineItems(itemsCount, lineItemsHTML, totalPrice);

    if(cartData.note && cartData.note.length > 0){
      this.selectors.cartNoteWrapper.classList.remove(this.selectors.hiddenClass);
      this.selectors.cartNoteContent.textContent = cartData.note;
    }
    else{
      this.selectors.cartNoteWrapper.classList.add(this.selectors.hiddenClass);
    }
  }
  
  waitForElementToDisplay(selector, callback, checkFrequencyInMs, timeoutInMs) {
    const startTimeInMs = Date.now();
    (function loopSearch() {
      if (document.querySelector(selector) != null) {
        callback();
        return;
      }
      else {
        setTimeout(function () {
          if (timeoutInMs && Date.now() - startTimeInMs > timeoutInMs)
            return;
          loopSearch();
        }, checkFrequencyInMs);
      }
    })();
  }

  openDrawer(){
    this.waitForElementToDisplay('#smile-ui-container',function(){
      document.querySelector('#smile-ui-container').style.display = 'none';
    },100,9000);

    document.querySelector('body').style.overflow = 'hidden';
    this.populateCartDrawer();
    this.selectors.cartDrawerWrapper.classList.add('toggled');
  }

  closeDrawer(){
    let widget = document.querySelector('#smile-ui-container');
    if(widget){
      widget.style.display = 'block';
    }
    document.querySelector('body').style.overflow = 'scroll';
    this.selectors.cartDrawerWrapper.classList.remove('toggled');
  }

  init(){

    document.querySelectorAll(`[${this.triggers.drawerOpen}]`).forEach(trigger => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        this.openDrawer();
      });
    });

    document.addEventListener('click', (e) => {
      if(e.target.getAttribute(this.triggers.addID)){
        e.preventDefault();
        let parent = e.target.closest(`[${this.triggers.addID}]`)
        let id = parent.getAttribute(this.triggers.addID);
        let qty = parent.getAttribute(this.triggers.addQTY) || 1;
        this.addItem(id, qty).then(() =>{
          this.openDrawer();
        });
      }
    });

    document.addEventListener('cartDrawer:add', (e) => {
      let id = e.detail.id;
      let qty = e.detail.qty;
      this.addItem(id, qty).then(() =>{
        this.openDrawer();
      });
    });

    this.selectors.cartClose.addEventListener("click", (e) => {
      e.preventDefault();
      this.closeDrawer();
    });

    this.selectors.cartDrawerWrapper.addEventListener("click", (e) => {
      if(e.target.contains(this.selectors.cartDrawerWrapper)){
        this.closeDrawer();
      }
    });

    this.selectors.cartDrawerContent.addEventListener("click", (e) => {
      e.preventDefault();
      if(e.target.getAttribute(this.selectors.lineItems.remove)){
        this.selectors.checkoutBtn.classList.add(this.selectors.disabledClass);
        let itemKey = e.target.getAttribute(this.selectors.lineItems.remove);
        this.removeItem(itemKey);
      }
    });

    this.selectors.cartNoteContent.addEventListener("blur", (e) => {
      this.updateNote();
    });

    this.selectors.cartDrawerContent.addEventListener("blur", (e) => {
      if(e.target.getAttribute(this.selectors.lineItems.qtyInput) === ""){
        const newValue = this.getSafeQtyValue(e.target.value);
        e.target.value = newValue;
        let item = e.target.closest(`[${this.selectors.lineItems.lineItem}]`);
        let itemKey = item.getAttribute(this.selectors.lineItems.lineItemKey);
        this.updateItem(itemKey, newValue);
      }
    }, true);

    this.selectors.cartDrawerContent.addEventListener("click", (e) => {
      if(!(e.target.getAttribute(this.selectors.lineItems.qtyIncDec) === "")){return}
      const lineQtyParent = e.target.closest(`[${this.selectors.lineItems.qtyWrapper}]`);
      const lineQtyInput = lineQtyParent.querySelector(`[${this.selectors.lineItems.qtyInput}]`);
      const lineQtyInputVal = lineQtyInput.value;
      const currentValue = this.getSafeQtyValue(lineQtyInputVal);
      let newValue = 0;

      if(!(e.target.getAttribute(this.selectors.lineItems.qtyDec) === "")){
        newValue = (currentValue <= 0) ? 0 : currentValue - 1;
      }
      else{
        newValue = currentValue + 1;
      }

      const item = e.target.closest(`[${this.selectors.lineItems.lineItem}]`);
      const itemKey = item.getAttribute(this.selectors.lineItems.lineItemKey);
      this.updateItem(itemKey, newValue);
    });
  }
}