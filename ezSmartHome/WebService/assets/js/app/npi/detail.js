require(['common', 'util', 'template', 'plugins', 'uploadify', 'datepicker', 'bootstrap'], function ($, util, template) {
    var rootUrl = OP_CONFIG.rootUrl;
    var instanceId = $('[name="InstanceId"]').val();
    var npi_mainId = $('[name="NpiMainId"]').val();
    var operater = $('[name="operater"]').val();
    var operaterName = $('[name="operaterName"]').val();
    var stage = $('[name="stage"]').val();
    var sendMessageTemplete =
                         '<p style="margin-top:15px;">发表传阅意见：</p>' +
                         '<textarea  class="form-control"  id="textMessage" style="width: 100%;"></textarea>' +
                         '<p style="margin-top:15px;">发出传阅邀请：</p>' +
                         '<input type="text" class="form-control" readonly id="toZRR" style="width: 85%;float: left;">' +

                         '<span class="input-group-btn"> ' +
                             '<button class="btn btn-default selector-organiztion" data-type="multiPeople">' +
                                 '<span class="glyphicon glyphicon-search"></span>' +
                             '</button>' +
                             '<button class="btn btn-default selector-clear">' +
                                 '<span class="glyphicon glyphicon-minus"></span>' +
                             '</button>' +
                         '</span>' +
                         '<p style="margin-top:15px;">附件：</p>' + '<button class="btn btn-sm btn-primary" id="select-attachment">　附件　</button>' +
                            '<div class="finish-queue-item"></div>';
                                   
    var cycCommon = '<p style="margin-top:15px;">常用词：</p>' +
                    '<select class="form-control" name="cyc">' +
                         '<option value="0"></option>' +
                            '<option value="1">同意</option>' +
                            '<option value="2">原则同意</option>' +
                            '<option value="3">通过</option>' +
                             '<option value="4">不同意</option>' +
                             '<option value="5">不通过</option>' +
                     '</select>';

    
    //////////////////////
    //页面初始化
    //////////////////////
    //上传附件
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
                                '<a class="file-operate file-del" href="#" id="DelFile_#{id}">删除</a>' +
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
            $("#select-attachment").uploadify("settings", "formData", { 'extra': instanceId });
            //在onUploadStart事件中，也就是上传之前，把参数写好传递到后台。  
        }
    });

    //任意发起传阅
    $('#CirculatedMessage').on('click', function () {
        var html = template('layer-chuanyue', {});

        $.content({
            theme: 'blue',
            header: '传阅',
            content: {
                html: html
            },
            footer: [{
                text: '确定',
                style: 'primary',
                callback: function () {
                    var MessageUser = $('#toZRR', this).data('data') || [];
                    var textMessage = $('#textMessage').val();

                    if (!MessageUser.length && !textMessage) {
                        $.tips('传阅邀请和传阅意见不能同时为空！', 0);
                        return false;
                    }

                    if (textMessage.length > 500) {
                        $.tips('文字输入太长！', 0);
                        return false;
                    }

                    SendMessage(MessageUser, textMessage);
                }
            }, {
                text: '取消'
            }],
            onInit: function () {
                $('#select-attachment-chuanyue').uploadify({
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
                                            '<a class="file-operate file-del" href="#" id="DelFile_#{id}">删除</a>' +
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
                        
                        //在onUploadStart事件中，也就是上传之前，把参数写好传递到后台。  
                    }
                });
            }
        });
    })

    //删除已上传附件
    $('.file-delete').on('click', function () {
        var atta = $(this).data('data');
        var row  = $(this).parent();
        $.confirm('是否删除附件？', function (result) {
            if (result) {
                
                $.post(rootUrl + 'Common/DeleteAttachment', {
                    instanceId: atta.instanceId,
                    type: atta.type,
                    id: atta.id
                }, function (res) {
                    if (res.state) {
                        $.tips('删除成功！', 0);
                        row.remove();
                    } else {
                        $.tips(res.msg, 0);
                    }
                });
                //删除附件
               
            }
        });
    });

    function mc(tableId, startRow, endRow, col) {
        var tb = document.getElementById(tableId);
        if (col >= tb.rows[0].cells.length) {
            return;
        }
        if (col == 0) { endRow = tb.rows.length - 1; }
        for (var i = startRow; i < endRow; i++) {
            if (tb.rows[startRow].cells[col]!=undefined) {
                if (tb.rows[startRow].cells[col].innerHTML == tb.rows[i + 1].cells[0].innerHTML) {
                    tb.rows[i + 1].removeChild(tb.rows[i + 1].cells[0]);
                    tb.rows[startRow].cells[col].rowSpan = (tb.rows[startRow].cells[col].rowSpan | 0) + 1;
                    if (i == endRow - 1 && startRow != endRow) {
                        mc(tableId, startRow, endRow, col + 1);
                    }
                } else {
                    mc(tableId, startRow, i + 0, col + 1);
                    startRow = i + 1;
                }
            }
            
        }
    }

    $(document).ready(function () {
        mc('Approvehistory',0,0,1)
    });

    


    function GetModel() {
        var qxlbs = $('.qxlb_step1_value');
        var qxfxEntity = [];  //缺陷分析

        $('.qxlb_step1_value').each(function () {
            var data = $(this).data('data');
            qxfxEntity.push(data)

        });
        NPIModel.Main.TRDPXJS = $('[id="TRDPXJS"]').val();
        NPIModel.Main.CPJD = $('[id="cpjd"]').val();
        NPIModel.Main.QXDJ = $('[name="DefectLevel"]:checked').val();
        NPIModel.Main.XMDM = $('[id="xmdm"]').val();
        NPIModel.Main.CPX = $('#cpx').val();

        NPIModel.Main.PQEPGNR = $('#pqepgnr').val();
        NPIModel.Main.PQEPass = $('input[name="rd"]:checked').val();

        
        $('.qxfx_step2').each(function () {
            var defectType = {
                Id: $(this).attr('data'),
                YYFX: $(this).val(),
                Npi_main: npi_mainId
            }
            qxfxEntity.push(defectType)

        });


        var yfcsEntity = []; //预防措施
        $('.yfcs_step2_value').each(function () {
            yfdata = $(this).data('data');
            yfdata.Npi_main = npi_mainId;
            yfcsEntity.push(yfdata)

        });

        var jzcsEntity = []; //纠正措施
        $('.jz_step2_value').each(function () {
            jzdata = $(this).data('data');
            jzdata.Npi_main = npi_mainId;
            jzcsEntity.push(jzdata)

        });

        NPIModel.DefectTypes = qxfxEntity;
        NPIModel.Correctives = jzcsEntity;
        NPIModel.PrecautionaryActions = yfcsEntity;
        
        var implementEntity = [];
        $('.cssc_step3_value').each(function () {
            var NpiImplement = $(this).data('data');
            NpiImplement.Npi_main=npi_mainId;
            implementEntity.push(NpiImplement)
        });
        NPIModel.Implements = implementEntity

        NPIModel.Main.ConfirmInfo = $('#qrxx').val();

        NPIModel.Main.PGNR = $('#pgnr').val();
        NPIModel.Main.IsAccept = $('input[name="accept"]:checked').val();

        
        NPIModel.Main.YYSM = $('#YYSM').val();

        var verify = [];
        var verifyItem = {
            Id: 0,
            npi_main: npi_mainId,
            NZR : operater,
            NZ :$('#nznr').val(),
            BZ: $('#NZremark').val(),
            CloseState : $('#UpdateState').is(':checked') == true ? 5 : 6


        }
        verify.push(verifyItem);
        NPIModel.Verifies = verify;


        return NPIModel;

    }
    
    function SendMessage(MessageUser, userContent) {

        $.loading('提交中，请稍后...');
        
        var mailAddress = '';
        var toBadgeUser = '';
        for (var i = 0, l = MessageUser.length; i < l; i++) {
            mailAddress = mailAddress + MessageUser[i].Email + ',';
            toBadgeUser = toBadgeUser + MessageUser[i].Name + ',';
        }
        var attachments = [];

        $('#select-attachment-chuanyue-queue .finish-queue-item').each(function () {
            if ($(this).data('fileid')) {
                attachments.push($(this).data('fileid'));
            }
        });
        upModelData = GetModel();
        $.post(rootUrl + 'NPI/SubmitSave', {
           instanceId: instanceId,
           dataJson:JSON.stringify(upModelData)
        }, function (res) {
            
        });

        $.post(rootUrl + 'NPI/SubmitMessage', {
            instanceId: instanceId,
            toBadge: toBadgeUser.substr(0, toBadgeUser.length - 1),
            toMail: mailAddress.substr(0, mailAddress.length - 1),
            content: userContent,
            attach: attachments.join()
        }, function (res) {
            if (!res) {
                $.tips('知会失败', 1);
            }
            else {
                $.tips('知会成功', 3);

            }
            window.location.reload();
        });
            
        
        

        
    }

    $('.datepicker').datepicker({
        format: 'yyyy/m/d',
        autoclose: true,
        clearBtn: true,
        todayHighlight: true,
        language: 'zh-CN'
    });

    //////////////////////
    //事件绑定
    //////////////////////
    //缺陷等级说明
    $('#Defect_description').on('click', function () {
        var html = template('layer-defect', {});

        $.content({
                theme: 'blue',
                header: '缺陷等级说明',
                content: {
                    html: html
                },
                footer: [{
                    text: '确定',
                    callback: function () {
                        $.tlayer('close');
                    }
                }]
         });
    });

    //添加责任人
    $('#addZrr').on('click', function () {
        var html = template('layer-zrr', {});

        $.content({
            theme: 'blue',
            header: '添加责任人',
            content: {
                html: html
            },
            footer: [{
                text: '确定',
                style: 'primary',
                callback: function () {
                    var user = $('[name="zrr_step1"]').data('data');

                    if (user == null || user == undefined) {
                        $.tips('未选择责任人', 0);
                        return false;
                    }

                    var data = {
                        id: 0,
                        QXLB: $('[name="qxlb_step1"]').val(),
                        QXLBExp: $('[name="qxlb_step1"] option:selected').text(),
                        Remark: $('[name="remark_step1"]').val(),
                        QXZRR: user.Badge,
                        QXZZRExp: user.Name,
                        AssignInputUser: operater
                    }
                    var tr = $(
                                '<tr class="qxlb_step1_value">' +
                                    '<td >' + data.QXLBExp + '</td>' +
                                    '<td>' + data.QXZZRExp + '</td>' +
                                    '<td>' + data.Remark + '</td>' +
                                    '<td>' +
                                        '<a class="btn-link btn-edit">编辑</a>&nbsp;' +
                                        '<a class="btn-link btn-del">删除</a>' +
                                    '</td>' +
                                '</tr>'
                                ).data('data', data);
                    $('#zrrResult tbody').append(tr);
                }
            }, {
                text: '取消',
                callback: function () {
                    $.tlayer('close');

                }
            }]
        });
    });

    //责任人编辑行
    $('#zrrResult').on('click', '.btn-edit', function () {
        var tr = $(this).parents('tr');
        var data = tr.data('data');
        var html = template('layer-zrr', data);
        
        $.content({
            theme: 'blue',
            header: '编辑责任人',
            content: {
                html: html
            },
            footer: [{
                text: '确定',
                style: 'primary',
                callback: function () {
                    var user = $('[name="zrr_step1"]').data('data');

                    if (!user) {
                        $.tips('未选择责任人', 0);
                        return false;
                    }

                    var newData = {
                        id: data.id,
                        QXLB: $('[name="qxlb_step1"]').val(),
                        QXLBExp: $('[name="qxlb_step1"] option:selected').text(),
                        Remark: $('[name="remark_step1"]').val(),
                        QXZRR: user.Badge,
                        QXZZRExp: user.Name,
                        AssignInputUser: operater
                    }
                    var newTr = $(
                                '<tr class="qxlb_step1_value">' +
                                    '<td >' + newData.QXLBExp + '</td>' +
                                    '<td>' + newData.QXZZRExp + '</td>' +
                                    '<td>' + newData.Remark + '</td>' +
                                    '<td>' +
                                        '<a class="btn-link btn-edit">编辑</a>&nbsp;' +
                                        '<a class="btn-link btn-del">删除</a>' +
                                    '</td>' +
                                '</tr>'
                                ).data('data', newData);
                    tr.replaceWith(newTr);
                }
            }, {
                text: '取消',
                callback: function () {
                    $.tlayer('close');

                }
            }],
            onInit: function () {
                $('[name="zrr_step1"]', this).data('data', { Name: data.QXZZRExp, Badge: data.QXZRR }).val(data.QXZZRExp);
                $('[name="qxlb_step1"]', this).val(data.QXLB);
                $('[name="remark_step1"]', this).val(data.Remark);
            }
        });
       
    });

    //责任人删除行
    $('#zrrResult').on('click', '.btn-del', function () {
        var tr = $(this).parents('tr');
        $.confirm('确认删除责任人？', function (result) {
            if (result) {

                var data = tr.data('data');
                if (data.id != 0) {
                    $.post(rootUrl + 'NPI/DeleteDistribute', {
                        instanceId: instanceId,
                        mainId: data.id
                    }, function (res) {
                        if (res.state) {
                            $.tips('删除成功！', 0);
                        } else {
                            $.tips(res.msg, 0);
                        }

                    });
                }
                tr.remove();
            }
        });
    });

    //纠正措施
    $('#AddCorrective').on('click', function () {
        var html = template('layer-Corrective', {});

        $.content({
            theme: 'blue',
            header: '添加纠正措施',
            content: {
                html: html
            },
            footer: [{
                text: '确定',
                style: 'primary',
                callback: function () {
                    var user = $('[name="zrr_step2"]',this).data('data');
                    
                    if (user == null || user == undefined) {
                        $.tips('未选择责任人', 0);
                        return false;
                    }
                    if ($('[name="jzjhgbsj_step2"]').val() == '') {
                        $.tips('未填写计划关闭时间', 0);
                        return false;
                    }
                    if ($('[name="jzcsyjbb_step2"]').val() == '') {
                        $.tips('未填写硬件版本', 0);
                        return false;
                    }
                    if ($('[name="jzcs_step2"]').val() == '') {
                        $.tips('未填写纠正措施', 0);
                        return false;
                    }
                    if ($('[name="jzcs_step2"]').val().length > 800) {
                        $.tips('纠正措施超长', 0);
                        return false;
                    }
                    if ($('[name="jzcsyjbb_step2"]').val().length > 50) {
                        $.tips('硬件版本输入超长', 0);
                        return false;
                    }
                    if ($('[name="jzndsj_step2"]').val() == '') {
                        $.tips('未填写纠正拟定时间', 0);
                        return false;
                    }

                    var dateAStr = $("#trdpxjs").val();
                    var arrA = dateAStr.split("/");
                    var dateA = new Date(arrA[0], arrA[1], arrA[2]);
                    var dateAT = dateA.getTime();
                    var dateBStr = $('[name="jzjhgbsj_step2"]').val();
                    var arrB = dateBStr.split("/");
                    var dateB = new Date(arrB[0], arrB[1], arrB[2]);
                    var dateBT = dateB.getTime();
                    if (dateAT < dateBT) {
                        $.tips('计划关闭时间不得晚于TR评审时间', 0);
                        return false;
                    }

                    var data = {
                        JZCS: $('[name="jzcs_step2"]',this).val(),
                        NDRQ: $('[name="jzndsj_step2"]',this).val(),
                        YJBB: $('[name="jzcsyjbb_step2"]',this).val(),
                        JHGBSJ: $('[name="jzjhgbsj_step2"]',this).val(),
                        NDR: $('[name="zdr_step2"]',this).val(),
                        ZRR: user.Badge,
                        ZRRExp: user.Name,
                        InputUser: operater,
                        Id: 0
                    }
                    var tr = $(
                                '<tr class="jz_step2_value">' +
                                    '<td>' + operaterName + '</td>' +
                                    '<td >' + data.JZCS + '</td>' +
                                    '<td>' + data.ZRRExp + '</td>' +
                                    '<td>' + data.NDRQ + '</td>' +
                                    '<td>' + data.YJBB + '</td>' +
                                    '<td>' + data.JHGBSJ + '</td>' +
                                    
                                    '<td>' +
                                        '<a class="btn-link btn-edit">编辑</a>&nbsp;' + 
                                        '<a class="btn-link btn-del">删除</a>' +
                                    '</td>' +
                                '</tr>'
                                 ).data('data', data);
                    $('#jzResult tbody').append(tr);
                }
            }, {
                text: '取消',
                callback: function () {
                    $.tlayer('close');

                }
            }],
            onInit: function () {
                $('.datepicker', this).datepicker({
                    format: 'yyyy/m/d',
                    autoclose: true,
                    clearBtn: true,
                    todayHighlight: true,
                    language: 'zh-CN'
                });
            }
        });
    });
    //纠正措施编辑
    $('#jzResult').on('click', '.btn-edit', function () {
        var tr = $(this).parents('tr');
        var data = tr.data('data');
        var html = template('layer-Corrective', {});

        $.content({
            theme: 'blue',
            header: '编辑纠正措施',
            content: {
                html: html
            },
            footer: [{
                text: '确定',
                style: 'primary',
                callback: function () {
                    var user = $('[name="zrr_step2"]', this).data('data');

                    if (user == null || user == undefined) {
                        $.tips('未选择责任人', 0);
                        return false;
                    }
                    if ($('[name="jzjhgbsj_step2"]').val() == '') {
                        $.tips('未填写计划关闭时间', 0);
                        return false;
                    }
                    if ($('[name="jzcsyjbb_step2"]').val() == '') {
                        $.tips('未填写硬件版本', 0);
                        return false;
                    }
                    if ($('[name="jzcs_step2"]').val() == '') {
                        $.tips('未填写纠正措施', 0);
                        return false;
                    }
                    if ($('[name="jzcs_step2"]').val().length > 800) {
                        $.tips('纠正措施超长', 0);
                        return false;
                    }
                    if ($('[name="jzcsyjbb_step2"]').val().length > 50) {
                        $.tips('硬件版本输入超长', 0);
                        return false;
                    }
                    if ($('[name="jzndsj_step2"]').val() == '') {
                        $.tips('未填写纠正拟定时间', 0);
                        return false;
                    }

                    var dateAStr = $("#trdpxjs").val();
                    var arrA = dateAStr.split("/");
                    var dateA = new Date(arrA[0], arrA[1], arrA[2]);
                    var dateAT = dateA.getTime();
                    var dateBStr = $('[name="jzjhgbsj_step2"]').val();
                    var arrB = dateBStr.split("/");
                    var dateB = new Date(arrB[0], arrB[1], arrB[2]);
                    var dateBT = dateB.getTime();
                    if (dateAT < dateBT) {
                        $.tips('计划关闭时间不得晚于TR评审时间', 0);
                        return false;
                    }

                    var newData = {
                        JZCS: $('[name="jzcs_step2"]', this).val(),
                        NDRQ: $('[name="jzndsj_step2"]', this).val(),
                        YJBB: $('[name="jzcsyjbb_step2"]', this).val(),
                        JHGBSJ: $('[name="jzjhgbsj_step2"]', this).val(),
                        NDR: $('[name="zdr_step2"]', this).val(),
                        ZRR: user.Badge,
                        ZRRExp: user.Name,
                        InputUser: operater,
                        Id: data.Id
                    }
                    var newTr = $(
                                '<tr class="jz_step2_value">' +
                                    '<td>' + operaterName + '</td>' +
                                    '<td >' + newData.JZCS + '</td>' +
                                    '<td>' + newData.ZRRExp + '</td>' +
                                    '<td>' + newData.NDRQ + '</td>' +
                                    '<td>' + newData.YJBB + '</td>' +
                                    '<td>' + newData.JHGBSJ + '</td>' +

                                    '<td>' +
                                        '<a class="btn-link btn-edit">编辑</a>&nbsp;' +
                                        '<a class="btn-link btn-del">删除</a>' +
                                    '</td>' +
                                '</tr>'
                                 ).data('data', newData);
                    tr.replaceWith(newTr);
                }
            }, {
                text: '取消',
                callback: function () {
                    $.tlayer('close');

                }
            }],
            onInit: function () {
                $('.datepicker', this).datepicker({
                    format: 'yyyy/m/d',
                    autoclose: true,
                    clearBtn: true,
                    todayHighlight: true,
                    language: 'zh-CN'
                });
                
                $('[name="jzcs_step2"]', this).val(data.JZCS);
                $('[name="jzndsj_step2"]', this).val(data.NDRQ);
                $('[name="jzcsyjbb_step2"]', this).val(data.YJBB);
                $('[name="jzjhgbsj_step2"]', this).val(data.JHGBSJ);
                $('[name="zrr_step2"]', this).data('data', { Name: data.ZRRExp, Badge: data.ZRR }).val(data.ZRRExp);
            }
        });
    });

    //纠正措施删除行
    $('#jzResult').on('click', '.btn-del', function () {
        var tr = $(this).parents('tr');
        $.confirm('确认删除纠正措施吗？', function (result) {
            if (result) {
                var data = tr.data('data');
                if (data.Id != 0) {
                    $.post(rootUrl + 'NPI/DeleteCorrective', {
                        instanceId: instanceId,
                        Id: data.Id
                    }, function (res) {
                        if (res.state) {
                            $.tips('删除成功！', 0);
                        } else {
                            $.tips(res.msg, 0);
                        }
                    });
                }
                tr.remove();
            }
        });
    });

    //预防措施
    $('#AddPrecautionary').on('click', function () {
        var html = template('layer-Precautionary', {});

        $.content({
            theme: 'blue',
            header: '添加预防措施',
            content: {
                html: html
            },
            footer: [{
                text: '确定',
                style: 'primary',
                callback: function () {

                    var yfcs = $('[name="yfcs_step2"]', this).val();
                    if (yfcs == '') {
                        $.tips('请填写预防措施！', 0);
                        return false;
                    }
                    if (yfcs.length>1000) {
                        $.tips('预防措施超长！', 0);
                        return false;
                    }
                    var yjbb = $('[name="yfcsyjbb_step2"]', this).val();
                    if (yjbb == '') {
                        $.tips('请填写硬件版本！', 0);
                        return false;
                    }
                    if (yjbb.length > 200) {
                        $.tips('硬件版本超长！', 0);
                        return false;
                    }


                    var user = $('[name="yf_zrr_step2"]').data('data');
                    if (user == undefined || user == null) {
                        $.tips('责任人为空！', 0);
                        return false;
                    }

                    if ($('[name="yfndsj_step2"]').val() == '') {
                        $.tips('请填写拟定时间！', 0);
                        return false;
                    }
                    if ($('[name="yfjhgbsj_step2"]').val() == '') {
                        $.tips('请填写关闭时间！', 0);
                        return false;
                    }

                    var dateAStr = $("#trdpxjs").val();
                    var arrA = dateAStr.split("/");
                    var dateA = new Date(arrA[0], arrA[1], arrA[2]);
                    var dateAT = dateA.getTime();
                    var dateBStr = $('[name="yfjhgbsj_step2"]').val();
                    var arrB = dateBStr.split("/");
                    var dateB = new Date(arrB[0], arrB[1], arrB[2]);
                    var dateBT = dateB.getTime();
                    if (dateAT < dateBT) {
                        $.tips('计划关闭时间不得晚于TR评审时间', 0);
                        return false;
                    }

                    var data = {
                        Id: 0,
                        YFCS: $('[name="yfcs_step2"]',this).val(),
                        NDRQ: $('[name="yfndsj_step2"]',this).val(),
                        YJBB: $('[name="yfcsyjbb_step2"]',this).val(),
                        JHGBSJ: $('[name="yfjhgbsj_step2"]',this).val(),
                        NDR: $('[name="yfzdr_step2"]', this).val(),
                        InputUser: operater,
                        ZRR: user.Badge,
                        ZRRExp: user.Name
                    }
                    var tr = $(
                                '<tr class="yfcs_step2_value">' +
                                    '<td>' + operaterName + '</td>' +
                                    '<td>' + data.YFCS + '</td>' +
                                    '<td>' + data.ZRRExp + '</td>' +
                                    '<td>' + data.NDRQ + '</td>' +
                                    '<td>' + data.YJBB + '</td>' +
                                    '<td>' + data.JHGBSJ + '</td>' +
                                    '<td>' +
                                     '<a class="btn-link btn-edit">编辑</a>&nbsp;' +
                                        '<a class="btn-link btn-del">删除</a>' +
                                    '</td>' +
                                '</tr>'
                             ).data('data', data);
                    $('#yfResult tbody').append(tr);
                }
            }, {
                text: '取消'
            }],
            onInit: function () {
                $('.datepicker', this).datepicker({
                    format: 'yyyy/m/d',
                    autoclose: true,
                    clearBtn: true,
                    todayHighlight: true,
                    language: 'zh-CN'
                });
            }
        });
    });

    //预防措施编辑
    $('#yfResult').on('click', '.btn-edit', function () {
        var tr = $(this).parents('tr');
        var data = tr.data('data');
        var html = template('layer-Precautionary', {});

        $.content({
            theme: 'blue',
            header: '编辑预防措施',
            content: {
                html: html
            },
            footer: [{
                text: '确定',
                style: 'primary',
                callback: function () {

                    var yfcs = $('[name="yfcs_step2"]', this).val();
                    if (yfcs == '') {
                        $.tips('请填写预防措施！', 0);
                        return false;
                    }
                    if (yfcs.length > 1000) {
                        $.tips('预防措施超长！', 0);
                        return false;
                    }
                    var yjbb = $('[name="yfcsyjbb_step2"]', this).val();
                    if (yjbb == '') {
                        $.tips('请填写硬件版本！', 0);
                        return false;
                    }
                    if (yjbb.length > 200) {
                        $.tips('硬件版本超长！', 0);
                        return false;
                    }


                    var user = $('[name="yf_zrr_step2"]').data('data');
                    if (user == undefined || user == null) {
                        $.tips('责任人为空！', 0);
                        return false;
                    }

                    if ($('[name="yfndsj_step2"]').val() == '') {
                        $.tips('请填写拟定时间！', 0);
                        return false;
                    }
                    if ($('[name="yfjhgbsj_step2"]').val() == '') {
                        $.tips('请填写关闭时间！', 0);
                        return false;
                    }

                    var dateAStr = $("#trdpxjs").val();
                    var arrA = dateAStr.split("/");
                    var dateA = new Date(arrA[0], arrA[1], arrA[2]);
                    var dateAT = dateA.getTime();
                    var dateBStr = $('[name="yfjhgbsj_step2"]').val();
                    var arrB = dateBStr.split("/");
                    var dateB = new Date(arrB[0], arrB[1], arrB[2]);
                    var dateBT = dateB.getTime();
                    if (dateAT < dateBT) {
                        $.tips('计划关闭时间不得晚于TR评审时间', 0);
                        return false;
                    }

                    var newData = {
                        Id: data.Id,
                        YFCS: $('[name="yfcs_step2"]', this).val(),
                        NDRQ: $('[name="yfndsj_step2"]', this).val(),
                        YJBB: $('[name="yfcsyjbb_step2"]', this).val(),
                        JHGBSJ: $('[name="yfjhgbsj_step2"]', this).val(),
                        NDR: $('[name="yfzdr_step2"]', this).val(),
                        InputUser: operater,
                        ZRR: user.Badge,
                        ZRRExp: user.Name
                    }
                    var newTr = $(
                                '<tr class="yfcs_step2_value">' +
                                    '<td>' + operaterName + '</td>' +
                                    '<td>' + newData.YFCS + '</td>' +
                                    '<td>' + newData.ZRRExp + '</td>' +
                                    '<td>' + newData.NDRQ + '</td>' +
                                    '<td>' + newData.YJBB + '</td>' +
                                    '<td>' + newData.JHGBSJ + '</td>' +
                                    '<td>' +
                                     '<a class="btn-link btn-edit">编辑</a>&nbsp;' +
                                        '<a class="btn-link btn-del">删除</a>' +
                                    '</td>' +
                                '</tr>'
                             ).data('data', newData);
                    tr.replaceWith(newTr);
                }
            }, {
                text: '取消'
            }],
            onInit: function () {
                $('.datepicker', this).datepicker({
                    format: 'yyyy/m/d',
                    autoclose: true,
                    clearBtn: true,
                    todayHighlight: true,
                    language: 'zh-CN'
                });

                $('[name="yfcs_step2"]', this).val(data.YFCS);
                $('[name="yfndsj_step2"]', this).val(data.NDRQ);
                $('[name="yfcsyjbb_step2"]', this).val(data.YJBB);
                $('[name="yfjhgbsj_step2"]', this).val(data.JHGBSJ);
                $('[name="yf_zrr_step2"]', this).data('data', { Name: data.ZRRExp, Badge: data.ZRR }).val(data.ZRRExp);
            }
        });
    });

    //预防措施删除行
    $('#yfResult').on('click', '.btn-del', function () {
        var tr = $(this).parents('tr');
        $.confirm('确认删除纠正措施吗？', function (result) {
            if (result) {
               
                var data = tr.data('data');
                if (data.Id != 0) {
                    $.post(rootUrl + 'NPI/DeletePrecautionary', {
                        instanceId: instanceId,
                        Id: data.Id
                    }, function (res) {
                        if (res.state) {
                            $.tips('删除成功！', 0);
                        } else {
                            $.tips(res.msg, 0);
                        }
                    });
                }
                tr.remove();
            }
        });
    });

    //措施实施
    $('#AddImplement').on('click', function () {
        var html = template('layer-Implement', {});
        
        $.content({
            theme: 'blue',
            header: '添加措施实施',
            content: {
                html: html
            },
            footer: [{
                text: '确定',
                style: 'primary',
                callback: function () {

                    var user = $('[name="ssr_step3"]', this).data('data');
                    var data = {
                        Id:0,
                        Record: $('[name="ssjl_step3"]', this).val(),
                        CompleteTime: $('[name="sswcsj_step3"]', this).val(),
                        isFix: $('[name="gxqxzt_step3"]:checked', this).val(),
                        noFixRemark: $('[name="fgdsm_step3"]', this).val(),
                        ImplementZRR: user.Badge,
                        ImplementZRRExp: user.Name
                    }

                    if (data.Record == '') {
                        $.tips('请填写实施记录', 0);
                        return false;
                    }

                    if (data.Record.length > 600) {
                        $.tips('实施记录超长', 0);
                        return false;
                    }

                    if (data.isFix == '' || data.isFix == undefined) {
                        $.tips('请选择缺陷状态', 0);
                        return false;
                    }

                    if (data.isFix == 1 & data.noFixRemark == '') {
                        $.tips('请填写非固定说明', 0);
                        return false;
                    }
                    if (data.isFix == 1 & data.noFixRemark.length > 300) {
                        $.tips('非固定说明超长', 0);
                        return false;
                    }

                    var tr = $(
                                    '<tr class="cssc_step3_value">' +
                                        '<td>' + data.ImplementZRRExp + '</td>' +
                                        '<td>' + data.CompleteTime + '</td>' +
                                        '<td>' + data.Record + '</td>' +
                                        '<td>' +
                                            '<span class="defect-state"><span class="glyphicon ' + (data.isFix == 'true' ? 'glyphicon-ok-circle' : 'glyphicon-remove-circle') + '"></span>固定</span>' +
                                            '<span class="defect-state"><span class="glyphicon ' + (data.isFix == 'false' ? 'glyphicon-ok-circle' : 'glyphicon-remove-circle') + '"></span>非固定</span>' +
                                        '</td>' +
                                        '<td>' + data.noFixRemark + '</td>' +
                                        '<td>' +
                                            '<a class="btn-link btn-edit">编辑</a> ' +
                                            '<a class="btn-link btn-del">删除</a>' +
                                        '</td>' +
                                    '</tr>'
                                ).data('data', data);



                    $('#csResult tbody').append(tr);
                }
            }, {
                text: '取消',
                callback: function () {
                    $.tlayer('close');
                }
            }],
            onInit: function () {
                $('.datepicker', this).datepicker({
                    format: 'yyyy/m/d',
                    autoclose: true,
                    clearBtn: true,
                    todayHighlight: true,
                    language: 'zh-CN'
                });

                //非固定说明
                $('[name="gxqxzt_step3"]', this).on('change', function () {
                    if ($(this).val() == 'false') {
                        $('#noFixed').css('display', 'block');
                    } else {
                        $('#noFixed').css('display', 'none');
                    }
                });

                $('[name="ssr_step3"]').data('data', { Badge: operater, Name: operaterName });
            }
        });
    });
   
    //措施实施删除行
    $('#csResult').on('click', '.btn-del', function () {
        var tr = $(this).parents('tr');
        $.confirm('确认删除纠正措施吗？', function (result) {
            if (result) {
                var data = tr.data('data');
                if (data.Id != 0) {
                    $.post(rootUrl + 'NPI/DeleteImplement', {
                        instanceId: instanceId,
                        Id: data.Id
                    }, function (res) {
                        if (res.state) {
                            $.tips('删除成功！', 0);
                        } else {
                            $.tips(res.msg, 0);
                        }
                    });
                }
                tr.remove();
            }
        });
    });

    //措施实施编辑行
    $('#csResult').on('click', '.btn-edit', function () {
        var tr = $(this).parents('tr');
        var data = tr.data('data');

        var html = template('layer-Implement', data);

        $.content({
            theme: 'blue',
            header: '编辑措施实施',
            content: {
                html: html
            },
            footer: [{
                text: '确定',
                style: 'primary',
                callback: function () {
                    var ssjl = $('[name="ssjl_step3"]', this).val();

                    if (ssjl = '') {
                        $.tips('请填写实施记录', 0);
                        return false;
                    }

                    var user = $('[name="ssr_step3"]', this).data('data');
                    var newData = {
                        Id:data.Id,
                        Record: $('[name="ssjl_step3"]', this).val(),
                        CompleteTime: $('[name="sswcsj_step3"]', this).val(),
                        isFix: $('[name="gxqxzt_step3"]:checked', this).val(),
                        noFixRemark: $('[name="fgdsm_step3"]', this).val(),
                        ImplementZRR: user.Badge,
                        ImplementZRRExp: user.Name
                    }               

                    var newTr = $(
                                    '<tr class="cssc_step3_value">' +
                                        '<td>' + newData.ImplementZRRExp + '</td>' +
                                        '<td>' + newData.CompleteTime + '</td>' +
                                        '<td>' + newData.Record + '</td>' +
                                        '<td>' +
                                            '<span class="defect-state"><span class="glyphicon ' + (newData.isFix == 'true' ? 'glyphicon-ok-circle' : 'glyphicon-remove-circle') + '"></span>固定</span>' +
                                            '<span class="defect-state"><span class="glyphicon ' + (newData.isFix == 'false' ? 'glyphicon-ok-circle' : 'glyphicon-remove-circle') + '"></span>非固定</span>' +
                                        '</td>' +
                                        '<td>' + newData.noFixRemark + '</td>' +
                                        '<td>' +
                                            '<a class="btn-link btn-edit">编辑</a> ' +
                                            '<a class="btn-link btn-del">删除</a>' +
                                        '</td>' +
                                    '</tr>'
                                ).data('data', newData);

                    tr.replaceWith(newTr);
                }
            }, {
                text: '取消'
            }],
            onInit: function () {
                $('.datepicker', this).datepicker({
                    format: 'yyyy/m/d',
                    autoclose: true,
                    clearBtn: true,
                    todayHighlight: true,
                    language: 'zh-CN'
                });
                
                if (data.isFix == "true" || data.isFix == true) {
                    $('#noFixed').css('display', 'none');
                    $('[name="gxqxzt_step3"][value="true"]', this).attr("checked", 'checked');
                   
                } else {
                    
                    $('#noFixed').css('display', 'block');
                    $('[name="gxqxzt_step3"][value="false"]', this).attr("checked", 'checked');
                }

                $('[name="ssjl_step3"]', this).val(data.Record);
                $('[name="fgdsm_step3"]', this).val(data.noFixRemark);

                //非固定说明
                $('[name="gxqxzt_step3"]', this).on('change', function () {
                    if ($(this).val() == 'false' || $(this).val() == 'False') {
                        $('#noFixed').css('display', 'block');
                    } else {
                        $('#noFixed').css('display', 'none');
                    }
                });

                $('[name="ssr_step3"]', this).data('data', {
                    Badge: data.ImplementZRR,
                    Name: data.ImplementZRRExp
                }).val(data.ImplementZRRExp);
            }
        });
    });    

    $('[name="UpdateDefectWay"]').on('change', function () {
        if ($('[name="UpdateDefectWay"]:checked').val() == '2') {
            $('#noDefectWayDesc').removeClass('dis-none');
        } else {
            $('#noDefectWayDesc').addClass('dis-none');
        }
    });

    function postAttachment(source, target) {
        var attachments = [];
        var panel = $('#' + source);
        panel.find('.finish-queue-item').each(function () {
            if ($(this).data('fileid')) {
                attachments.push($(this).data('fileid'));
            }
        });

        if (attachments.length > 0) {

            $.post(rootUrl + 'NPI/' + target, {
                instanceId: instanceId,
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
    }

    $('#submit_cancel').on('click', function () {
        $.confirm('确定要删除本缺陷吗？', function (result) {
            if (result) {
                $.loading('提交中，请稍后...');
                $.post(rootUrl + 'NPI/SubmitCancel', {
                    instanceId: instanceId,
                    remark: '发起者取消流程'
                }, function (res) {
                    $.tlayer('close');
                    window.location.href = rootUrl + 'NPI/ApproveList';
                });



            }
        });

    });

    $('#submit_Confirmback').on('click', function () {
        $.content({
            theme: 'blue',
            header: '提交',
            content: {
                html: '<textarea class="form-control" style="height: 100px;"  ID="cycbj"></textarea>' + cycCommon
            },
            footer: [{
                text: '确定',
                style: 'primary',
                callback: function () {
                    var remark = $('#cycbj', this).val();
                    if (remark == '') {
                        $.tips('提交意见不能为空！', 0);
                        return false;
                    }
                    $.tlayer('close');
                    $.loading('提交中，请稍后...');
                    $.post(rootUrl + 'NPI/ReturnConfirmApproveToLast', {
                        instanceId: instanceId,
                        remark: remark
                    }, function (res) {
                        $.tlayer('close');
                        if (res.state) {
                            $.tips('驳回成功！', 3, function () {
                                window.location = rootUrl + 'npi/ApproveList';
                            });
                        } else {
                            $.tips(res.msg, 0);
                        }
                    });
                }
            }, {
                text: '取消'
            }],
            onInit: function () {
                $('[name="cyc"]', this).on('change', function () {
                    var cyc = $(this).find("option:selected").text();
                    $('#cycbj').val('').val(cyc);
                })
            }
        });
    });

    $('#submit_back').on('click', function () {



        $.content({
            theme: 'blue',
            header: '提交',
            content: {
                html: '<textarea class="form-control" style="height: 100px;"  ID="cycbj"></textarea>' + cycCommon
            },
            footer: [{
                text: '确定',
                style: 'primary',
                callback: function () {


                    var remark = $('#cycbj', this).val();

                    if (remark == '') {
                        $.tips('提交意见不能为空！', 0);
                        return false;
                    }
                    $.tlayer('close');
                    $.loading('提交中，请稍后...');
                    $.post(rootUrl + 'NPI/ReturnApproveToLast', {
                        instanceId: instanceId,
                        remark: remark
                    }, function (res) {
                        $.tlayer('close');
                        if (res.state) {
                            $.tips('驳回成功！', 3, function () {
                                window.location = rootUrl + 'npi/ApproveList';
                            });
                        } else {
                            $.tips(res.msg, 0);
                        }
                    });
                }
            }, {
                text: '取消'
            }],
            onInit: function () {
                $('[name="cyc"]', this).on('change', function () {
                    var cyc = $(this).find("option:selected").text();
                    $('#cycbj').val('').val(cyc);
                })
            }
        });
    });

    //提交确认
    $('#submitConfirm').on('click', function () {

        upModelData = GetModel();

        if (upModelData.Main.ConfirmInfo == '') {
            $.tips('确认意见不能为空！', 0);
            return false;
        }
        if (upModelData.Main.ConfirmInfo.length > 400) {
            $.tips('确认意见输入超长！', 0);
            return false;
        }

        $.content({
            theme: 'blue',
            header: '提交',
            content: {
                html: '<textarea class="form-control" style="height: 100px;"  name="cycbj"></textarea>' + cycCommon
            },
            footer: [{
                text: '确定',
                style: 'primary',
                callback: function () {


                    var remark = $('[name="cycbj"]', this).val();

                    if (remark == '') {
                        $.tips('提交意见不能为空！', 0);
                        return false;
                    }
                    $.tlayer('close');
                    $.loading('提交中，请稍后...');
                    $.post(rootUrl + 'NPI/SubmitConfirm', {
                        instanceId: instanceId,
                        dataJson:JSON.stringify(upModelData),
                        remark: remark
                    }, function (res) {
                        $.tlayer('close');
                        if (res.state) {
                            $.tips('确认成功！', 3, function () {
                                postAttachment('ConfirmPanel', 'SaveConfirmAttachment');

                            });
                        } else {
                            $.tips(res.msg, 0);
                        }
                    });
                }
            }, {
                text: '取消'
            }],
            onInit: function () {
                $('[name="cyc"]', this).on('change', function () {
                    var cyc = $(this).find("option:selected").text();
                    $('[name="cycbj"]').val('').val(cyc);
                })
            }
        });
    });


    //提交协办完成
    $('#submitCoOrganizerComplete').on('click', function () {



        $.content({
            theme: 'blue',
            header: '提交',
            content: {
                html: '<textarea class="form-control" style="height: 100px;"  name="cycbj"></textarea>' + cycCommon
            },
            footer: [{
                text: '确定',
                style: 'primary',
                callback: function () {


                    var remark = $('[name="cycbj"]', this).val();

                    if (remark == '') {
                        $.tips('提交意见不能为空！', 0);
                        return false;
                    }
                    $.tlayer('close');
                    $.loading('提交中，请稍后...');
                    $.post(rootUrl + 'NPI/submitCoOrganizerComplete', {
                        instanceId: instanceId,
                        remark: remark
                    }, function (res) {
                        $.tlayer('close');
                        if (res.state) {
                            $.tips('协办成功！', 3, function () {
                                window.location = rootUrl + 'npi/ApproveList';
                            });
                        } else {
                            $.tips(res.msg, 0);
        }
                    });
        }
            }, {
                text: '取消'
            }],
            onInit: function () {
                $('[name="cyc"]', this).on('change', function () {
                    var cyc = $(this).find("option:selected").text();
                    $('[name="cycbj"]').val('').val(cyc);
                })
            }
        });
    });

    $('#UpdateState').on('change', function () {
        if ($('#UpdateState').prop("checked")) {
            $('#submit-Co-organizer').css('display', 'none');
        }
        else
        {
            $('#submit-Co-organizer').css('display', 'inline-block');
        }

    })

    //驳回到发起人
    $('#return-distribute').on('click', function () {
        $.content({
            theme: 'blue',
            header: '驳回',
            content: {
                html: '<textarea class="form-control" style="height: 100px;"  name="cycbj"></textarea>'+ cycCommon
            },
            footer: [{
                text: '确定',
                style: 'primary',
                callback: function () {
                    var remark = $('[name="cycbj"]', this).val();

                    if (remark == '') {
                        $.tips('驳回意见不能为空！', 0);
                        return false;
                    }
                    $.tlayer('close');
                    $.loading('驳回中，请稍后...');
                    $.post(rootUrl + 'NPI/ReturnApproveToBegin', {
                        instanceId: instanceId,
                        remark: remark
                    }, function (res) {
                        $.tlayer('close');

                        if (res.state) {
                            $.tips('驳回成功！', 3, function () {
                                window.location = rootUrl + 'npi/ApproveList';
                            });
                        } else {
                            $.tips(res.msg, 0);
                        }
                    });
                }
            }, {
                text: '取消'
            }],
            onInit: function () {
                $('[name="cyc"]', this).on('change', function () {
                    var cyc = $(this).find("option:selected").text();
                    $('[name="cycbj"]').val('').val(cyc);
                })
            }
        });
    });
   
    //协办发起
    $('#submit-Co-organizer').on('click', function () {


            var html = template('layer-Co-organizer', {});
            $.content({
                theme: 'blue',
                header: '协办',
                content: {
                    html: html
                },
                footer: [{
                    text: '确定',
                    style: 'primary',
                    callback: function () {
                        var remark = $('textarea', this).val();

                        if (remark == '') {
                            $.tips('协办意见不能为空！', 0);
                            return false;
                        }

                        var upModelData = GetModel();

                        var user = $('#Co-organizerPerson').data('data');
                        if (user == undefined || user == null) {
                            $.tips('未选择责任人！', 0);
                            return false;
                        }
                    

                        for (var i = 0, l = user.length; i < l; i++) {
                            user[i] = user[i].Badge;
                        }


                        $.tlayer('close');
                        $.loading('协办操作，请稍后...');
                        $.post(rootUrl + 'NPI/SubmitAssist', {
                            instanceId: instanceId,
                            toUser: user.join(','),
                            remark: remark,
                            dataJson: JSON.stringify(upModelData)
                        }, function (res) {
                            $.tlayer('close');

                            if (res.state) {
                                $.tips('协办成功！', 3, function () {
                                    window.location = rootUrl + 'npi/ApproveList';
                                });
                            } else {
                                $.tips(res.msg, 0);
                            }
                        });
                    }
                }, {
                    text: '取消'
                }],
                onInit: function () {
                    $('[name="cyc"]', this).on('change', function () {
                        var cyc = $(this).find("option:selected").text();
                        $('[name="cycbj"]').val('').val(cyc);
                    })
                }
            });
    
    });    
    //缺陷分配提交
    $('#submit-distribute').on('click', function () {
        
        upModelData = GetModel();

        if (upModelData.Main.QXDJ == '' || upModelData.Main.QXDJ == undefined) {
            $.tips('未选择缺陷等级！', 0);
            return false;
        }

        if (upModelData.DefectTypes.length == 0) {
            $.tips('未选择相关责任人！', 0);
            return false;
        }

        if (upModelData.Main.TRDPXJS == '') {
            $.tips('未填写TR点评审时间', 0);
            return false;
        }
        if (upModelData.Main.CPJD == '') {
            $.tips('未填写产品阶段', 0);
            return false;
        }
        if (upModelData.Main.XMDM == '') {
            $.tips('未填写项目代码', 0);
            return false;
        }
        
        $.content({
            theme: 'blue',
            header: '提交',
            content: {
                html: '<textarea class="form-control" style="height: 100px;" name="cycbj"></textarea>' + cycCommon
                      
            },
            footer: [{
                text: '确定',
                style: 'primary',
                callback: function () {


                    var remark = $('[name="cycbj"]', this).val();

                    if (remark == '') {
                        $.tips('提交意见不能为空！', 0);
                        return false;
                    }
                   
                    $.tlayer('close');
                    $.loading('提交中，请稍后...');
                    $.post(rootUrl + 'NPI/SubmitDistribute', {
                        instanceId: instanceId,
                        remark: remark,
                        dataJson: JSON.stringify(upModelData)
                    }, function (res) {
                        $.tlayer('close');

                        if (res.state) {
                            $.tips('提交成功！', 3, function () {
                                postAttachment('AssignPanel', 'SaveAssignAttachment');
                                
                            });
                        } else {
                            $.tips(res.msg, 0);
                        }
                    });
                }
            }, {
                text: '取消'
            }],
            onInit: function () {
                $('[name="cyc"]', this).on('change', function () {
                    var cyc = $(this).find("option:selected").text();
                    $('[name="cycbj"]').val('').val(cyc);
                })
            }
        });
    });
    //缺陷分析提交
    $('#submit_analysis').on('click', function () {

        upModelData = GetModel();
        var msg = "";

        $(".qxfx_step2:not([readonly])").each(function () {
            if ($(this).val() == '') {
                msg = '请填写原因分析！';
                
            }
        });


        if (upModelData.Correctives.length == 0) {
            msg +=' 请填写纠正措施！';
        }
        if(msg!='')
        {
            $.tips(msg, 0);
            return;
        }
        
        $.content({
            theme: 'blue',
            header: '提交',
            content: {
                html: '<textarea class="form-control" style="height: 100px;"  name="cycbj"></textarea>' + cycCommon
            },
            footer: [{
                text: '确定',
                style: 'primary',
                callback: function () {
                    var remark = $('[name="cycbj"]', this).val();

                    if (remark == '') {
                        $.tips('提交意见不能为空！', 0);
                        return false;
                    }

                    $.tlayer('close');
                    $.loading('提交中，请稍后...');
                    $.post(rootUrl + 'NPI/SubmitAnalysis', {
                        instanceId: instanceId,
                        remark: remark,
                        dataJson: JSON.stringify(upModelData)
                    }, function (res) {
                        $.tlayer('close');

                        if (res.state) {
                            $.tips('提交成功！', 3, function () {
                                postAttachment('analysisPanel', 'SaveReasonAttachment');
                            });
                        } else {
                            $.tips(res.msg, 0);
                        }
                    });
                }
            }, {
                text: '取消'
            }],
            onInit: function () {
                $('[name="cyc"]', this).on('change', function () {
                    var cyc = $(this).find("option:selected").text();
                    $('[name="cycbj"]').val('').val(cyc);
                })
            }
        });


    });
    //实施提交
    $('#submitImplement').on('click', function () {

        upModelData = GetModel();

        if (NPIModel.Implements.length == 0) {
            $.tips('请填写相关实施记录！', 0);
            return false;
        }

        

        $.content({
            theme: 'blue',
            header: '提交',
            content: {
                html: '<textarea class="form-control" style="height: 100px;"  name="cycbj"></textarea>' + cycCommon
            },
            footer: [{
                text: '确定',
                style: 'primary',
                callback: function () {
                    var remark = $('[name="cycbj"]', this).val();

                    if (remark == '') {
                        $.tips('提交意见不能为空！', 0);
                        return false;
                    }

                    $.tlayer('close');
                    $.loading('提交中，请稍后...');
                    $.post(rootUrl + 'NPI/SubmitImplement', {
                        instanceId: instanceId,
                        remark: remark,
                        dataJson: JSON.stringify(upModelData)
                    }, function (res) {
                        $.tlayer('close');

                        if (res.state) {
                            $.tips('提交成功！', 3, function () {
                                postAttachment('panel-implement', 'SaveImplementAttachment');

                            });
                        } else {
                            $.tips(res.msg, 0);
                        }
                    });
                }
            }, {
                text: '取消'
            }],
            onInit: function () {
                $('[name="cyc"]', this).on('change', function () {
                    var cyc = $(this).find("option:selected").text();
                    $('[name="cycbj"]').val('').val(cyc);
                })
            }
        });
    });
    //验证
    $('#submitVerified').on('click', function () {

        upModelData = GetModel();
        var tip = '';
        if (upModelData.Verifies[0].NZ.length==0) {
            tip =tip + '请填写验证内容！';
        }
        if (upModelData.Verifies[0].NZ.length > 500) {
            tip =tip  + "验证内容超长!";
        }
        if (upModelData.Verifies[0].BZ.length > 200) {
            tip =tip  + "备注内容超长!";
        }
        if (tip != '') {
            $.tips(tip, 0);
            return false;
        }

      


        $.content({
            theme: 'blue',
            header: '提交',
            content: {
                html: '<textarea class="form-control" style="height: 100px;"  name="cycbj"></textarea>' + cycCommon
            },
            footer: [{
                text: '确定',
                style: 'primary',
                callback: function () {
                    var remark = $('[name="cycbj"]', this).val();

                    if (remark == '') {
                        $.tips('提交意见不能为空！', 0);
                        return false;
                    }
                   

                    $.tlayer('close');
                    $.loading('提交中，请稍后...');
                    $.post(rootUrl + 'NPI/SubmitVerify', {
                        instanceId: instanceId,
                        remark: remark,
                        dataJson: JSON.stringify(upModelData)
                    }, function (res) {
                        $.tlayer('close');

                        if (res.state) {
                            $.tips('提交成功！', 3, function () {
                                postAttachment('panel-verifa', 'SaveVerifAttachment');
                            });
                        } else {
                            $.tips(res.msg, 0);
                        }
                    });
                }
            }, {
                text: '取消'
            }],
            onInit: function () {
                $('[name="cyc"]', this).on('change', function () {
                    var cyc = $(this).find("option:selected").text();
                    $('[name="cycbj"]').val('').val(cyc);
                })
            }
        });
    });
    $('#submitPQEAssess').on('click', function () {
        upModelData = GetModel();
        var msg='';

        if (upModelData.Main.PQEPGNR=='') {
            msg = '请填写评估内容！';
        }
        if (upModelData.Main.PQEPGNR.length > 800) {
            msg = '评估内容超长！';
        }

       

        if (upModelData.Main.PQEPass == undefined) {
            msg += '请选择是否通过！';
        }
        if (msg != '') {
            $.tips(msg, 0);
            return false;
        }

        $.content({
            theme: 'blue',
            header: '提交',
            content: {
                html: '<textarea class="form-control" style="height: 100px;"  name="cycbj"></textarea>' + cycCommon
            },
            footer: [{
                text: '确定',
                style: 'primary',
                callback: function () {
                    var remark = $('[name="cycbj"]', this).val();

                    if (remark == '') {
                        $.tips('提交意见不能为空！', 0);
                        return false;
                    }

                    var MessageUser = $('#toZRR', this).data('data');
                    var textMessage = $('#textMessage').val();
                    $.tlayer('close');
                    $.loading('提交中，请稍后...');
                    $.post(rootUrl + 'NPI/SubmitPQEAssess', {
                        instanceId: instanceId,
                        remark: remark,
                        dataJson: JSON.stringify(upModelData)
                    }, function (res) {
                        $.tlayer('close');

                        if (res.state) {
                            $.tips('提交成功！', 3, function () {
                                postAttachment('panel-pqeAssess', 'SaveAssessPQEAttachment');

                            });
                        } else {
                            $.tips(res.msg, 0);
                        }
                    });
                }
            }, {
                text: '取消'
            }],
            onInit: function () {
                $('[name="cyc"]', this).on('change', function () {
                    var cyc = $(this).find("option:selected").text();
                    $('[name="cycbj"]').val('').val(cyc);
                })
            }
        });
    });
    //总工评估
    $('#submitAssess').on('click', function () {

        upModelData = GetModel();
        var msg = '';

        if (upModelData.Main.IsAccept == undefined) {
            msg = '请选择接收意见！';
        }

        if (upModelData.Main.PGNR == '') {
            msg += '请填写评估内容！';
        }
        if (upModelData.Main.PGNR.length > 800) {
            msg += '评估内容超长！';
        }

        if (msg != '') {
            $.tips(msg, 0);
            return false;
        }

        $.content({
            theme: 'blue',
            header: '提交',
            content: {
                html: '<textarea class="form-control" style="height: 100px;"  name="cycbj"></textarea>' + cycCommon
            },
            footer: [{
                text: '确定',
                style: 'primary',
                callback: function () {
                    var remark = $('[name="cycbj"]', this).val();

                    if (remark == '') {
                        $.tips('提交意见不能为空！', 0);
                        return false;
                    }
                    $.tlayer('close');
                    $.loading('提交中，请稍后...');
                    $.post(rootUrl + 'NPI/SubmitAssess', {
                        instanceId: instanceId,
                        remark: remark,
                        dataJson: JSON.stringify(upModelData)
                    }, function (res) {
                        $.tlayer('close');

                        if (res.state) {
                            $.tips('提交成功！', 3, function () {
                                postAttachment('panel-Assess', 'SaveAssessAttachment');

                            });
                        } else {
                            $.tips(res.msg, 0);
                        }
                    });
                }
            }, {
                text: '取消'
            }],
            onInit: function () {
                $('[name="cyc"]', this).on('change', function () {
                    var cyc = $(this).find("option:selected").text();
                    $('[name="cycbj"]').val('').val(cyc);
                })
            }
        });
    });
    //挂起
    $('#submitComplete').on('click', function () {

        upModelData = GetModel();
        

       if (upModelData.Main.YYSM == '') {
            $.tips('原因说明不能为空！', 0);
            return false;
       }
       if (upModelData.Main.YYSM.length > 800) {
           $.tips('原因说明不能超过800个字！');
           return false;
       }

        NPIModel.Main.State = $('#qxState').val();
        $.content({
            theme: 'blue',
            header: '提交',
            content: {
                html: '<textarea class="form-control" style="height: 100px;"  name="cycbj"></textarea>' + cycCommon
            },
            footer: [{
                text: '确定',
                style: 'primary',
                callback: function () {
                    var remark = $('[name="cycbj"]', this).val();

                    if (remark == '') {
                        $.tips('提交意见不能为空！', 0);
                        return false;
                    }

                    $.tlayer('close');
                    $.loading('提交中，请稍后...');
                    $.post(rootUrl + 'NPI/SubmitHangUp', {
                        instanceId: instanceId,
                        remark: remark,
                        dataJson: JSON.stringify(upModelData)
                    }, function (res) {
                        $.tlayer('close');

                        if (res.state) {
                            $.tips('提交成功！', 3, function () {
                                postAttachment('panel-hangup', 'SaveHangUpAttachment');

                            });
                        } else {
                            $.tips(res.msg, 0);
                        }
                    });
                }
            }, {
                text: '取消'
            }],
            onInit: function () {
                $('[name="cyc"]', this).on('change', function () {
                    var cyc = $(this).find("option:selected").text();
                    $('[name="cycbj"]').val('').val(cyc);
                })
            }
        });
    });


    //首页提交

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
                    var opt = '<option value="' + value.revision + '">' + value.revision + '</option>';
                    $('#yjbb').append(opt);
                });
            },
            error: function () {
                alert('fail');
            }
        });


    }


    function submit() {

        var data = {
            Main: {
                ZY: $('[id="qxzy"]').val(),
                QXMS: $('[id="qxms"]').val(),
                CPX: $('[id="cpx"]').val(),
                WPBM: $('[id="wpbm"]').val(),
                WPXH: $('[id="wpxh"]').val(),
                XMDM: $('[id="xmdm"]').val(),
                YJBB: $('[id="yjbb"]').val(),
                RJBB: $('[id="rjbb"]').val(),
                YXJ: $('[id="yxj"]').val(),
                Id: npi_mainId,
                InstanceId: instanceId
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
        if (data.Main.XMDM == '') {
            $.tips('项目代码不能为空！');
            return false;
        }
        if (reg.test(data.Main.XMDM)) {
            $.tips('项目代码含有无效输入！');
            return false;
        }


        $.confirm('确定要提交审批吗？', function (result) {
            if (result) {
                $.tlayer('close');
                $.loading('提交中，请稍后...');
                submitApprove(data);



            }
        });
    }

    function submitApprove(data) {
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


    $('#submit-create').on('click', function () {

        submit();

    });


    $('#xmdm').autoComplete({
        async: {
            url: 'http://webapi.maipu.com/Selector/Project/GetProjectCodes',
            dataType: 'jsonp',
            dataField: null
        },
        maxNum: 10,
        width: 400,
        template: '<td>#{segment1}</td><td>#{description}</td>',
        callback: function (data) {
            $('#xmdm').val(data.description).data('data', data);

        }
    });

    $('#wpbm').autoComplete({
        async: {
            url: rootUrl + 'common/SearchProductTree',
            dataType: 'jsonp',
            searchField: 'wpbm',
            dataField: null
        },
        width: 400,
        template: '<td>#{cpBm}</td><td>#{cpName}</td><td>#{xsxhName}</td>',
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
            dataField: null
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

    //展开传阅意见与传阅邀请
    $(document).on('click', '.DownUp', function () {
        if ($('.DownUp span:nth-child(1)').text() == '传阅功能展开') {
            $('.DownUp span:nth-child(1)').html('传阅功能关闭');
            $('.DownUp span:nth-child(2)').removeClass('glyphicon-collapse-down').addClass('glyphicon-collapse-up');
        }
        else {
            $('.DownUp span:nth-child(1)').html('传阅功能展开');
            $('.DownUp span:nth-child(2)').removeClass('glyphicon-collapse-up').addClass('glyphicon-collapse-down');
        }
        
        $('.cyyj').toggle();
    });

    if (location.hash == '#notify') {
        $('#notify').attr('data-expand', 'Y');
        $('#CirculatedMessage').trigger('click');
	}
});