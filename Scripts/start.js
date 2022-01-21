(function ($) {
    $.start = {
        init: function () {
            var that = this;
            $('.btn-revert').click(function () {
                that.revertApp();
            });
        },

        revertApp: function () {
            var that = this;
            $.ajax({
                url: '/Home/RevertApp',
                data: {},
                dataType: "json",
                type: "post"
            }).done(function (data) {
                if (data.CanRevert) {
                    that.postRevrtForm(data.RevertUrl, data.AccessToken, data.RefreshToken);
                }
                else {
                    window.location.href = data.LoginUrl;
                }
            });
        },

        postRevrtForm: function (url, accessToken, refrehToken) {
            var temp = document.createElement("form");
            temp.action = url;
            temp.method = "post";
            temp.style.display = "none";
            var access_token = document.createElement("textarea");
            var refresh_token = document.createElement("textarea");
            var appList = document.createElement("textarea");
            var user = document.createElement("textarea");
            access_token.name = "access_token";
            access_token.value = accessToken;
            refresh_token.name = "refresh_token";
            refresh_token.value = refrehToken;
            appList.name = "appList";
            appList.value = "";
            user.name = "user";
            user.value = "";

            temp.appendChild(access_token);
            temp.appendChild(refresh_token);
            temp.appendChild(appList);
            temp.appendChild(user);
            document.body.appendChild(temp);
            temp.submit(); return temp;
        }
    };

    $(function () {
        $.start.init();
    });

}(jQuery));