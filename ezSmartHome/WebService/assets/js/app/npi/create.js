define(['common', 'util', 'template', 'uploadify', 'ztree', 'plugins', 'bootstrap'], function ($, util, template) {
    var rootUrl = OP_CONFIG.rootUrl;

    $('#select-attachment').uploadify({
        swf: rootUrl + 'assets/js/lib/uploadify.swf',
        uploader: rootUrl + 'Common/UploadAttachment',
        fileSizeLimit: '100 MB',
        onSelect: function (file) {
            if (file.type == '.exe' || file.type == '.bat' || file.type == '.dll') {
                $.tips('限制类文件，请重新上传！', 0);
                return false;
            }

            var queue = $('#' + this.settings.queueID);
            var html = '<div id="#{fileId}" class="uploadify-queue-item">' +
                            '<span class="icon #{fileIcon}"></span>' +
                            '<span class="file-name" title="#{fileName}">#{fileName}</span>' +
                            '<div class="uploadify-progress">' +
                                '<div class="uploadify-progress-bar">&nbsp;</div>' +
                            '</div>' +
                            '<span class="data">Waiting</span>' +
                        '</div>';

            var fileData = {
                fileId: file.id,
                fileName: file.name,
                fileIcon: util.getFileIcon(file.name)
            }


            queue.append(util.parseTpl(html, fileData));
        },
        onUploadSuccess: function (file, res) {
            res = JSON.parse(res);

            if (res.state) {
                var data = res.data[0];
                var html = '<div id="#{fileId}" class="finish-queue-item" data-fileid="#{id}">' +
                                '<span class="icon #{fileIcon}"></span>' +
                                '<span class="file-name" title="#{fileName}">#{fileName}</span>' +
                                '<span class="file-size">#{fileSize}</span>' +
                                '<a class="file-operate file-del" href="#">删除</a>' +
                            '</div>';
                var fileData = {
                    id: data.Id,
                    fileId: file.id,
                    fileIcon: util.getFileIcon(file.name),
                    fileName: file.name,
                    fileSize: util.getFileSize(file.size)
                }

                $('#' + file.id).replaceWith(util.parseTpl(html, fileData));

                //删除
                $('#' + file.id).on('click', '.file-del', function () {
                    $('#' + file.id).remove();
                    return false;
                });
            } else {
                $.tips(res.msg);
            }
        },
        onUploadStart: function (file) {
            $("#select-attachment").uploadify("settings", "formData", { 'extra': 1 });
            //在onUploadStart事件中，也就是上传之前，把参数写好传递到后台。  
        }
    });

    
    function submit() {

        var data = {
            Main: {
                ZY: $('[id="qxzy"]').val(),
                QXMS:$('[id="qxms"]').val(),
                CPX: $('[id="cpx"]').val(),
                WPBM:$('[id="wpbm"]').val(),
                WPXH:$('[id="wpxh"]').val(),
                XMDM:$('[id="xmdm"]').val(),
                YJBB:$('[id="yjbb"]').val(),
                RJBB:$('[id="rjbb"]').val(),
                YXJ: $('[id="yxj"]').val()
               
            }
        }

        var reg = new RegExp('^<([^>\s]+)[^>]*>(.*?<\/\\1>)?$');
        if (reg.test(data.Main.ZY)) {
            $.tips('缺陷摘要含有无效输入！');
            return false;
        }

        if (data.Main.ZY == '') {
            $.tips('缺陷摘要不能都为空！');
            return false;
        }
        if (data.Main.ZY.length > 200) {
            $.tips('缺陷摘要不能超过200个字！');
            return false;
        }

        if (data.Main.QXMS == '') {
            $.tips('缺陷概述不能为空！');
            return false;
        }
        if (data.Main.QXMS.length > 800) {
            $.tips('缺陷概述不能超过800个字！');
            return false;
        }
        if (reg.test(data.Main.QXMS)) {
            $.tips('缺陷描述含有无效输入！');
            return false;
        }

        if (data.Main.WPXH == '') {
            $.tips('物品型号不能为空！');
            return false;
        }
        if (reg.test(data.Main.WPXH)) {
            $.tips('物品型号含有无效输入！');
            return false;
        }

        if (data.Main.CPX == '') {
            $.tips('产品线未填写！');
            return false;
        }
        if (reg.test(data.Main.CPX)) {
            $.tips('产品线含有无效输入！');
            return false;
        }
        if (data.Main.WPBM == '') {
            $.tips('物品编码不能为空！');
            return false;
        }
        if (reg.test(data.Main.WPBM)) {
            $.tips('物品编码含有无效输入！');
            return false;
        }

        if (reg.test(data.Main.XMDM)) {
            $.tips('项目代码含有无效输入！');
            return false;
        }

        //处理附件
        //data.MainAttachment = [];

        //$('#select-attachment-main-queue .finish-queue-item').each(function () {
        //    data.MainAttachment.push({
        //        FileName: $(this).data('filename'),
        //        FileAddress: $(this).data('filepath')
        //    });
        //});


        $.confirm('确定要提交审批吗？', function (result) {


            if (result) {
                $.tlayer('close');
                $.loading('提交中，请稍后...');
                $.post(rootUrl + 'NPI/Create', { dataJson: JSON.stringify(data) }, function (res) {
                    $.tlayer('close');
                    var panel = $('.panel-body');
                    if (res.state) {
                        //传附件
                        var attachments = [];

                        panel.find('.finish-queue-item').each(function () {
                            if ($(this).data('fileid')) {
                                attachments.push($(this).data('fileid'));
                            }
                        });

                        if (attachments.length > 0) {

                            $.post(rootUrl + 'NPI/SaveMainAttachment', {
                                instanceId: res.msg,
                                attachments: attachments.join()
                            }, function (res) {
                                if (res.state) {
                                    window.location.href = rootUrl + 'NPI/ApproveList';
                                } else {
                                    $.tips(res.msg, 100);
                                }
                            });
                        } else {
                            window.location.href = rootUrl + 'NPI/ApproveList';
                        }


                    } else {
                        $.tips(res.msg, 0);
                    }
                });
                

                
            }
        });
    }

    $('#submit-create').on('click', function () {
       
        submit();
        
    });

    //搜索项目
    function search() {
        
    }

    function setRevision(bm) {
        
        $("#yjbb").empty();
        $.ajax({
            type: "get",
            async: false,
            url: "http://webapi.maipu.com/Selector/Project/GetRevision?inventory_item_id=" + bm,
            dataType: "jsonp",
            jsonp: "callback",
            success: function (json) {
                $.each(json, function (n, value) {
                    var opt= '<option value="' + value.revision + '">'+value.revision+'</option>';
                    $('#yjbb').append(opt);
                });
            },
            error: function () {
                alert('未取得硬件版本号');
            }
        });


    }

    $('#wpbm').autoComplete({
        async: {
            url: rootUrl + 'common/SearchProductTree',
            dataType: 'jsonp',
            searchField: 'wpbm',
            dataField: null,
            minKeywordLength: 5
        },
        width: 400,
        template: '<td>#{cpBm}</td><td>#{cpName}</td><td>#{xsxhName}</td><td>#{cpxName}</td>',
        callback: function (data) {
            $('#cpx').val(data.cpxName).data('data', data);
            $('#wpbm').val(data.cpBm).data('data', data);
            $('#wpxh').val(data.cpName).data('data', data);

            setRevision($('#wpbm').val());
        }
    });

    $('#wpxh').autoComplete({
        async: {
            url: rootUrl + 'common/SearchProductTree',
            dataType: 'jsonp',
            searchField: 'wpxh',
            dataField: null,
            minKeywordLength: 5
        },
        width: 400,
        template: '<td>#{cpName}</td><td>#{cpBm}</td><td>#{xsxhName}</td>',
        callback: function (data) {
            $('#wpbm').val(data.cpBm).data('data', data);
            $('#wpxh').val(data.cpName).data('data', data);
            $('#cpx').val(data.cpxName).data('data', data);
            setRevision($('#wpbm').val());
        }
    });

    $('#xmdm').autoComplete({
        async: {
            url: 'http://webapi.maipu.com/Selector/Project/GetProjectCodes',
            dataType: 'jsonp',
            dataField: null
        },
        maxNum: 10,
        width:400,
        template: '<td>#{segment1}</td><td>#{description}</td>',
        callback: function (data) {
            $('#xmdm').val(data.description).data('data', data);

        }
    });

    $(document).ready(function () {
        $('[id="qxzy"]').focus()
    });
   
    //批量导入
    $('#BulkLoad').on('click', function () {
        var html = template('layer-BulkLoad', {});
        $.content({
            theme: 'blue',
            header: '批量导入',
            content: {
                html: html,
                width: 800
            },
            footer: [{
                text: '确定',
                style: 'primary',
                callback: function () {
                   
                    var count =  $('#countItem').val();
                    for (var i = 1; i <= count; i++) {

                        var data = {
                            Main: {
                                ZY: $('#batchQxzy').val(),
                                QXMS: $('#batchQXMS' + i).val(),
                                WPBM: $('#batchWpbm').val(),
                                XMDM: $('#batchXmdm').val(),
                                RJBB: $('#batchRjbb').val(),
                                YXJ: $('#batchYxj'+i).val(),
                                CPX: $('#batchCPX').val(),
                                WPXH: $('#batchWPXH').val()
                            }
                        }
                        if (data.Main.ZY == '') {
                            $.tips('缺陷摘要不能都为空！');
                            return false;
                        }

                        if (data.Main.QXMS == '') {
                            $.tips('缺陷概述不能为空！');
                            return false;
                        }

                        if (data.Main.WPBM == '') {
                            $.tips('物品编码不能为空！');
                            return false;
                        }
                        if (data.Main.RJBB == '') {
                            $.tips('软件版本不能为空！');
                            return false;
                        }
                    }
                    $.loading('提交中，请稍后...');
                    var listModel = [];
                    for (var i = 1; i <= count; i++) {
                        var panel = $('#itemPanel' + i);
                        var attachments = [];
                        var attachmentString = '';
                        panel.find('.finish-queue-item').each(function () {
                            if ($(this).data('fileid')) {
                                attachments.push($(this).data('fileid'));
                            }
                        });

                        if (attachments.length > 0) {
                            attachmentString= attachments.join();

                        }

                        var data = {
                            Main: {
                                ZY: $('#batchQxzy').val(),
                                QXMS: $('#batchQXMS' + i).val(),
                                WPBM: $('#batchWpbm').val(),
                                XMDM: $('#batchXmdm').val(),
                                RJBB: $('#batchRjbb').val(),
                                YXJ: $('#batchYxj' + i).val(),
                                CPX: $('#batchCPX').val(),
                                WPXH: $('#batchWPXH').val()
                            },
                            MainAttachment: attachmentString
                        };
                        listModel.push(data);
                        
                    }
                    $.post(rootUrl + 'NPI/BatchCreate', { dataJson: JSON.stringify(listModel) }, function (res) {


                        if (res.state) {
                            $.tips('批量发起成功！', 0);
                            window.location.href = rootUrl + 'NPI/ApproveList';


                        } else {
                            $.tips('批量发起错误！' + res.msg, 0);
                        }
                    });

                    
                }
            }, {
                text: '取消',
                callback: function () {
                    $.tlayer('close');
                    $('#countItem').val(2);
                }
            }],
            onInit: function () {
                $('#batchWpbm', this).autoComplete({
                    async: {
                        url: rootUrl + 'common/SearchProductTree',
                        dataType: 'jsonp',
                        searchField: 'wpbm',
                        dataField: null
                    },
                    width: 400,
                    template: '<td>#{cpBm}</td><td>#{cpName}</td><td>#{xsxhName}</td>',
                    callback: function (data) {
                        $('#batchWpbm').val(data.cpBm).data('data', data);
                        $('#batchCPX').val(data.cpxName).data('data', data);
                        $('#batchWPXH').val(data.cpName).data('data', data);
                    }
                });

                $('#batchXmdm', this).autoComplete({
                    async: {
                        url: 'http://webapi.maipu.com/Selector/Project/GetProjectCodes',
                        dataType: 'jsonp',
                        dataField: null
                    },
                    maxNum: 10,
                    width: 400,
                    template: '<td>#{segment1}</td><td>#{description}</td>',
                    callback: function (data) {
                        $('#batchXmdm').val(data.description).data('data', data);

                    }
                });

                $('#select-attachment1, #select-attachment2', this).uploadify({
                    swf: rootUrl + 'assets/js/lib/uploadify.swf',
                    uploader: rootUrl + 'Common/UploadAttachment',
                    fileSizeLimit: '100 MB',
                    onSelect: function (file) {
                        if (file.type == '.exe' || file.type == '.bat' || file.type == '.dll') {
                            $.tips('限制类文件，请重新上传！', 0);
                            return false;
                        }

                        var queue = $('#' + this.settings.queueID);
                        var html = '<div id="#{fileId}" class="uploadify-queue-item">' +
                                        '<span class="icon #{fileIcon}"></span>' +
                                        '<span class="file-name" title="#{fileName}">#{fileName}</span>' +
                                        '<div class="uploadify-progress">' +
                                            '<div class="uploadify-progress-bar">&nbsp;</div>' +
                                        '</div>' +
                                        '<span class="data">Waiting</span>' +
                                    '</div>';

                        var fileData = {
                            fileId: file.id,
                            fileName: file.name,
                            fileIcon: util.getFileIcon(file.name)
                        }


                        queue.append(util.parseTpl(html, fileData));
                    },
                    onUploadSuccess: function (file, res) {
                        res = JSON.parse(res);

                        if (res.state) {
                            var data = res.data[0];
                            var html = '<div id="#{fileId}" class="finish-queue-item" data-fileid="#{id}">' +
                                            '<span class="icon #{fileIcon}"></span>' +
                                            '<span class="file-name" title="#{fileName}">#{fileName}</span>' +
                                            '<span class="file-size">#{fileSize}</span>' +
                                            '<a class="file-operate file-del" href="#">删除</a>' +
                                        '</div>';
                            var fileData = {
                                id: data.Id,
                                fileId: file.id,
                                fileIcon: util.getFileIcon(file.name),
                                fileName: file.name,
                                fileSize: util.getFileSize(file.size)
                            }

                            $('#' + file.id).replaceWith(util.parseTpl(html, fileData));

                            //删除
                            $('#' + file.id).on('click', '.file-del', function () {
                                $('#' + file.id).remove();
                                return false;
                            });
                        } else {
                            $.tips(res.msg);
                        }
                    },
                    onUploadStart: function (file) {
                        $('#select-attachment1,#select-attachment2').uploadify("settings", "formData", { 'extra': 1 });
                        //在onUploadStart事件中，也就是上传之前，把参数写好传递到后台。  
                    }
                });
            }
        });
    });
    
    var i = 2;

    $(document).on('click', '#add-qxms', function () {
        i = i + 1;
        $('#countItem').val(i);
        var zjqxzy = template('layer-BulkLoadItem', { number: i });
        $('.item-BulkLoad').append(zjqxzy);

        $('#select-attachment' + i).uploadify({
            swf: rootUrl + 'assets/js/lib/uploadify.swf',
            uploader: rootUrl + 'Common/UploadAttachment',
            fileSizeLimit: '100 MB',
            onSelect: function (file) {
                if (file.type == '.exe' || file.type == '.bat' || file.type == '.dll') {
                    $.tips('限制类文件，请重新上传！', 0);
                    return false;
                }

                var queue = $('#' + this.settings.queueID);
                var html = '<div id="#{fileId}" class="uploadify-queue-item">' +
                                '<span class="icon #{fileIcon}"></span>' +
                                '<span class="file-name" title="#{fileName}">#{fileName}</span>' +
                                '<div class="uploadify-progress">' +
                                    '<div class="uploadify-progress-bar">&nbsp;</div>' +
                                '</div>' +
                                '<span class="data">Waiting</span>' +
                            '</div>';

                var fileData = {
                    fileId: file.id,
                    fileName: file.name,
                    fileIcon: util.getFileIcon(file.name)
                }


                queue.append(util.parseTpl(html, fileData));
            },
            onUploadSuccess: function (file, res) {
                res = JSON.parse(res);

                if (res.state) {
                    var data = res.data[0];
                    var html = '<div id="#{fileId}" class="finish-queue-item" data-fileid="#{id}">' +
                                    '<span class="icon #{fileIcon}"></span>' +
                                    '<span class="file-name" title="#{fileName}">#{fileName}</span>' +
                                    '<span class="file-size">#{fileSize}</span>' +
                                    '<a class="file-operate file-del" href="#">删除</a>' +
                                '</div>';
                    var fileData = {
                        id: data.Id,
                        fileId: file.id,
                        fileIcon: util.getFileIcon(file.name),
                        fileName: file.name,
                        fileSize: util.getFileSize(file.size)
                    }

                    $('#' + file.id).replaceWith(util.parseTpl(html, fileData));

                    //删除
                    $('#' + file.id).on('click', '.file-del', function () {
                        $('#' + file.id).remove();
                        return false;
                    });
                } else {
                    $.tips(res.msg);
                }
            },
            onUploadStart: function (file) {
                $('#select-attachment1,#select-attachment2').uploadify("settings", "formData", { 'extra': 1 });
                //在onUploadStart事件中，也就是上传之前，把参数写好传递到后台。  
            }
        });
    });
});