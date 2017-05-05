var isOpen = false;

var isMobile = {
  Android: function () {
    return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function () {
    return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function () {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function () {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function () {
    return navigator.userAgent.match(/IEMobile/i);
  },
  any: function () {
    return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
  }
};

if (!isMobile.any()) {


  $('body').css('overflow', 'hidden');
 

}
else {

  $("#side_bar").css({ 'position': 'absolute' });
  $('header').css('height', '9%');
  $('.alert-info').eq(0).css('display', 'none');
  $('.btn').eq(0).removeClass('btn-lg');
  $('.btn').eq(0).css({ 'margin-top': '1%' });

}



function openNav() {


  if (isOpen) {

      document.getElementById("side_bar").style.width = "0";
      isOpen=false;

  }
  else {
    isOpen=true;
    if ($(window).width() > 500 && $(window).width() <= 1080) {
      document.getElementById("side_bar").style.width = "36%";
    }
    else if ($(window).width() < 500) {

      document.getElementById("side_bar").style.width = "80%";
    }
    else {
      document.getElementById("side_bar").style.width = "25%";
    }


  }


}

function closeNav() {
  document.getElementById("side_bar").style.width = "0";
}








