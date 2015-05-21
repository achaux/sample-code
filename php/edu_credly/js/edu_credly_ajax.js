Drupal.behaviors.edu_credly = function(context) {

  // The user can copy the primary EDUCAUSE email address and use that for
  // the Credly integration.
  $('#edit-field-credly-get-primary-email', context).bind('click', function(event) {
      
      // Get the primary email address
      var primaryEmail = $('#edit-field-email-1-0-value').val();
      
      // Set the Credly email address
      $('#edit-field-credly-email-0-value').attr("value", primaryEmail);
      
      // Send email to the Ajax callback page and send the resulst to the 
      // processCredlyResults callback function defined below
      synchCredly(primaryEmail);
      event.preventDefault();
  });
  
  // When the user clicks on the "Use the email I entered" button, get the email address provided
  // and send to Credly to capture the users Credly profile data
  $('#edit-field-credly-submit', context).bind('click', function(event) {
      
      // The email address provided by user via usernode content type form
      var credlyEmail = $('#edit-field-credly-email-0-value').val();
      
      // Send email to the Ajax callback page and send the resulst to the 
      // processCredlyResults callback function defined below
      synchCredly(credlyEmail);
      event.preventDefault();
  });
  
  // Remove the Credly profile
  $('#edit-field-credly-remove', context).bind('click', function(event) {
      $('#edit-field-credly-id-0-value').val('');
      $('#edit-field-credly-email-0-value').val('');
      removeCredlyProfileLink();
      setCredlyMessage('message', 'Your Credly account was removed.  To make your change permanent, remember to save your profile.');
      event.preventDefault();
  });
  
  function synchCredly(email) {
      // If the provided email address is a valid email address
      if (isValidEmailAddress(email)) {
          // reset the message box
          setCredlyMessage('reset', '');
          // Send email to the Ajax callback page and send the result to the
          // processCredlyResults callback function defined below
          credlySetLoader('start');
          $.getJSON('/edu_credly/query_credly/callback/' + email, function(res) {
              credlySetLoader('stop');
              // Check if account was found
              if (res.data.meta.status_code === 200) {
                  var credly_id = res.data.data[0].id;
                  $('#edit-field-credly-id-0-value').val(credly_id);
                  removeCredlyProfileLink();
                  showCredlyProfileLink();
                  setCredlyMessage('message', 'Your account was found.  To make your change permanent, remember to save your profile.');
              }
              else {
                  $('#edit-field-credly-id-0-value').val('');
                  $('#edit-field-credly-email-0-value').val('');
                  removeCredlyProfileLink();
                  setCredlyMessage('error', 'A Credly account with the <strong>' + email + '</strong> email address was not found.  Try a different email address or create a <a href="http://credly.com" taget="_blank">Credly</a> account.');
              }
          });
      }
      else {
        // The provided email address is not valid, notify the user
        setCredlyMessage('error', 'The email address you provided is not valid.');
      }
  }
  
  function showCredlyProfileLink() {
    id= $('#edit-field-credly-id-0-value').val();
    if (id) {
      $( '<p class="credly_profile_link"><a href="http://credly.com/u/' + id + '" target="_blank" class="ext">View your Credly badge profile</a><span class="ext"></span></p>' ).appendTo( ".group-credly-profile");
      // If we are showing the badge link, we hide the email field and button
      $('#edit-field-credly-email-0-value').val('');
      $('#edit-field-credly-email-0-value-wrapper').hide();
      $('#edit-field-credly-submit').hide();
      // Show the remove link
      $('#edit-field-credly-remove').show();
      // Show the linked description text
      $('.edit-field-credly-email-description-linked').show().removeClass('js-hide');
      // Hide the standard description text
      $('.edit-field-credly-email-description').hide();
    }
  }
  
  function removeCredlyProfileLink() {
    // Hide the profile link
    $('.credly_profile_link').remove();
    // Hide the remove button
    $('#edit-field-credly-remove').hide();
    // Show the email field and submit button
    $('#edit-field-credly-email-0-value-wrapper').show();
    $('#edit-field-credly-submit').show();
    // Hide the linked description text
    $('.edit-field-credly-email-description-linked').hide();
    // Show the standard description text
    $('.edit-field-credly-email-description').show();
  }
  
  function isValidEmailAddress(emailAddress) {
      var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
      return pattern.test(emailAddress);
  };
  
  function credlySetLoader(status) {
    if (status == 'start') {
    $('.group-credly-profile').append('<div class="edu_credly_loader"></div>');
    }
    else {
      $('.edu_credly_loader').remove();
    }
  }
  
  function setCredlyMessage(type, message){
      if (type == 'reset') {
        rmclass = 'js-show error';
        addclass = 'js-hide';
        adderr = 'no-error';
        message = '';
      }
      else if (type == 'error') {
        rmclass = 'js-hide warning';
        addclass = 'js-show messages error';
        adderr = 'error';
      }
      else if (type == 'message'){
        rmclass = 'js-hide error';
        addclass = 'js-show messages warning';
        adderr = 'no-error';
      }
      $('.field_credly_markup').html(message);
      if (type == 'reset') {
          $('.field_credly_markup').removeClass(rmclass).addClass(addclass).addClass(adderr);
          $('#edit-field-credly-email-0-value').removeClass('error');
      }
      else {
          $('.field_credly_markup').removeClass(rmclass).addClass(addclass).addClass(adderr);
          $('#edit-field-credly-email-0-value').addClass(adderr);
      }
  }
  setCredlyMessage('reset');
  showCredlyProfileLink();
}
