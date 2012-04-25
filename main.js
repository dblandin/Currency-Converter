/* Currency Conversion Calculator
   by Devon Blandin, April 2012 
   for IT 238, Spring Quarter 2012 */

// converts one currency to another. called when the select fields or the currencyAmount input changes
currencyExchangeRates = {};
var convertCurrency = function() {
	// validate input
  	if (Number($("#currencyAmountChoice").val()) > 0) {

	  	// set variables
	  	var fromCurrencyCode, toCurrencyCode, fromCurrencyName, toCurrencyName, currencyAmount,
	  	usd_fromCurrencyRate, usd_toCurrencyRate, convertedCurrency, fromCurrencyMessage, toCurrencyMessage, message;

		// get value from page inputs  
	  	fromCurrencyCode = $("#fromCurrencyChoice").val();
	  	fromCurrencyName = $('#fromCurrencyChoice option[value="' + fromCurrencyCode + '"]').text();

	  	toCurrencyCode = $("#toCurrencyChoice").val();
	  	toCurrencyName = $('#toCurrencyChoice option[value="' + toCurrencyCode + '"]').text();
	  	
	  	currencyAmount = Number($("#currencyAmountChoice").val());

	  	// get rates relative to USD base
		usd_fromCurrencyRate = currencyExchangeRates[fromCurrencyCode];
		usd_toCurrencyRate = currencyExchangeRates[toCurrencyCode];

		// convert the currency
		convertedCurrency = currencyAmount * (usd_toCurrencyRate * (1 / usd_fromCurrencyRate));

		// assemble messages adjusting to singular/plural values
		if (currencyAmount <= 1) {
			fromCurrencyMessage = currencyAmount.toFixed(2) + " " + fromCurrencyName + '(' + fromCurrencyCode + ')';
		} else {
			fromCurrencyMessage = currencyAmount.toFixed(2) +  " " + fromCurrencyName + 's' + '(' + fromCurrencyCode + ')';
		}
		
		if (convertedCurrency <= 1) {
			toCurrencyMessage = '<span id="convertedCurrency">' + convertedCurrency.toFixed(2) + '</span> ' + toCurrencyName + '(' + toCurrencyCode + ')';
			;
		} else {
			toCurrencyMessage = '<span id="convertedCurrency">' + convertedCurrency.toFixed(2) + '</span> ' + toCurrencyName + 's' + '(' + toCurrencyCode + ')';
		}

		message = fromCurrencyMessage + ' &rarr; ' + toCurrencyMessage;

		// print out result
		$("#result").html(message);
	} else {
		// print out error message
		$("#result").html('<span class="error">Please enter a positive number!</span>');
	}

}
var swapCurrency = function() {
	// set variables
	var fromCurrencyCode, toCurrencyCode, convertedCurrencyAmount;

	// get current select field values
	toCurrencyCode = $("#toCurrencyChoice").val();
	fromCurrencyCode = $("#fromCurrencyChoice").val();
	
	// swap select field values
	$('#fromCurrencyChoice').val(toCurrencyCode);
	$('#toCurrencyChoice').val(fromCurrencyCode);
	
	// swap amount input field
	convertedCurrencyAmount = $('span#convertedCurrency').html();
	$('#currencyAmountChoice').val(convertedCurrencyAmount);

	// run convertCurrency again
	convertCurrency();
}
var getRates = function() {

	// make ajax request to get latest rates
	$.ajax({
			url: "http://openexchangerates.org/latest.json",
			dataType: "jsonp",
			type: "GET",
			processData: true,
			contentType: "application/json",
			success: function(data) {
				if ( data != null ) {
					// if success is successful and the data is not null, 
					// set the rates to the object data for use by other methods
					// and enable the input field
					currencyExchangeRates = data.rates;
					$('input#currencyAmountChoice').removeAttr('disabled');
				} else {
					$("#result").html('Rates not available');
				}
			},
			error: function (xhr, ajaxOptions, thrownError) {
					$("#result").html('Rates not available');
                    console.log(xhr.status);
                    console.log(thrownError);
            }
	}).done(function(){
		// populate the menus
		populateSelectMenus();
	});
}
// this function populates the select menus with currently available currencies. callen on page load.
var populateSelectMenus = function() {

	// make ajax request for the latest list of available currencies
	$.ajax({
			url: "http://openexchangerates.org/currencies.json",
			dataType: "jsonp",
			type: "GET",
			processData: true,
			contentType: "application/json",
			success: function(data) {
				// empty the select lists
				$('#fromCurrencyChoice').empty();
			    $('#toCurrencyChoice').empty();
			  if ( data != null ) {
			      $.each(data, function(currencyCode,currencyName){
			      	// fill the select lists with currencies
			        $('#fromCurrencyChoice').append('<option value="' + currencyCode + '">' + currencyName + '</option>');
			        $('#toCurrencyChoice').append('<option value="' + currencyCode + '">' + currencyName + '</option>');
			        $('#fromCurrencyChoice').val('USD');
			        $('#toCurrencyChoice').val('EUR');
			      });
			  } else {
			  		$('#fromCurrencyChoice').append('<option>Error</option>');
			    	$('#toCurrencyChoice').append('<option>Error</option>');
			    	console.log("Error: No data found!");
			  	}
			},
			error: function (xhr, ajaxOptions, thrownError) {
                    $('#fromCurrencyChoice').append('<option>Error</option>');
			    	$('#toCurrencyChoice').append('<option>Error</option>');
			    	console.log(xhr.status);
                    console.log(thrownError);
            }
	}).done(function(){
		// convert the currency
		convertCurrency();
	});
}

// populate select menus with currently available currencies and setup onclick event handler
$(function() {
	// setup the page
	getRates();

	// set event handlers
	$('#currencyAmountChoice').keyup(convertCurrency);
	$('#toCurrencyChoice').change(convertCurrency);
	$('#fromCurrencyChoice').change(convertCurrency);
	$("#swapCurrencyButton").click(swapCurrency);
});