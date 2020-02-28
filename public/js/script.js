/* eslint-disable no-undef */
$("body").scrollspy({ target: "#side-nav" });

$.fn.stars = function() {
  return $(this).each(function() {
    const rating = $(this).data("rating");
    // const numStars = $(this).data("numStars");
    const fullStar = '<i class="fas fa-star"></i>'.repeat(Math.floor(rating));
    const halfStar = rating % 1 !== 0 ? '<i class="fas fa-star-half"></i>' : "";
    $(this).html(`${fullStar}${halfStar}`);
  });
};

$(() => {
  $(".stars").stars();
  $('[data-toggle="popover"]').popover();
  $(".popover-dismiss").popover({ trigger: "focus" });
  $('[data-toggle="tooltip"]').tooltip();
});

$(document).on("click", '[data-toggle="lightbox"]', function(event) {
  event.preventDefault();
  $(this).ekkoLightbox();
});

$("#book-request-faqs-accordion").on(
  "hide.bs.collapse show.bs.collapse",
  event => {
    $(event.target)
      .prev()
      .find("i:last-child")
      .toggleClass("fa-minus fa-plus");
  }
);

$("#book-request-faqs-accordion").on("shown.bs.collapse", event => {
  $("html, body").animate(
    {
      scrollTop: $(event.target)
        .prev()
        .offset().top
    },
    200
  );
});

$(".custom-file-input").on("change", function() {
  const fileName = $(this)
    .val()
    .split("\\")
    .pop();
  $(this)
    .siblings(".custom-file-label")
    .addClass("selected")
    .html(fileName);
});

$(document).ready(() => {
  $(".hamburger").on("click", () => {
    $(".animated-icon").toggleClass("open");
  });
  bsCustomFileInput.init();
});
