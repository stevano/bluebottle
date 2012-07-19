$(document).ready(function(){
	initMore();
	initProfileViewer();
});


function initMore(){
	$('.more').each(function(){
		if ($(this).parent().parent().find('.long').html().length == $(this).parent().parent().find('.short').html().length) {
			$(this).hide();
		}
	});
	$('.more').click(function(){
		$(this).parent().parent().find('.long').show();
		$(this).parent().parent().children('.short').hide();
		return false;
	});
	$('.less').click(function(){
		$(this).parent().parent()('p').children('.long').hide();
		$(this).parent().parent()('p').children('.short').show();
		return false;
	});
	
}


function initProfileViewer(){
	$('.panelink').click(function(){
		var name = $(this).attr('for');
		$(this).parent().find('.pane').hide();
		$(this).parent().find('.' + name).show();
		return false;
	});
}
