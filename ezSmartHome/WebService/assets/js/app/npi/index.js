require(['common', 'util', 'plugins', 'bootstrap', 'datepicker'], function ($, util) {
    var rootUrl = OP_CONFIG.rootUrl;

    //////////////////////
    //页面初始化
    //////////////////////

    $('.datepicker').datepicker({
        format: 'yyyy/m/d',
        autoclose: true,
        clearBtn: true,
        todayHighlight: true,
        language: 'zh-CN'
    });


    var resultTable = $('#result-list').table({
        url: rootUrl + 'Npi/SearchList',
        //maxHeight: $('#main').height() - 270,
        data: function () {
            var zzr = $('#ZRR').data('data');
            var zrr = ($('#ZRR').val() == '') ?'' : zzr.Badge;    
            return {                
                number: $.trim($('#number').val().replace("'", "")),
                keyword: $.trim($('#qxms').val().replace("'", "")),
                QXstate: $('#QxState').find("option:selected").val().replace("'", ""),
                level: $('#QXDJ').find("option:selected").val().replace("'", ""),
                beginTime: $('#beginTime').val(),
                endTime: $('#endTime').val(),
                TJBM: $.trim($('#TJBM').val().replace("'", "")),
                CPX: $('#CPX').val(),
                CPXH: $.trim($('#CPXH').val().replace("'", "")),
                WPBM: $.trim($('#WPBM').val().replace("'", "")),
                ZRBM: $.trim($('#ZRBM').val().replace("'", "")),
                ZRR: zrr,
                SPZRR: $.trim($('#SPZRR').val().replace("'", "")),
                SPBM: $.trim($('#SPBM').val().replace("'", "")),
                YJBB: $.trim($('#YJBB').val().replace("'", "")),
                RJBB: $.trim($('#RJBB').val().replace("'", "")),
                QXLB: $.trim($('#QXLB').val().replace("'", "")),
                CPJD: $.trim($('#CPJD').val().replace("'", "")),
                XMDM: $.trim($('#xmdm').val().replace("'", "")),
                TRDPXJS: $.trim($('#TRDPXJS').val().replace("'", ""))
            };
        },
        paging:{
            pageSize: 10
        },
        tableClass: 'table-condensed',
        colOptions: [{
            name: '序号',
            field: 'Id',
            width: 50,
            align: 'center'
        }, {
            name: '缺陷摘要',
            field: 'ZY',
            handler: function (value, data) {
                return '<a href="' + rootUrl + 'NPI/Detail?instanceId=' + data.InstanceId + '" target="_blank">' +  data.ZY + '</a>';

            }
        }, {
            name: '缺陷等级',
            field: 'QXDJExp',
            width: 80
        }, {
            name: '缺陷分类',
            field: 'QXFL',
            width: 80
        }, {
            name: '当前审批人',
            field: 'Approvers',
            handler: function (value) {
                return '<div class="text-ellipsis" title="' + value + '">' + value + '</div>';
            },
            width: 80
        },{
            name: '审批部门',
            field: 'SPBM',
            width: 80
        },{
            name: '缺陷状态',
            field: 'StateExp',
            width: 80
        }, {
        //    name: '关闭日期',
        //    field: 'CloseTimeExp',
        //    width: 120
        //}, {
        //    name: 'TR日期',
        //    field: 'TRDPXJSExp',
        //    width: 120
        //}, {
            name: '提交日期',
            field: 'CreateTimeExp',
            width: 130
        }, {
            name: '产品线',
            field: 'CPX',
            width: 70
        }, {
            name: '项目代码',
            width: 80,
            handler: function (value, data) {
                return '<div class="text-ellipsis" title="' + data.XMDM + '">' + data.XMDMMini + '</div>';
            }
        }, {
            name: '物品编码',
            field: 'WPBM',
            width: 100
        }, {
            name: '物品型号',
            field: 'WPXH',
            width: 150
        }, {
            name: '提交人',
            field: 'TJRExp',
            width: 60
        }]
    });

    //////////////////////
    //事件绑定
    //////////////////////


    $('#query').on('click', function () {
        resultTable.table('reload');
    });

    
    $('#export').on('click', function () {
        
            var zzr = $('#ZRR').data('data');
            var zrr = ($('#ZRR').val() == '') ?'' : zzr.Badge;    
            $(this).attr('href', rootUrl + 'Npi/Export?number=' + $.trim($('#number').val()) +'&beginTime=' + $('#beginTime').val() + '&endTime=' + $('#endTime').val() +  '&keyword=' + $.trim($('#qxms').val()) + '&QXstate=' + $('#QxState').find("option:selected").val() + '&level=' + $('#QXDJ').find("option:selected").val() + '&TJBM=' + $.trim($('#TJBM').val()) + '&CPX=' + $.trim($('#CPX').val()) + '&CPXH=' + $.trim($('#CPXH').val()) + '&wpbm=' + $.trim($('#WPBM').val()) + '&ZRBM=' + $.trim($('#ZRBM').val()) + '&ZRR=' + zrr + '&RJBB=' + $('#RJBB').val() + '&YJBB=' + $('#YJBB').val() + '&QXLB=' + $('#QXLB').val() + '&XMDM=' + $('#xmdm').val());
            

    });
    
    $('#clean').on('click', function () {
        $('input').val('');
        $('#QxState').val('');
        $('#QXDJ').val('');
        $('#QXLB').val('');
    })
   
});