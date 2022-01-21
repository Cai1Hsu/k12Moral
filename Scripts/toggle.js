$(function () {
    $.toggle = {
        init: function () {
            this.adjustPosition();
            this.bindEvents();
        },

        bindEvents: function () {
            var that = this;
            if (localStorage.getItem('ifHide') == 1) {
                $('.layui-side').css('width', 0);
                $('.toggleMenu').css('left', 0);
                $('.layui-body,.layui-footer').css('left', '12px');
                $('.toggleMenu .close').hide();
                $('.toggleMenu .open').show();
            }

            $('.toggleMenu').click(function () {
                var $button = $(this);

                if ($(this).find('span.close:visible').length > 0) {
                    $('.layui-side').animate({ width: 0 }, 500);
                    $('.toggleMenu').animate({ left: 0 }, 500);
                    $('.layui-body,.layui-footer').animate({ left: '12px' }, 500, function () {
                        $('.toggleMenu .close').hide();
                        $('.toggleMenu .open').show();
                        if ($button.hasClass('adjust-schoolwall')) {
                            $.schoolwall.adjustWidth();
                        }
                    });

                    localStorage.setItem('ifHide', 1);
                }
                else {
                    $('.layui-side').animate({ width: '200px' }, 500);
                    $('.toggleMenu').animate({ left: 203 }, 500);
                    $('.layui-body,.layui-footer').animate({ left: '210px' }, 500, function () {
                        $('.toggleMenu .close').show();
                        $('.toggleMenu .open').hide();
                        if ($button.hasClass('adjust-schoolwall')) {
                            $.schoolwall.adjustWidth();
                        }
                    });
                    localStorage.setItem('ifHide', 0);
                }
            });

            $(window).resize(function () {
                that.adjustPosition();
            });

            $('body').scroll(function () {
                that.adjustPosition();
            });
        },

        adjustPosition: function () {
            var top = $('.toggleMenu').height() * 0.4;
            $('.toggleMenu').find('i').css('top', top);
        }
    };

    $(function () {
        $.toggle.init();
    });
}(jQuery));