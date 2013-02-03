$(document).ready(function() {
	$('.task').click(function() {
		$('.exercises').show('fast');
	});
	$('.answer').click(function() {
		$('.exercise').show('fast');
	});
});