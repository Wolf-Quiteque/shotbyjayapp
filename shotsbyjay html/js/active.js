(function ($) {
    "use strict";

    /*--
        Common Variables
    -----------------------------------*/
    var $window = $(window),
        $body = $('body');

    /*--
        Header Functions
    -----------------------------------*/

    /* Variables */
    var $mobileMenu = $('.mobile-menu, .overlay-menu');

    /* Header Toggle & Close Buttons */
    $('.header-toggle-buttons a').on('click', function (e) {
        e.preventDefault();
        var $this = $(this),
            $target = $this.attr('href');
        $this.hasClass('menu-toggle') ? $this.toggleClass('active') : '';
        $($target).addClass('open');
    });
    $('.overlay-menu-toogle').on('click', function (e) {
        e.preventDefault();
        var $this = $(this),
            $target = $this.data('target');
        $($target).addClass('open');

    });
    $('.close-btn').on('click', function (e) {
        e.preventDefault();
        var $this = $(this),
            $target = $this.data('target');
        $($target).removeClass('open');
    });
    /* Sub Menu Toggle */
    $mobileMenu.find('.sub-menu').parent().append('<span class="menu-expand"></span>');
    $mobileMenu.on('click', 'li a, .menu-expand', function (e) {
        var $this = $(this),
            $subMenu = $this.siblings('.sub-menu');
        if ($subMenu.length && ($this.hasClass('menu-expand') || $this.attr('href') === '#')) {
            e.preventDefault();
            if ($subMenu.is(':visible')) {
                $this.siblings('.sub-menu').slideUp().parent('li').removeClass('open');
            } else {
                $subMenu.slideDown().parent('li').addClass('open').siblings('li').find('.sub-menu').slideUp().parent('li').removeClass('open');
            }
        }
    });

    /*--
        Slider Activations
    -----------------------------------*/

    /* Hero/Main Slider One (Swiper) */
    var sliderOneActive = new Swiper('.slider1-active', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        },
        pagination: {
            el: '.slider1-pagination',
            renderBullet: function (index, className) {
                return '<span class="' + className + '"><span class="number">0' + (index + 1) + '</span><span class="bar"><span class="progress" style="animation-duration: 5000ms;"></span></span></span>';
            }
        },
        navigation: {
            nextEl: '.slider1-next',
            prevEl: '.slider1-prev'
        }
    });
    /* Hero/Main Slider Two (Swiper) */
    var sliderTwoActive = new Swiper('.slider2-active', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        },
        navigation: {
            nextEl: '.slider2-next',
            prevEl: '.slider2-prev'
        }
    });
    /* Hero/Main Slider Three (Swiper) */
    var sliderThreeActive = new Swiper('.slider3-active', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        },
        pagination: {
            el: '.slider3-pagination',
            renderBullet: function (index, className) {
                return '<span class="' + className + '">0' + (index + 1) + '</span>';
            }
        },
        navigation: {
            nextEl: '.slider3-next',
            prevEl: '.slider3-prev'
        }
    });
    /* Hero/Main Slider Four (Swiper) */
    var sliderFourActive = new Swiper('.slider4-active', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        },
        pagination: {
            el: '.slider4-pagination',
            renderBullet: function (index, className) {
                return '<span class="' + className + '">0' + (index + 1) + '</span>';
            }
        },
        navigation: {
            nextEl: '.slider4-next',
            prevEl: '.slider4-prev'
        }
    });
    /* About Testimonial Slider (Swiper) */
    var aboutTestimonialSlider = new Swiper('.about-testimonial-active', {
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false
        },
        pagination: {
            el: '.about-testimonial-pagination',
            clickable: true
        },
        navigation: {
            nextEl: '.about-testimonial-next',
            prevEl: '.about-testimonial-prev',
        }
    });
    /* Testimonial Slider (Swiper) */
    var testimonialSlider = new Swiper('.testimonial-slider', {
        loop: true,
        spaceBetween: 30,
        slidesPerView: 1,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        },
        navigation: {
            nextEl: '.testimonial-next',
            prevEl: '.testimonial-prev',
        }
    });
    /* Testimonial 4 (Swiper) */
    var testimonial4ThumbSlider = new Swiper('.testimonial4-thumb-slider', {
        loop: true,
        spaceBetween: 30,
        centeredSlides: true,
        slidesPerView: 3,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        }
    });
    var testimonial4Slider = new Swiper('.testimonial4-slider', {
        loop: true,
        spaceBetween: 100,
        slidesPerView: 1,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        },
        navigation: {
            nextEl: '.testimonial4-next',
            prevEl: '.testimonial4-prev',
        },
        thumbs: {
            swiper: testimonial4ThumbSlider
        }
    });
    /* Client Slider (Swiper) */
    var clientSlider = new Swiper('.client-slider', {
        loop: true,
        spaceBetween: 30,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        },
        breakpoints: {
            0: {
                slidesPerView: 2,
            },
            768: {
                slidesPerView: 3,
            },
            992: {
                slidesPerView: 4,
            },
            1200: {
                slidesPerView: 4,
            },
        }
    });
    /* Product Slider (Swiper) */
    var productSlider = new Swiper('.product-slider', {
        loop: true,
        spaceBetween: 30,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        },
        breakpoints: {
            0: {
                slidesPerView: 2,
            },
            768: {
                slidesPerView: 3,
            },
            992: {
                slidesPerView: 4,
            },
            1200: {
                slidesPerView: 4,
            },
        }
    });

    /* Gallery Thumbnail Slider (Slick) */
    $('.gallery-thumb-slider').on('init', function (event, slick) {
        SVGInject($('.svg-inject'));
    }).slick({
        infinite: true,
        focusOnSelect: true,
        arrows: false,
        slidesToShow: 4,
        asNavFor: '.gallery-slider',
        nextArrow: '<button class="slick-next"><img class="svg-inject" src="assets/images/icons/chevron-right.svg" alt="Next Slide"></button>',
        prevArrow: '<button class="slick-prev"><img class="svg-inject" src="assets/images/icons/chevron-left.svg" alt="Prev Slide"></button>'
    });
    /* Gallery Slider (Slick) */
    $('.gallery-slider').slick({
        infinite: true,
        fade: true,
        arrows: false,
        slidesToShow: 1,
        asNavFor: '.gallery-thumb-slider'
    });
    /* Gallery3 Slider (Slick) */
    $('.gallery3-slider').on('init', function (event, slick) {
        SVGInject($('.svg-inject'));
    }).slick({
        infinite: true,
        slidesToShow: 3,
        nextArrow: '<button class="slick-next"><img class="svg-inject" src="assets/images/icons/chevron-right.svg" alt="Next Slide"></button>',
        prevArrow: '<button class="slick-prev"><img class="svg-inject" src="assets/images/icons/chevron-left.svg" alt="Prev Slide"></button>',
        responsive: [{
            breakpoint: 767,
            settings: {
                slidesToShow: 2
            }
        }, {
            breakpoint: 375,
            settings: {
                slidesToShow: 1
            }
        }]
    });
    /* Testimonial 2 Slider Thumb (Slick) */
    $('.testimonial2-thumb-slider').on('init', function (event, slick) {
        SVGInject($('.svg-inject'));
    }).slick({
        infinite: true,
        centerMode: true,
        centerPadding: 0,
        focusOnSelect: true,
        slidesToShow: 3,
        asNavFor: '.testimonial2-slider',
        nextArrow: '<button class="slick-next"><img class="svg-inject" src="assets/images/icons/long-arrow-right-2.svg" alt="Next Slide"></button>',
        prevArrow: '<button class="slick-prev"><img class="svg-inject" src="assets/images/icons/long-arrow-left-2.svg" alt="Prev Slide"></button>',
        responsive: [{
            breakpoint: 480,
            settings: {
                arrows: false
            }
        }]
    });
    /* Testimonial 2 Slider (Slick) */
    $('.testimonial2-slider').slick({
        infinite: true,
        arrows: false,
        slidesToShow: 1,
        asNavFor: '.testimonial2-thumb-slider'
    });
    /* Testimonial 3 Slider (Slick) */
    $('.testimonial3-slider').slick({
        infinite: true,
        arrows: false,
        slidesToShow: 1
    });
    /* Testimonial 3 Slider (Slick) */
    $('.about-image-slider').slick({
        infinite: true,
        slidesToShow: 1,
        nextArrow: '<button class="slick-next"><img class="svg-inject" src="assets/images/icons/long-arrow-right-2.svg" alt="Next Slide"></button>',
        prevArrow: '<button class="slick-prev"><img class="svg-inject" src="assets/images/icons/long-arrow-left-2.svg" alt="Prev Slide"></button>',
    });


    /*--
        Other PLugins Activations
    -----------------------------------*/

    /* Isotop */
    $('.gallery-grid-filter').on('click', 'button', function () {
        var filterValue = $(this).attr('data-filter');
        $('.gallery-grid').isotope({
            filter: filterValue
        });
        $(this).addClass('active').siblings().removeClass('active');
    });
    $('.gallery-grid').imagesLoaded(function () {
        $('.gallery-grid').isotope({
            itemSelector: '.grid-item',
            percentPosition: true,
            masonry: {
                columnWidth: '.grid-sizer'
            }
        });
    });

    /* Select2 Activation */
    $('.select2').each(function () {
        var $this = $(this),
            $search = $this.data('s2-search') === 'hide' ? -1 : 0;
        $this.select2({
            width: '100%',
            minimumResultsForSearch: $search
        });
        $this.on('select2:open', function (e) {
            var $el = $('.select2-results__options');
            $el.each(function () {
                const ps = new PerfectScrollbar($(this)[0]);
            });
        });
    });

    /* Magnific Popup Activation */
    $('.mfp-gallery').each(function () {
        $(this).magnificPopup({
            delegate: 'a',
            type: 'image',
            tLoading: 'Loading image #%curr%...',
            mainClass: 'mfp-img-mobile',
            gallery: {
                enabled: true,
                navigateByImgClick: true,
                preload: [0, 1]
            }
        });

    });
    $('.mfp-image').magnificPopup({
        type: 'image',
        gallery: {
            enabled: true,
            navigateByImgClick: true,
            preload: [0, 1]
        }
    });
    $('.mfp-video').magnificPopup({
        type: 'iframe',
        gallery: {
            enabled: true,
            navigateByImgClick: true,
            preload: [0, 1]
        }
    });

    /* Counter UP Activation */
    $('.counter').counterUp({
        time: 2000
    });

    /* SVGInject */
    SVGInject($('.svg-inject'));

    /* Instagram Feed & Slider */
    var $instagramCarousel = function () {
        new Swiper('.instagram-carousel', {
            loop: true,
            slidesPerView: 4,
            spaceBetween: 0,
            navigation: {
                nextEl: '.instagram-carousel-next',
                prevEl: '.instagram-carousel-prev',
            },
            breakpoints: {
                // when window width is >= 320px
                300: {
                    slidesPerView: 1
                },
                480: {
                    slidesPerView: 2
                },
                768: {
                    slidesPerView: 3
                },
                1200: {
                    slidesPerView: 4
                }
            }
        });
    }
    $('.instagram-feed').each(function () {
        var $this = $(this),
            $id = $this.attr('id'),
            $feed = new Instafeed({
                get: 'user',
                userId: 28747380809,
                accessToken: '28747380809.1677ed0.3eb7aaafba5a4a389c1bb343dbb0897f',
                target: $id,
                resolution: 'low_resolution',
                limit: 12,
                template: '<div class="swiper-slide instagram-item"><a href="{{link}}" target="_new"><img src="{{image}}" /></a></div>',
                after: function () {
                    $instagramCarousel();
                }
            });
        $feed.run();
    });

    /* Ajax Chimp Activation */
    $('#mc-form').ajaxChimp({
        language: 'en',
        callback: mailChimpResponse,
        // ADD YOUR MAILCHIMP URL BELOW HERE!
        url: 'https://gmail.us4.list-manage.com/subscribe/post?u=c9cf6ae9b0f1fd0e6581a492f&amp;id=9538c6421c'

    });

    function mailChimpResponse(resp) {
        if (resp.result === 'success') {
            $('.mailchimp-msg-success').addClass('show').html('' + resp.msg).fadeIn(500);
            $('.mailchimp-msg-error').removeClass('show').fadeOut(400);
            setTimeout(function () {
                $('.mailchimp-msg-success').removeClass('show');
            }, 5000);
        } else if (resp.result === 'error') {
            $('.mailchimp-msg-error').addClass('show').html('' + resp.msg).fadeIn(500);
            setTimeout(function () {
                $('.mailchimp-msg-error').removeClass('show');
            }, 5000);
        }
    }

    /* Sticky Sidebar(About Toolbar) */
    $('.stickySidebar').stickySidebar({
        topSpacing: 30,
        bottomSpacing: 30,
        containerSelector: '.stickySidebar-container',
        innerWrapperSelector: '.stickySidebar-inner'
    });

    /* Countdown Timer */
    $('[data-countdown]').each(function () {
        var $this = $(this),
            finalDate = $(this).data('countdown');
        $this.countdown(finalDate, function (event) {
            $this.html(event.strftime('<div class="item"><h2 class="timer">%D</h2><span class="name">Days</span></div><div class="item"><h2 class="timer">%H</h2><span class="name">Hours</span></div><div class="item"><h2 class="timer">%M</h2><span class="name">Min</span></div><div class="item"><h2 class="timer">%S</h2><span class="name">Sec</span></div>'));
        });
    });
    /* EasyPieChart */
    $('.chart').easyPieChart({
        barColor: '#818181',
        trackColor: false,
        scaleColor: false,
        size: 72,
        lineWidth: 3
    });

    /*--
        Custom Script Functions
    -----------------------------------*/

    /* About Toolbar Open */
    $('.about-toolbar').on('click', 'a', function (e) {
        e.preventDefault();
        var $this = $(this),
            $target = $this.attr('href');
        $($target).addClass('open').parent().addClass('open');
    });
    /* About Toolbar Close */
    $('.about-toolbar-popup').on('click', '.popup-close', function (e) {
        e.preventDefault();
        var $this = $(this),
            $target = $this.data('target');
        $($target).removeClass('open').parent().removeClass('open');
    });

    /* Scroll To Top */
    $body.append('<a id="scrolltotop" href="#top"><i class="la la-arrow-up"></i></a>');
    $window.on('scroll', function () {
        if ($window.scrollTop() >= 300) {
            $('#scrolltotop').addClass('show');
        } else {
            $('#scrolltotop').removeClass('show');
        }
    });
    $body.on('click', '#scrolltotop', function (e) {
        e.preventDefault();
        $("html, body").animate({
            scrollTop: 0
        }, 'slow');
    });

    /* Skill Bar Animation */
    var waypoint = new Waypoint({
        element: document.querySelectorAll('.progress'),
        handler: function (direction) {
            $('.progress-bar').each(function () {
                var $this = $(this),
                    $width = $this.data('width');
                $this.css({
                    'width': $width + '%',
                    "opacity": 1
                })
            });
        },
        offset: '50%'
    });

    /* Bootstrap Accordion */
    $('.accordion').on('show.bs.collapse', function (e) {
        $(e.target).parent('.card').addClass('active').siblings().removeClass('active');
    })

    /* Product Qunatity */
    $('.quantity').on('click', 'button', function () {
        var $this = $(this),
            $oldValue = $this.parent().find('input').val();
        if ($this.hasClass('inc')) {
            var $newVal = parseFloat($oldValue) + 1;
        } else {
            if ($oldValue > 1) {
                var $newVal = parseFloat($oldValue) - 1;
            } else {
                $newVal = 1;
            }
        }
        $this.parent().find('input').val($newVal);
    });


})(jQuery);
