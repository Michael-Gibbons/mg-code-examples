export default class Modals {

  hideOnTopElements(){
    //site-by-site magic to hide chat widgets and the like on modal open
  }
  showOnTopElements(){
    //site-by-site magic to show chat widgets and the like on modal close
  }

  closeAllModals(){
    // deselect any focused form elements
    $(document.activeElement).trigger('blur');
    $('.ambaum-modal__overlay').css("background-image", "none");
    $('.ambaum-modal, .ambaum-modal__overlay').addClass('ambaum-modal__closed');
    $('body').css("overflow", "auto");
    this.showOnTopElements();
  }

  openModal(modalSelector, options){
    this.closeAllModals();
    if(options && options.backgroundImage){
      $('.ambaum-modal__overlay').css("background-image", "url(" + options.backgroundImage + ")");
    }
    $('.ambaum-modal__overlay').removeClass('ambaum-modal__closed');
    modalSelector.removeClass('ambaum-modal__closed');
    $('body').css("overflow", "hidden");
    this.hideOnTopElements();
  }

  preloadModalImages() {
    let preloadedImages = [];
    $('[data-modal-background-image]').each(function(i){
      preloadedImages[i] = new Image();
      preloadedImages[i].src = $(this).data('modal-background-image');
    });
    return preloadedImages;
  }

   init(){
    $('[data-trigger-modal]').on('click', function(e){
      const modalID = $(e.target).data('trigger-modal');
      const modal = $(`[data-modal="${modalID}"]`);
      const backgroundImage = modal.data('modal-background-image');
      this.openModal(modal, {backgroundImage: backgroundImage});
    }.bind(this));

    $('.ambaum-modal__overlay,.ambaum-modal__close').on('click', function(){
      this.closeAllModals();
    }.bind(this));

    $(document).on('keydown.ambaum-modal', function(evt) {
      if (evt.keyCode === 27) {
        this.closeAllModals();
      }
    }.bind(this));
    this.preloadModalImages();
  };
}