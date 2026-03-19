$(function () {
 ("use strict");
 // script

 var layoutHeader = $(".layout-header").height();
 // var topBar = $('.layout-header .top-bar').height();
 var windowWidth = $(window).width();

//  $(window).scroll(function () {
//   if (
//    $(window).scrollTop() > layoutHeader &&
//    windowWidth > 992
//   ) {
//    $(".layout-header").addClass("tiny");
//    // $('.layout-header').css('transform', 'translateY(' + topBar + ')');
//   } else {
//    $(".layout-header").removeClass("tiny");
//   }
//  });

$(window).scroll(function () {
  if ($(window).scrollTop() > layoutHeader && windowWidth > 992) {
    // เงื่อนไขจอใหญ่
    $(".layout-header").addClass("tiny");
  } 
  else if ($(window).scrollTop() > layoutHeader && windowWidth <= 991) {
    // เงื่อนไขจอเล็ก
    $(".layout-header").removeClass("tiny");
    $(".layout-header").addClass("tiny-mobile");
  } 
  else {
    // ค่าเริ่มต้น
    $(".layout-header").removeClass("tiny");
    $(".layout-header").removeClass("tiny-mobile");
  }
});

//  $(".layout-header").addClass("tiny-mobile");

 //  $('[data-toggle="menu-mobile"]').click(function (e) {
 //   e.preventDefault();
 //   $(this).toggleClass("close");
 //   $("nav.menu").toggleClass("open");
 //  });

 $("[data-toggle='dropdown']").click(function (e) {
  e.preventDefault();
  $(this).toggleClass("active");
  $(this).parents(".dropdown").toggleClass("open");
  $(this)
   .parents(".dropdown")
   .find(".dropdown-menu")
   .toggleClass("show");
  e.stopPropagation();
 });

 //  var layoutHeader = $("html");
 $("html").click(function () {
  $(".dropdown").find("a, button").removeClass("active");
  $(".dropdown").removeClass("open");
  $(".dropdown-menu").removeClass("show");
 });

 var overlay = $('<div class="overlay"></div>');

 $(".side-main .header .topbar .burger-menu-area").click(
  function (e) {
   e.preventDefault();
   $(".side-bar").toggleClass("active");
  }
 );

 $(".side-bar .header .burger-menu").click(function () {
  $(".side-bar").removeClass("active");
  overlay.fadeOut(function () {
   overlay.remove(); // ลบออกจาก DOM หลังจาก fadeOut
  });
 });

 $(".side-main .header .topbar .burger-menu-area").click(
  function () {
   // สร้าง div overlay และเพิ่มคลาส 'overlay'

   // เพิ่ม div overlay ลงใน body
   $(".system-area").append(overlay);
   // แสดง overlay
   overlay.fadeIn();

   // เมื่อคลิกที่ overlay ให้ลบออกจาก DOM
   overlay.click(function () {
    $(".side-bar").removeClass("active");
    overlay.fadeOut(function () {
     overlay.remove(); // ลบออกจาก DOM หลังจาก fadeOut
    });
   });
  }
 );

 // คลิกข้างนอก dropdown จะปิดทุก dropdown
 $(document).click(function (e) {
  if (
   !$(e.target).closest(".layout-header .dropdown").length
  ) {
   $(".dropdown").removeClass("open");
   $(".dropdown-menu").removeClass("show");
   $(".dropdown").find("a, button").removeClass("active");
  }
 });

 AOS.init({
  duration: 1400,
  once: true,
  offset: 0,
 });

 let lazyLoadInstance = new LazyLoad({
  elements_selector: ".lazy",
 });

 const scrollToTopBtn = $("#scrollToTopBtn");
 // Show the button when user scrolls down 40px from the top
 $(window).scroll(function () {
  if ($(this).scrollTop() > 40) {
   scrollToTopBtn.addClass("show");
  } else {
   scrollToTopBtn.removeClass("show");
  }
 });

 // Scroll to the top when the button is clicked
 scrollToTopBtn.click(function (e) {
  e.preventDefault();
  $("html, body").animate({ scrollTop: 0 }, 800);
  return false;
 });

 // tab
 $(".tab-horizontal").each(function () {
  let tab = $(this).find(".tab");
  let tabContent = $(this).find(".tab-content");
  let selector = tab.find(".selector");
  let item = tab.find("a");

  function tabSelector() {
   let activeItem = tab.find(".active");
   let activeWidth = activeItem.innerWidth();
   selector.css({
    left: activeItem.position.left + "px",
    width: activeWidth + "px",
   });
  }

  tabSelector();

  tab.on("click", "a", function (e) {
   e.preventDefault();
   item.removeClass("active");
   $(this).addClass("active");

   let activeWidth = $(this).innerWidth(),
    itemPos = $(this).position();

   selector.css({
    left: itemPos.left + "px",
    width: activeWidth + "px",
   });

   let tabAttr = $(this).attr("href");

   tabContent.removeClass("active");
   $(tabAttr).addClass("active");
  });

  $(window).resize(function () {
   tabSelector();
   setTimeout(function () {
    let activeWidth = tab.find(".active").innerWidth();
    let itemPos = tab.find(".active").position();
    selector.css({
     left: itemPos.left + "px",
     width: activeWidth + "px",
    });
   }, 100);
  });
 });
});

$(document).ready(function () {
 $(".submenu-area.-area-start a").hover(function () {
  var href = $(this).attr("href");
  $(".submenu-area.-area-end .tab-pane").removeClass(
   "show"
  );
  $(".submenu-area.-area-end .tab-pane" + href).addClass(
   "show"
  );
  // console.log(href);
 });

 $(".submenu-area.-area-start a").on(
  "mouseover",
  function () {
   $(".submenu-area.-area-start a").removeClass("active");
   $(this).addClass("active");
  }
 );

 $(".submenu-area.-area-start a").on("click", function () {
  $(".submenu-area.-area-start a").removeClass("active");
  $(this).addClass("active");
 });

 // collapse
 $(".collapse-box").each(function () {
  let acc = $(this);
  let btn = $(this).find(">.collapse-btn");
  let content = $(this).find(">.collapse-content");

  content.hide();

  if (acc.find(".collapse-content").length == 0) {
   acc.addClass("empty");
  }

  if (btn.hasClass("active")) {
   $(this).parent().find(content).slideDown(400);
  }

  btn.click(function () {
   if ($(this).hasClass("active")) {
    $(this)
     .removeClass("active")
     .parent()
     .find(content)
     .slideUp(400);
   } else {
    $(this)
     .closest(".collapse-group")
     .find(".collapse-btn")
     .removeClass("active");
    $(this)
     .closest(".collapse-group")
     .find(".collapse-content")
     .slideUp(400);
    $(this)
     .addClass("active")
     .parent()
     .find(content)
     .slideDown(400);
   }
   return false;
  });
 });

 // tab
 $(".tab-horizontal").each(function () {
  let tab = $(this).find(".tab");
  let tabContent = $(this).find(".tab-content");
  let selector = tab.find(".selector");
  let item = tab.find("a");

  function tabSelector() {
   let activeItem = tab.find(".active");
   let activeWidth = activeItem.innerWidth();
   selector.css({
    left: activeItem.position.left + "px",
    width: activeWidth + "px",
   });
  }

  tabSelector();

  tab.on("click", "a", function (e) {
   e.preventDefault();
   item.removeClass("active");
   $(this).addClass("active");

   let activeWidth = $(this).innerWidth(),
    itemPos = $(this).position();

   selector.css({
    left: itemPos.left + "px",
    width: activeWidth + "px",
   });

   let tabAttr = $(this).attr("href");

   tabContent.removeClass("active");
   $(tabAttr).addClass("active");
  });

  $(window).resize(function () {
   tabSelector();
   setTimeout(function () {
    let activeWidth = tab.find(".active").innerWidth();
    let itemPos = tab.find(".active").position();
    selector.css({
     left: itemPos.left + "px",
     width: activeWidth + "px",
    });
   }, 100);
  });
 });
});

// tab
$(".tab-horizontal").each(function () {
 let tab = $(this).find(".tab");
 let tabContent = $(this).find(".tab-content");
 let selector = tab.find(".selector");
 let item = tab.find("a");

 function tabSelector() {
  let activeItem = tab.find(".active");
  let activeWidth = activeItem.innerWidth();
  selector.css({
   left: activeItem.position.left + "px",
   width: activeWidth + "px",
  });
 }

 tabSelector();

 tab.on("click", "a", function (e) {
  e.preventDefault();
  item.removeClass("active");
  $(this).addClass("active");

  let activeWidth = $(this).innerWidth(),
   itemPos = $(this).position();

  selector.css({
   left: itemPos.left + "px",
   width: activeWidth + "px",
  });

  let tabAttr = $(this).attr("href");

  tabContent.removeClass("active");
  $(tabAttr).addClass("active");
 });

 $(window).resize(function () {
  tabSelector();
  setTimeout(function () {
   let activeWidth = tab.find(".active").innerWidth();
   let itemPos = tab.find(".active").position();
   selector.css({
    left: itemPos.left + "px",
    width: activeWidth + "px",
   });
  }, 100);
 });
});

$(".mcscroll").mCustomScrollbar({
 axis: "y",
 scrollButtons: {
  enable: true,
 },
});

$(window).on("load", function () {
 const $target = $(".mcscroll");

 $target.mCustomScrollbar("destroy");

 $target.mCustomScrollbar({
  axis: "y",
  scrollButtons: {
   enable: true,
  },
  theme: "minimal-dark",
  callbacks: {
   onInit: function () {
    const $dragger = $(this).find(".mCSB_dragger");
    const $rail = $dragger.find(".mCSB_draggerRail");

    if ($rail.length) {
     $rail.insertAfter($dragger); // ย้ายออกจาก dragger
    }
   },
  },
 });
});

// select2
$(".select-control").select2({
 minimumResultsForSearch: -1,
 placeholder: function () {
  $(this).data("placeholder");
 },
});
$(".select-control.has-search").select2({
 placeholder: "Select",
});

$(".hase-datepicker").datepicker();

$(function () {
 const visitorCount = "2432589"; // ตัวเลขสถิติผู้เข้าชมจากระบบ
 const $container = $("#visitorCount");

 // ล้างก่อน แล้วเติมตัวเลขลงไป
 $container.empty();
 $.each(visitorCount.split(""), function (i, num) {
  $("<span>")
   .addClass("digit")
   .text(num)
   .appendTo($container);
 });
});

$('[data-toggle="menu-mobile"]').click(function (e) {
 e.preventDefault();
 $(this).toggleClass("open");
 $("nav.menu").toggleClass("open");

 $("nav.menu .dropdown-menu").removeClass("hide");

 if ($('[data-toggle="menu-close"]').hasClass("open")) {
  $('[data-toggle="menu-close"]').removeClass("open");
 } else {
  $('[data-toggle="menu-close"]').addClass("open");
 }

 if ($("nav.menu .dropdown-menu").hasClass("show")) {
  $("nav.menu .dropdown-menu").addClass("hide");
  setTimeout(() => {
   $("nav.menu .dropdown-menu").removeClass("hide");
  }, 100);
 }
});
$('[data-toggle="menu-close"]').click(function (e) {
 e.preventDefault();
 $(this).removeClass("open");
 $('[data-toggle="menu-mobile"]').removeClass("open");
 $("nav.menu").removeClass("open");
 $("nav.menu .dropdown-menu").addClass("hide");

 setTimeout(() => {
  $("nav.menu .dropdown-menu").removeClass("hide");
 }, 100);
});
