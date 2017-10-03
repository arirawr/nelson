genreLimitAlert("off");

$('#genres-list input').change(function() {
  if($('#genres-list input:checked').length > 5) {
    $(this).parent().removeClass("active");
    this.checked = false;
    genreLimitAlert("on");
  }
  else {
    genreLimitAlert("off");
  }
  $('#genres-list input:checked').each(function() {
    console.log($(this).val());
  });
});

function genreLimitAlert(state) {
  if(state == "on") {
    $('#genreLimitAlert').show();
  } else {
    $('#genreLimitAlert').hide();
  }
}

function sendRecommendationsRequest() {
  $('#genres-list input:checked').each(function() {
    console.log($(this).val());
  });
}