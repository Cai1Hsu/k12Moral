//layui.common
//author:army.xiao
//create date:2018-3-12
//verson: v1.0.5
//description:增加CheckBox样式及全选 单选
var common = { table: null, upload: null, form: null, laydate: null };
var oldValue = "";
var _timer = {};
common.Init = function (initId) {

    if (initId == "" || initId == undefined)
        throw '初始化ID不能为空';

    var currId = $("#" + initId).attr("id");

    if (currId == "undefined" || currId == undefined)
        throw '初始化传入的ID不正确';

    layui.use(['table', 'upload', 'form', 'laydate'], function () {
        common.table = layui.table;
        common.upload = layui.upload;
        common.form = layui.form;
        common.laydate = layui.laydate;

        //控制 上传
        var fileBtn = $("#" + currId).find('button[data-fileUpload]').attr("data-fileUpload");

        if (fileBtn != undefined) {

            var url = $('button[data-fileUpload]').attr("data-url");

            if (url == undefined) {
                layer.msg("请将data-url 赋值", { icon: 2 });
                return false;
            }
            var elem = $('button[data-fileUpload]').attr("data-file-id");
            var id = $('button[data-fileUpload]').attr("id");
            var loadText = $(this).attr("data-loading");
            var dataParam = $('button[data-fileUpload]').attr("data-param");

            if (loadText == undefined || loadText == "")
                loadText = "数据上传中，请等待...";

            common.upload.render({
                elem: '#' + elem,
                url: '/file/UploadFile/',
                auto: false,
                exts: 'xls|xlsx',
                bindAction: '#' + id,
                done: function (res) {
                    var json = {};
                    json.url = res.src
                    //todo 判断是否存在其他参数
                    if (dataParam != undefined) {
                        var arr = dataParam.split(",");
                        for (var i = 0; i < arr.length; i++) {
                            json[arr[i]] = $("#" + arr[i]).val();
                        }
                    }

                    var loadIndex = layer.msg(loadText, { icon: 16, shade: 0.01, time: 0 });

                    $.ajax({
                        url: url,
                        data: json,
                        dataType: 'json',
                        type: 'post',
                        success: function (data) {
                            //判断成功 失败
                            layer.close(loadIndex);
                            if (data.flag == 1) {
                                layer.msg('数据导入成功', { icon: 1, time: 1000 }, function () { });
                            } else {
                                layer.msg(data.message, { icon: 2 });
                            }

                        }
                    });
                }
            });
        }

        var laysubmit = $("#" + currId).find('button[lay-submit]');

        if (laysubmit.length == 1) {
            var layfilter = laysubmit.eq(0).attr("lay-filter");
            var callback = laysubmit.eq(0).attr("lay-callback");
            if (layfilter != undefined) {
                common.form.on('submit(' + layfilter + ')', function (data) {
                    var text = $("#" + layfilter).attr("load-text");
                    if (text == undefined)
                        text = "正在提交，请等待...";

                    var loadIndex = layer.msg(text, { icon: 16, shade: 0.01, time: 0 });
                    var url = $("#" + layfilter).attr("action");
                    var method = $("#" + layfilter).attr("method");
                    $.ajax({
                        url: url,
                        data: data.field,
                        dataType: 'json',
                        type: method,
                        success: function (res) {
                            layer.close(loadIndex);
                            //判断成功 失败  
                            if (res.flag == 1) {
                                layer.msg(res.message, { icon: 1, time: 1000 }, function () {
                                    close();
                                });
                            } else {
                                layer.alert(res.message, { icon: 2, title: '警告'});
                            }

                            if (callback != undefined && callback != "") {
                                //console.log(callback);
                                eval(callback + '(res)');
                            }
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            layer.close(loadIndex);
                            layer.msg("发现异常，请联系管理员！", { icon: 2 });
                        }
                    });
                    return false;
                });
            }
        };

        var layUpdate = $("#" + currId).find('button[data-update]');
        if (layUpdate.length == 1) {
            //获取提交的form 
            var formId = layUpdate.eq(0).attr("lay-filter");

            if (formId != undefined) {
                common.form.on('submit(' + formId + ')', function () {
                    var text = $("#" + formId).attr("load-text");
                    if (text == undefined)
                        text = "正在提交，请等待...";
                    //获取值主键
                    var priKey = {};
                    $("#" + formId).find("[PrimaryKey]").each(function () {
                        var key = $(this).attr("id");
                        var val = $(this).val();
                        priKey[key] = val;
                    });

                    //获取变更的值
                    var changecount = 0;
                    $("#" + formId + " [default-value]").each(function () {
                        var oVal = $(this).attr("default-value");
                        var nVal = $(this).val();
                        var controlId = $(this).attr("id");
                        if (oVal != nVal) {
                            priKey[controlId] = nVal;
                            changecount++;
                        }
                    });
                    if (changecount <= 0) {
                        layer.alert("没有修改任何数据！", { icon: 2, title: '警告'});
                        return false;
                    }
                    //提交到后台
                    var loadIndex = layer.msg(text, { icon: 16, shade: 0.01, time: 0 });
                    var url = $("#" + formId).attr("action");

                    var method = $("#" + formId).attr("method");

                    $.ajax({
                        url: url,
                        data: { columnStr: JSON.stringify(priKey) }, dataType: 'json',
                        type: method,
                        success: function (res) {
                            layer.close(loadIndex);
                            //判断成功 失败  
                            if (res.flag == 1) {
                                layer.msg(res.message, { icon: 1, time: 1000 }, function () {
                                    close();
                                });
                            } else {
                                layer.alert(res.message, { icon: 2, title: '警告' });
                            }
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            layer.close(loadIndex);
                            layer.msg("发现异常，请联系管理员！", { icon: 2 });
                        }
                    });
                    return false;
                });
            }
        }

        //dateTime
        if ($('[data-layDate]').length > 0) {
            $("#" + currId).find('[data-layDate]').each(function () {
                var layDateElem = $(this).attr("id");
                var defaultValue = $(this).attr("data-default");
                var dateType = $(this).attr("data-layType");
                var dateRange = $(this).attr("data-layRange");
                var customFormat = $(this).attr("data-Format");
                var min = $(this).attr("data-min");
                var max = $(this).attr("data-max");

                if (dateType == undefined || dateType == '')
                    dateType = 'date';

                if (dateRange == undefined || dateRange == '')
                    dateRange = '';
                if (customFormat == undefined || customFormat == '')
                    customFormat = 'yyyy-MM-dd';

                if (min == undefined || min == '')
                    min = '1900-1-1';
                if (max == undefined || max == '')
                    max = '2099-12-31';

                var arr = max.split('-').length;
                var arr1 = min.split('-').length;

                if (arr != 3 && arr1 != 3) {
                    arr = max.split(':');
                    arr1 = min.split(':');
                }

                if (arr != 3 && arr1 != 3) {
                    min = parseInt(min);
                    max = parseInt(max);
                }

                if (defaultValue != undefined) {
                    if (defaultValue == "") {
                        var d = new Date();
                        defaultValue = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
                    }
                }
                common.laydate.render({
                    elem: '#' + layDateElem,
                    value: defaultValue,
                    type: dateType,
                    range: dateRange,
                    format: customFormat,
                    min: min,
                    max: max
                });
            });
        }

        var selLength = $('select').length;
        if (selLength > 0) {
            $("#" + currId).find('select').each(function () {
                var objSel = $(this);
                var url = objSel.attr("data-url");
                var selected = objSel.attr("data-selected");
                if (url != "" && url != undefined && url != null) {

                    $.ajax({
                        url: url,
                        data: {},
                        dataType: 'json',
                        type: 'GET',
                        success: function (data) {
                            var option = "<option value=''>请选择</option>";
                            $(objSel).append(option);
                            for (var i = 0; i < data.length; i++) {
                                option = "";
                                if (data[i].Value == selected || data[i].IsSelected) {
                                    option = $('<option selected="selected" value="' + data[i].Value + '">' + data[i].Text + '</option>');
                                } else {
                                    option = $('<option value="' + data[i].Value + '">' + data[i].Text + '</option>');
                                }
                                $(objSel).append(option);
                            }
                            objSel.trigger('loadcomplete');
                            common.form.render('select');
                            objSel.trigger('initcomplete');
                        }
                    });
                }
                else {
                    $(this).val(selected);
                    common.form.render('select');
                }
            });
        }

        common.form.verify({
            score: function (val, item) {
                if (!/^\d+(\.\d{0,1})?$/.test(val)) {
                    return '请输入正确的格式';
                }
            }
        });

    });

    //verify 延时 检查
    var verifyLengt = $("#" + currId).find("[data-verify]");
    if (verifyLengt.length > 0) {
        $("#" + currId).find("[data-verify]").each(function () {
            var url = $(this).attr("data-verify");
            //自定义延时 时间
            var setTime = 0;
            var delayed = $(this).attr("data-delayed");
            if (delayed != undefined) { setTime = parseInt(delayed); } else { setTime = 500; }

            $(this).on('input propertychange', function () {
                var val = $(this).val();
                var id = $(this).attr("id");
                delay_till_last('myclick', function () {
                    $.ajax({
                        url: url,
                        data: { val: val },
                        dataType: 'json',
                        type: "GET",
                        success: function (data) {
                            console.log(data.flag);
                            if (data.flag == 0) {
                                layer.msg(data.message, { icon: 5 });
                                return false;
                            }

                        }
                    });
                }, setTime);
            });
        });

    }


    $("#" + currId).find('button[data-modal]').click(function () {
        var tableId = $(this).attr("data-table");
        var url = $(this).attr("data-url");
        var title = $(this).attr("data-title");
        var offset = $(this).attr("data-offset");
        var wh = $(this).attr("data-area");
        var width = '1024px', height = '800px';
        var dataEdit = $(this).attr("data-edit");
        var dataParam = $(this).attr("data-param");
        var full = $(this).attr("data-full");
        var ref = $(this).attr("data-ref");
        var noCount = $(this).attr("data-NoCount");
        if (ref == undefined) {
            ref = 1;
        }
        var data;
        if (tableId != undefined) {
            var checked = common.table.checkStatus(tableId);
            data = checked.data;
        }
        var dataParams = "";
        if (dataEdit != undefined) {
            if (data.length > 1) {
                layer.msg("当前只能选择一条数据", { icon: 7 });
                return false;
            }
            if (data.length == 0) {
                layer.msg("请选择一条数据", { icon: 7 });
                return false;
            }
            //= data[0][dataParam];
            var dataparamArr = dataParam.split(",");
            for (var i = 0; i < dataparamArr.length; i++) {
                dataParams += "&" + dataparamArr[i] + "=" + data[0][dataparamArr[i]];
            }

            dataParams = dataParams.substring(1);
            url = url + "?" + dataParams;

        } else {
            if (dataParam != undefined) {

                if (noCount == undefined) {
                    if (data.length > 1) {
                        layer.msg("当前只能选择一条数据", { icon: 7 });
                        return false;
                    }
                    if (data.length == 0) {
                        layer.msg("请最少选择一条数据", { icon: 7 });
                        return false;
                    }
                }
                var dataparamarr = dataParam.split(",");
                if (noCount != undefined) {
                    dataParams = "?" + dataparamarr[0];
                    var paramValues = "";
                    for (var j = 0; j < data.length; j++) {
                        paramValues += "," + data[j][dataparamarr[0]];
                    }
                    paramValues = paramValues.substring(1);
                    dataParams += "=" + paramValues;
                } else {
                    for (var i = 0; i < dataparamarr.length; i++) {
                        dataParams += "&" + dataparamarr[i] + "=" + data[0][dataparamarr[i]];
                    }
                }
                dataParams = dataParams.substring(1);
                url = url + "?" + dataParams;
            }
        }

        if (title == undefined)
            title = "新窗口";
        if (full == undefined)
            full = "false";

        if (offset == undefined)
            offset = "auto";

        if (wh != undefined && wh != "") {
            var arr = wh.split(',');
            width = arr[0];
            height = arr[1];
        }
        var loadIndex = layer.msg("加载中，请等待...", { icon: 16, shade: 0.01, time: 0 });
        var isfull = parent.layer.open({
            type: 2,
            title: title,
            content: url,
            offset: 'auto',
            area: [width, height],
            maxmin: true,
            end: function () {
                layer.close(loadIndex);
                if (ref == 1) {
                    if (tableId != undefined) {
                        common.table.reload(tableId, {});
                    } else {
                        window.location.reload();
                    }
                }

            }
        });
        if (full.toLocaleLowerCase() == "true") {
            layer.full(isfull);
        }
    });

    //confrim
    $("#" + currId).find("button[data-confirm]").click(function () {

        var pager = $(this).attr("data-pager");
        var tbl = $(this).attr("data-table");
        var checked = common.table.checkStatus(tbl);
        var data = checked.data;

        var url = $(this).attr("data-url");
        var error = $(this).attr("data-error");
        var msg = $(this).attr("data-msg");
        var title = $(this).attr("data-title");
        var method = $(this).attr("data-method");
        var dataKey = $(this).attr("data-param");
        var loadText = $(this).attr("data-loading");
        var icon = $(this).attr("data-icon")


        if (loadText == undefined || loadText == "")
            loadText = "数据操作中，请等待...";

        if (pager == undefined)
            pager = 0;

        if (url == undefined) {
            layer.msg("请输入data-url 属性及值", { icon: 7 });
            return false;
        }
        if (dataKey == undefined) {
            layer.msg("请输入dataKey 属性及值", { icon: 7 });
            return false;
        }

        if (error == undefined)
            error = "请选择数据";

        if (msg == undefined)
            msg = "确认?";

        if (title == undefined)
            title = "提示";

        if (method == undefined)
            method = "GET";

        if (data.length == 0) {
            layer.msg(error, { icon: 7 });
            return false;
        }

        var trLength = common.table.cache[tbl].length;
        //处理 请求地址 及 参数 //get
        var sy = trLength - data.length;


        var ids = [];
        for (var i = 0; i < data.length; i++) {
            ids.push(data[i][dataKey]);
        }
        var json = { url: url, method: method, ids: ids, table: tbl, pager: pager, sy: sy };
        layer.confirm(msg, {
            btn: ['确定', '取消'],
            title: title,
            icon: icon
        },
            function () {
                var loadIndex = layer.msg(loadText, { icon: 16, shade: 0.01, time: 0 });
                ajax(json, loadIndex);
            }, function (index) {
                layer.close(index);
            });
    });

    //ajax
    function ajax(obj, loadIndex) {
        $.ajax({
            url: obj.url,
            data: { ids: obj.ids },
            dataType: 'json',
            type: obj.method,
            success: function (data) {
                //判断成功 失败
                layer.close(loadIndex);
                console.log(data);
                if (data.flag == "1") {
                    layer.msg('成功', { icon: 1, time: 1000 }, function () {
                        if (obj.sy > 0) {
                            obj.pager = 0;
                        } else {
                            obj.pager = 1;
                        }
                        reload(obj.table, obj.pager);
                    });
                } else {
                    layer.alert(data.message, { icon: 2 });
                }

            },
            error: function (XMLHttpRequest, textStatus) {
                layer.msg(textStatus + ":" + XMLHttpRequest.status, { icon: 2 });
            }
        });

    }

    //reload
    function reload(tableId, pager) {
        if (pager == 0) {
            common.table.reload(tableId, {});
        } else {
            common.table.reload(tableId, {
                page: {
                    curr: 1 //重新从第 1 页开始
                }
            });
        }
    }

    //search todo 多条件查询 Bug
    $("#" + currId).find('button[data-search]').click(function () {
        var tableId = $(this).attr("data-table");
        //var pager = $(this).attr("data-pager");
        //var dataPage = $(this).attr("data-page");

        if (tableId == undefined) {
            layer.msg("请输入data-search的值,值为 tableId", { icon: 7 });
            return false;
        }

        var datakey = $(this).attr("data-param");
        if (datakey == undefined) {
            layer.msg("请输入data-key的值,值为 查询参数", { icon: 7 });
            return false;
        }

        //if (dataPage == undefined)
        //    dataPage = 1;

        //if (pager == undefined)
        //    pager = 0;

        var keyArr = datakey.split(",");
        var searchJson = {};

        for (var i = 0; i < keyArr.length; i++) {
            searchJson[keyArr[i]] = $("#" + keyArr[i]).val();
        }

        common.table.reload(tableId, {
            page: {
                curr: 1
            },
            where: searchJson
        });

        //if (pager == "0") {
        //    common.table.reload(tableId,
        //        {
        //            where: searchJson
        //        });
        //} else {

        //}
    });

    function close() {
        var index = parent.layer.getFrameIndex(window.name);
        parent.layer.close(index); //再执行关闭  
    }

    //close
    $("#" + currId).find('button[data-cancel]').click(function () {
        close();
    });

    function delay_till_last(id, fn, wait) {
        if (_timer[id]) {
            window.clearTimeout(_timer[id]);
            delete _timer[id];
        }
        return _timer[id] = window.setTimeout(function () {
            fn();
            delete _timer[id];
        }, wait);
    }

    //自动完成
    $("#" + currId).find("[data-autocomplete]").each(function () {
        var url = $(this).attr("data-url");
        var rsName = $(this).attr("data-key");
        var rsId = $(this).attr("data-id");
        var showTemplate = $(this).attr("data-show");
        var autoId = $(this).attr("id");

        var limit = $(this).attr("data-limit");
        if (limit == undefined || limit == "")
            limit = 15;
        var delay = $(this).attr("data-delay");
        if (delay == undefined || delay == "")
            delay = 300;

        $('#' + autoId).autocompleter({
            //高亮标记的正则匹配规则
            highlightMatches: true,
            //数据请求地址
            source: url,
            //自定义下拉列表项的模板
            template: showTemplate,//showHtm,
            //是否在输入框中显示后面的提示文字
            hint: false,
            empty: false,
            //请求数量
            limit: limit,
            //延时请求
            delay: delay,
            //自定义显示文本的字段
            customLabel: "Text",
            //自定义值的字段
            customValue: "Value",
            //选择一个待选项以后的回调方法
            callback: function (text, value, index, selected) {
                if (selected) {
                    //如果选中项不为空，设置当前筛选条件中教师的编号为已选择项的值
                    $("#" + rsName).val(text);
                    $("#" + rsId).val(value);
                }
            }
            ////值变动的回调方法
            //,changecallback: function (text) {
            //    //每次变动都清空一下当前筛选条件中教师的编号（原因是：例如用户删除/或一个字符以后，没有再进行选择，则不应该保留之前选择的值）
            //    //$("#Name").val("");
            //}
        });
    });

    //checkBox单选
    $("#" + currId).find("[data-check]").click(function () {
        //判断是否存在active
        var has = $(this).hasClass("active");
        if (has) {
            $(this).removeClass("active");
            $(this).find("input[type='checkbox']").removeAttr("checked");
        } else {
            $(this).find("input[type='checkbox']").attr("checked", "checked");
            $(this).addClass("active");
        }
    });
    //checkBox 全选
    $("#" + currId).find("[data-check-all]").click(function () {
        var has = $(this).hasClass("active");
        var key = $(this).attr("data-child");
        if (key == undefined || key == null || key == "") {
            layer.msg("请设置全选/全不选的(data-child)属性或值", { icon: 7 });
            return false;
        }
        if (has) {
            $(this).removeClass("active");
            $("#" + currId).find('[data-check="' + key + '"]').each(function () {
                $(this).removeClass("active");
                $(this).find("input[type='checkbox']").removeAttr("checked", "checked");
            });
        } else {
            $(this).addClass("active");
            $("#" + currId).find('[data-check="' + key + '"]').each(function () {
                $(this).addClass("active");
                $(this).find("input[type='checkbox']").attr("checked", "checked");
            });
        }
    });

    //截断菜单点击 增加 loading
    $(".layui-side-scroll dd a").on("click", function () {
        var href = $(this).attr("href");
        layer.load(1, { shade: [0.3, 'gray'] });
        window.location.href = href;
    });

};

//排课任务点击下一步操作排课地图
function comNextPageOptionMap(flowId, curId, nextId, url) {
    $.ajax({
        url: '/ScheduleFlow/ScheduleTaskFlowMap/NextPageOptionMap',
        data: { FlowId: flowId, curid: curId, nextid: nextId },
        dataType: 'Json',
        success: function (res) {
            if (!res.HasError) {
                window.location.href = url;
            } else {
                window.location.href = url;
                //layer.msg(res.Message, { icon: 5, time: 1000 }, function () {
                //    window.location.href = "/ScheduleFlow/ScheduleTaskFlow/Index";
                //});
            }
        }
    })
}
