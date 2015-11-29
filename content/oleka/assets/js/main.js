/*====================================================
  TABLE OF CONTENT
  1. function declearetion
  2. Initialization
====================================================*/

/*===========================
 1. function declearetion
 ==========================*/
var themeApp = {
	featuredMedia: function(){
		$(".single-post-wrap").each(function() {
			var thiseliment = $(this);
			var media_wrapper = $(this).find('featured');
			var media_content_embeded = media_wrapper.find('iframe');
			if (media_content_embeded.length > 0) {
				$(media_content_embeded).insertAfter(thiseliment.find('.post-header')).wrap("<div class='featured-media media-embeded'></div>");
				thiseliment.find('.post-content').removeClass('no-media');
			}
		});
	},
	responsiveIframe: function() {
		$('.single-post-wrap').fitVids();
	},
	setNavbar: function() {
		if(typeof fixed_navbar != "undefined" && fixed_navbar == true) {
			$('.main-navbar').addClass('navbar-fixed-top');
			$('.man-content-wrap').addClass('has-fixed-navbar');
		}
	},
	searchForm: function() {
		$('#search-submit').on('click', function(e) {
			e.preventDefault();
		});
		$("#search-field").ghostHunter({
		    results         : "#search-result",
		    onKeyUp         : true,
		    zeroResultsInfo     : false,
		    info_template   : "<div class=\"search-info\">{{amount}} posts found</div>",
		    result_template : "<div><a href='{{link}}'>{{title}}</a></div>"
		});
	},
	highlighter: function() {
		$('pre code').each(function(i, block) {
		    hljs.highlightBlock(block);
		});
	},
	tagcloud:function(){
		if ($('.tag-cloud').length) {
			var FEED_URL = "/rss/";
			var primary_array = [];
			$.get(FEED_URL, function (data) {
				$(data).find("category").each(function () {
					var el = $(this).text();
					if ($.inArray(el, primary_array) == -1) {
						primary_array.push(el);
					}
				});
				var formated_tag_list = "";
				for ( var i = 0; i < primary_array.length; i = i + 1 ) {
					var tag = primary_array[ i ];
					var tagLink = tag.toLowerCase().replace(/ /g, '-');
					formated_tag_list += ("<a href=\"/tag/" + tagLink + "\">" + tag + "</a>");
				}
				$('.tag-cloud').append(formated_tag_list);
			});
		}
	},
	recentPost:function() {
		var feed_url = "/rss/";
		var code = String('');
		$.get(feed_url, function(data) {
			$(data).find('item').slice(0,recent_post_count).each(function(){
				var full = $(this).find('description').text();
				var content = $(this).contentSnippet;
				var link = $(this).find('link').text();
				var title = $(this).find('title').text();
				var published_date = $(this).find('pubDate').text();
				var image_link = $(this).find('media\\:content, content').attr('url');
				if (typeof image_link !== 'undefined') {
					var image = '<div class="post-thumb pull-left" style="background-image:url(' + image_link + ')"></div>';
					var helper_class = 'have-image';
				} else {
					var image ='<div class="post-thumb pull-left"><i class="fa fa-image"></i></div>';
					var helper_class = '';
				}
				function format_date (dt) {
					var d = new Date(dt);
					var month_name = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
					var month = month_name[d.getMonth()];
					var date = d.getDate();
					var year = d.getFullYear();
					var formatted_dt = date+' '+month+','+' '+year;
					return formatted_dt;
				}
				code += '<div class="recent-single-post clearfix ' +helper_class+ '"><a href="' + link + '" class="post-title">';
				code += image;
				code += '<div class="post-info">' + title + '<div class="date">' + format_date(published_date) + '</div></div>';
				code += '</a></div>';
			})
			$(".recent-post").html(code);
		});
	},
	mailchimp:function() {
		function IsEmail(email) {
			var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			return regex.test(email);
		}
		var form = $('#mc-embedded-subscribe-form');
		form.attr("action", mailchimp_form_url);
		var message = $('#message');
		var submit_button = $('mc-embedded-subscribe');
		form.submit(function(e){
			e.preventDefault();
			$('#mc-embedded-subscribe').attr('disabled','disabled');
			if($('#mce-EMAIL').val() != '' && IsEmail($('#mce-EMAIL').val())) {
				message.html('please wait...').fadeIn(1000);
				var url=form.attr('action');
				if(url=='' || url=='YOUR_MAILCHIMP_WEB_FORM_URL_HERE') {
					alert('Please config your mailchimp form url for this widget');
					return false;
				}
				else{
					url=url.replace('?u=', '/post-json?u=').concat('&c=?');
					console.log(url);
					var data = {};
					var dataArray = form.serializeArray();
					$.each(dataArray, function (index, item) {
					data[item.name] = item.value;
					});
					$.ajax({
						url: url,
						type: "POST",
						data: data,
						dataType: 'json',
						success: function(response, text){
							if (response.result === 'success') {
								message.html(success_message).delay(10000).fadeOut(500);
								$('#mc-embedded-subscribe').removeAttr('disabled');
								$('#mce-EMAIL').val('');
							}
							else{
								message.html(response.result+ ": " + response.msg).delay(10000).fadeOut(500);
								console.log(response);
								$('#mc-embedded-subscribe').removeAttr('disabled');
								$('#mce-EMAIL').focus().select();
							}
						},
						dataType: 'jsonp',
						error: function (response, text) {
							console.log('mailchimp ajax submit error: ' + text);
							$('#mc-embedded-subscribe').removeAttr('disabled');
							$('#mce-EMAIL').focus().select();
						}
					});
					return false;
				}
			}
			else {
				message.html('Please provide valid email').fadeIn(1000);
				$('#mc-embedded-subscribe').removeAttr('disabled');
				$('#mce-EMAIL').focus().select();
			}            
		});
	},
	facebook:function() {
		if ($('.fb').length) {
			var facebook_sdk_script = '<div id="fb-root"></div><script>(function(d, s, id) {var js, fjs = d.getElementsByTagName(s)[0];if (d.getElementById(id)) return;js = d.createElement(s); js.id = id;js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.4";fjs.parentNode.insertBefore(js, fjs);}(document, \'script\', \'facebook-jssdk\'));</script>'
			var fb_page = '<div class="fb-page" data-href="'+facebook_page_url+'" data-small-header="false" data-adapt-container-width="true" data-hide-cover="false" data-show-facepile="true" data-show-posts="false"><div class="fb-xfbml-parse-ignore"></div></div>';
			$('body').append(facebook_sdk_script);
			$('.fb').append(fb_page);
			$(".fb").fitVids();
		}
	},
	twitter: function() {
		if ($('.twitter').length) {
			var twitter_block = '<a class="twitter-timeline" href="'+twitter_url+'" data-widget-id="'+twitter_widget_id+'" data-link-color="#0062CC" data-chrome="nofooter noscrollbar" data-tweet-limit="'+number_of_tweet+'">Tweets</a>';
			twitter_block += "<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+\"://platform.twitter.com/widgets.js\";fjs.parentNode.insertBefore(js,fjs);}}(document,\"script\",\"twitter-wjs\");</script>";
			$('.twitter').append(twitter_block);
		}
	},
	backToTop: function() {
		$(window).scroll(function(){
			if ($(this).scrollTop() > 100) {
				$('#back-to-top').fadeIn();
			} else {
				$('#back-to-top').fadeOut();
			}
		});
		$('#back-to-top').on('click', function(e){
			e.preventDefault();
			$('html, body').animate({scrollTop : 0},1000);
			return false;
		});
	},
	init:function(){
		themeApp.featuredMedia();
		themeApp.responsiveIframe();
		themeApp.setNavbar();
		themeApp.searchForm();
		themeApp.highlighter();
		themeApp.tagcloud();
		themeApp.recentPost();
		themeApp.mailchimp();
		themeApp.facebook();
		themeApp.twitter();
		themeApp.backToTop();
	}
}
/*===========================
2. Initialization
==========================*/
$(document).ready(function(){
	themeApp.init();
});