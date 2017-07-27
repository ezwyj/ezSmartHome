define(['common', 'plugins', 'template','bootstrap', 'datepicker', 'echarts'], function ($, util, template) {
    var rootUrl = OP_CONFIG.rootUrl;
    var QXDJLIST = $('[name="QXDJLIST"]').val();
    $('.DateFormonth').datepicker({
        format: 'yyyy/m',
        autoclose: true,
        clearBtn: true,
        todayHighlight: true,
        startView: 1,
        maxViewMode: 2,
        minViewMode: 1,
        language: 'zh-CN'
    });
    

    var date = new Date;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" + month : month);
    var mydate = (year.toString() + '/' + month.toString());

    $('#beginTime').val(year.toString() + '/01');
    $('#endTime').val(mydate);

    $('#chart2BeginTime').val(year.toString() + '/01');
    $('#chart2EndTime').val(mydate);


    $('#chart3_beginTime').val(year.toString() + '/01');
    $('#chart3_endTime').val(mydate);

    $('#chart4BeginTime').val(year.toString() + '/01');
    $('#chart4EndTime').val(mydate);



    $('#Chart1Query').on('click', function () {
        $('#chart1_X').empty();
        $('#chart1_01').empty();
        $('#chart1_02').empty();
        $('#chart1_03').empty();
        $('#chart1_04').empty();
        $('#chart1_count').empty();
        $('#chart1_X').append('<th>问题等级</th>')
        $('#chart1_01').append('<td>A级</td>');
        $('#chart1_02').append('<td >B级</td>');
        $('#chart1_03').append('<td >C级</td>');
        $('#chart1_04').append('<td >D级</td>');
        $('#chart1_count').append('<td >小计</td>');

        var myChart1 = echarts.init($('#chart1 .echarts-box')[0]);
        var option1 = {
            legend: {
                show: true,
                data: ['A级', 'B级', 'C级', 'D级'],
                orient: 'vertical',
                x: 'right',
                y: 'center'
            },
            tooltip: {
                trigger: 'axis'
            },
            xAxis: [
                {
                    type: 'category',
                    data: []
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: [
                {
                    name: 'A级',
                    type: 'bar',
                    data: []
                },
                {
                    name: 'B级',
                    type: 'bar',
                    data: []
                },
                {
                    name: 'C级',
                    type: 'bar',
                    data: []
                },
                {
                    name: 'D级',
                    type: 'bar',
                    data: []
                }
            ]
        }



        $.post(rootUrl + 'NPI/GetChart1', {
            beginTime: $('#beginTime').val(),
            endTime: $('#endTime').val(),
            level: $('#level').val(),
            cpx: $('#cpx').val()
        }, function (res) {
            if (res.state) {
                //隐藏加载框
                $('#chart1 .graph-loading').hide();

                for (var i = 0; i < res.data.length; i++) {
                    if (!option1.xAxis[0].data.contains(res.data[i].yearmonth)) {
                        option1.xAxis[0].data.push(res.data[i].yearmonth);
                        option1.series[0].data.push('');
                        option1.series[1].data.push('');
                        option1.series[2].data.push('');
                        option1.series[3].data.push('');
                        $('#chart1_X').append('<th>' + res.data[i].yearmonth + '</th>');
                        $('#chart1_01').append('<td id="chart1_' + res.data[i].yearmonth + '_01">0</td>');
                        $('#chart1_02').append('<td id="chart1_' + res.data[i].yearmonth + '_02">0</td>');
                        $('#chart1_03').append('<td id="chart1_' + res.data[i].yearmonth + '_03">0</td>');
                        $('#chart1_04').append('<td id="chart1_' + res.data[i].yearmonth + '_04">0</td>');
                        $('#chart1_count').append('<td id="chart1_' + res.data[i].yearmonth + '_count">0</td>');
                    }
                }
                for (var i = 0; i < res.data.length; i++) {
                    for (var j = 0; j < option1.xAxis[0].data.length;j++){
                        if (res.data[i].yearmonth == option1.xAxis[0].data[j]) {
                            switch (res.data[i].QXDJ) {
                                case "01":
                                    option1.series[0].data.splice(j, 1, res.data[i].number);
                                    $('#chart1_' + res.data[i].yearmonth + '_01').html(res.data[i].number);
                                    var c = parseInt($('#chart1_' + res.data[i].yearmonth + '_count').html()) + res.data[i].number
                                    $('#chart1_' + res.data[i].yearmonth + '_count').html(c);
                                    break;
                                case "02":
                                    option1.series[1].data.splice(j, 1, res.data[i].number);
                                    $('#chart1_' + res.data[i].yearmonth + '_02').html(res.data[i].number);
                                    var c = parseInt($('#chart1_' + res.data[i].yearmonth + '_count').html()) + res.data[i].number
                                    $('#chart1_' + res.data[i].yearmonth + '_count').html(c);
                                    break;
                                case "03":
                                    option1.series[2].data.splice(j, 1, res.data[i].number);
                                    $('#chart1_' + res.data[i].yearmonth + '_03').html(res.data[i].number);
                                    var c = parseInt($('#chart1_' + res.data[i].yearmonth + '_count').html()) + res.data[i].number
                                    $('#chart1_' + res.data[i].yearmonth + '_count').html(c);
                                    break;
                                case "04":
                                    option1.series[3].data.splice(j, 1, res.data[i].number);
                                    $('#chart1_' + res.data[i].yearmonth + '_04').html(res.data[i].number);
                                    var c = parseInt($('#chart1_' + res.data[i].yearmonth + '_count').html()) + res.data[i].number
                                    $('#chart1_' + res.data[i].yearmonth + '_count').html(c);
                                    break;
                            }
                        }
                    }
                }


                myChart1.setOption(option1);
                console.log(option1)

            } else {
                $.tips(res.msg, 0);
            }
        });

    });


    $('#Chart2Query').on('click', function () {
        
        $('#chart2_X').empty();
        $('#chart2_Y').empty();
        $('#chart2_01').empty();
        $('#chart2_02').empty();
        $('#chart2_03').empty();
        $('#chart2_04').empty();
        $('#chart2_monthcount').empty();
        $('#chart2_monthclosecount').empty();
        $('#chart2_monthCloseRate').empty();
        $('#chart2_CloseRate').empty();
        $('#chart2_X').append('<th>问题等级</th>')
        $('#chart2_01').append('<td>A级</td>');
        $('#chart2_02').append('<td >B级</td>');
        $('#chart2_03').append('<td >C级</td>');
        $('#chart2_04').append('<td >D级</td>');
        $('#chart2_monthcount').append('<td >当月问题总数</td>');
        $('#chart2_monthclosecount').append('<td >当月问题关闭数</td>');
        $('#chart2_monthCloseRate').append('<td >单月关闭率</td>');
        $('#chart2_CloseRate').append('<td >累计关闭率</td>');
        var myChart2 = echarts.init($('#chart2 .echarts-box')[0]);
        var option2 = {
            legend: {
                show: true,
                data: ['当月问题总数', '当月问题关闭数', '单月关闭率', '累计关闭率', '目标'],
                //orient: 'vertical',
                //x: 'right',
                y: 'bottom'
            },
            tooltip: {
                trigger: 'axis',
                formatter: '{b}<br>{a0} : {c0}<br>{a1} : {c1}<br>{a2} : {c2}%<br>{a3} : {c3}%<br>{a4} : {c4}%'
            },
            xAxis: [
                {
                    type: 'category',
                    data: []
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    splitNumber: 6
                },
                {
                    type: 'value',
                    min: 0,
                    max: 120,
                    splitNumber: 6,
                    axisLabel: {
                        formatter: function (value) {
                            return value + '%';
                        }
                    }
                }
            ],
            series: [
                {
                    name: '当月问题总数',
                    type: 'bar',
                    data: [],
                    itemStyle: {
                        normal: {
                            label: {
                                show: true
                            }
                        }
                    }
                },
                {
                    name: '当月问题关闭数',
                    type: 'bar',
                    data: [],
                    itemStyle: {
                        normal: {
                            label: {
                                show: true
                            }
                        }
                    }
                },
                {
                    name: '单月关闭率',
                    type: 'line',
                    data: [],
                    smooth: true,
                    yAxisIndex: 1,
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                formatter: '{c}%'
                            }
                        }
                    }
                },
                {
                    name: '累计关闭率',
                    type: 'line',
                    data: [],
                    smooth: true,
                    yAxisIndex: 1,
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                formatter: '{c}%'
                            }
                        }
                    }
                },
                {
                    name: '目标',
                    type: 'line',
                    data: [],
                    smooth: true,
                    yAxisIndex: 1,
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                formatter: '{c}%'
                            }
                        }
                    }
                }
            ]
        }
        myChart2.on('click', function (params) {
            //console.log(params);
            var month = params.name;
            var wpxh = $('#wpxh').val();
            var yjbb= $('#chart2YJBB').val();
            var rjbb= $('#chart2RJBB').val();
            var xmdm= $('#chart2Xmdm').val();
            var tr = $('#cpjd').val();
            var beginMonth = month + "";
            var endMonth = month + "";
            if (params.seriesName == "当月问题总数") {

                window.location = rootUrl + "npi/index?beginMonth=" + beginMonth + "&endMonth=" + endMonth + "&level=All&state=1,3,4,5,6,7" + "&yjbb=" + yjbb + "&rjbb=" + rjbb + "&xmdm=" + xmdm + "&cpjd=" + tr;
            }
            if (params.seriesName == "当月问题关闭数") {
                window.location = rootUrl + "npi/index?beginMonth="+beginMonth+ "&endMonth=" + endMonth + "&level=All&state=6,7" + "&yjbb=" + yjbb + "&rjbb=" + rjbb + "&xmdm=" + xmdm + "&cpjd=" + tr;
            }
        });
        $.post(rootUrl + 'NPI/GetChart2', {
            beginTime: $('#chart2BeginTime').val(),
            endTime: $('#chart2EndTime').val(),
            wpxh: $('#wpxh').val(),
            yjbb: $('#chart2YJBB').val(),
            rjbb: $('#chart2RJBB').val(),
            xmdm: $('#chart2Xmdm').val(),
            tr: $('#cpjd').val()
        }, function (res) {
            if (res.state) {
                //隐藏加载框
                $('#chart2 .graph-loading').hide();

                if (!res.data || !res.data.length) {
                    
                    $('.table-box .echarts-box').css('display', 'none');
                    $('.chart2Message').show();
                    return false;
                }
                else
                {
                    $('.table-box .echarts-box').css('display', 'block');
                    $('.chart2Message').css('display', 'none');
                }

                
                for (var i = 0; i < res.data.length; i++) {
                    if (!option2.xAxis[0].data.contains(res.data[i].yearmonth)) {
                        option2.xAxis[0].data.push(res.data[i].yearmonth);
                        $('#chart2_X').append('<th>' + res.data[i].yearmonth + '</th>');
                        $('#chart2_01').append('<td id="chart2_' + res.data[i].yearmonth + '_01">0</td>');
                        $('#chart2_02').append('<td id="chart2_' + res.data[i].yearmonth + '_02">0</td>');
                        $('#chart2_03').append('<td id="chart2_' + res.data[i].yearmonth + '_03">0</td>');
                        $('#chart2_04').append('<td id="chart2_' + res.data[i].yearmonth + '_04">0</td>');
                        $('#chart2_monthcount').append('<td id="chart2_' + res.data[i].yearmonth + '_monthcount">0</td>');
                        $('#chart2_monthclosecount').append('<td id="chart2_' + res.data[i].yearmonth + '_monthclosecount">0</td>');
                        $('#chart2_monthCloseRate').append('<td id="chart2_' + res.data[i].yearmonth + '_monthCloseRate">0</td>');
                        $('#chart2_CloseRate').append('<td id="chart2_' + res.data[i].yearmonth + '_CloseRate">0</td>');
                    }
                    switch (res.data[i].QXDJ) {
                        case "01":
                            var c01 = parseInt($('#chart2_' + res.data[i].yearmonth + '_01').html()) + res.data[i].number
                            $('#chart2_' + res.data[i].yearmonth + '_01').html(c01);
                            var c = parseInt($('#chart2_' + res.data[i].yearmonth + '_monthcount').html()) + res.data[i].number
                            $('#chart2_' + res.data[i].yearmonth + '_monthcount').html(c);
                            if (res.data[i].closeState == '关闭') {
                                var cmonthClose = parseInt($('#chart2_' + res.data[i].yearmonth + '_monthclosecount').html()) + res.data[i].number
                                $('#chart2_' + res.data[i].yearmonth + '_monthclosecount').html(cmonthClose);
                            }
                            break;
                        case "02":
                            var c02 = parseInt($('#chart2_' + res.data[i].yearmonth + '_02').html()) + res.data[i].number
                            $('#chart2_' + res.data[i].yearmonth + '_02').html(c02);
                            var c = parseInt($('#chart2_' + res.data[i].yearmonth + '_monthcount').html()) + res.data[i].number
                            $('#chart2_' + res.data[i].yearmonth + '_monthcount').html(c);
                            if (res.data[i].closeState == '关闭') {
                                var cmonthClose = parseInt($('#chart2_' + res.data[i].yearmonth + '_monthclosecount').html()) + res.data[i].number
                                $('#chart2_' + res.data[i].yearmonth + '_monthclosecount').html(cmonthClose);
                            }
                            break;
                        case "03":
                            var c03 = parseInt($('#chart2_' + res.data[i].yearmonth + '_03').html()) + res.data[i].number
                            $('#chart2_' + res.data[i].yearmonth + '_03').html(c03);
                            var c = parseInt($('#chart2_' + res.data[i].yearmonth + '_monthcount').html()) + res.data[i].number
                            $('#chart2_' + res.data[i].yearmonth + '_monthcount').html(c);
                            if (res.data[i].closeState == '关闭') {
                                var cmonthClose = parseInt($('#chart2_' + res.data[i].yearmonth + '_monthclosecount').html()) + res.data[i].number
                                $('#chart2_' + res.data[i].yearmonth + '_monthclosecount').html(cmonthClose);
                            }
                            break;
                        case "04":
                            var c04 = parseInt($('#chart2_' + res.data[i].yearmonth + '_04').html()) + res.data[i].number
                            $('#chart2_' + res.data[i].yearmonth + '_04').html(c04);
                            var c = parseInt($('#chart2_' + res.data[i].yearmonth + '_monthcount').html()) + res.data[i].number
                            $('#chart2_' + res.data[i].yearmonth + '_monthcount').html(c);
                            if (res.data[i].closeState == '关闭') {
                                var cmonthClose = parseInt($('#chart2_' + res.data[i].yearmonth + '_monthclosecount').html()) + res.data[i].number
                                $('#chart2_' + res.data[i].yearmonth + '_monthclosecount').html(cmonthClose);
                            }
                            break;
                    }

                }

                for (x = 0; x < option2.xAxis[0].data.length; x++) {

                    month = option2.xAxis[0].data[x];
                    var monthClose = parseInt($('#chart2_' + month + '_monthclosecount').html());
                    var monthCount = parseInt($('#chart2_' + month + '_monthcount').html());

                    $('#chart2_' + month + '_monthCloseRate').html((parseFloat(monthClose / monthCount) * 100).toFixed(2) + '%');
                    //console.log(parseFloat(monthClose / monthCount).toFixed(4));
                }


            } else {
                $.tips(res.msg, 0);
            }
        });

        $.post(rootUrl + 'NPI/GetChart2Count', {
            beginTime: $('#chart2BeginTime').val(),
            endTime: $('#chart2EndTime').val(),
            wpxh: $('#wpxh').val(),
            yjbb: $('#chart2YJBB').val(),
            rjbb: $('#chart2RJBB').val(),
            xmdm: $('#chart2Xmdm').val(),
            tr: $('#cpjd').val()
        }, function (res) {
            if (res.state) {
                for (x = 0; x < res.data.length; x++) {
                    month = res.data[x].yearmonth;
                    $('#chart2_' + month + '_CloseRate').html((res.data[x].Rate * 100).toFixed(2) + '%');
                    option2.series[0].data.push($('#chart2_' + month + '_monthcount').html());
                    option2.series[1].data.push($('#chart2_' + month + '_monthclosecount').html());
                    var tempMonthCloseRate = $('#chart2_' + month + '_monthCloseRate').html();
                    if (tempMonthCloseRate != undefined) tempMonthCloseRate = tempMonthCloseRate.indexOf('%') > 0 ? tempMonthCloseRate.replace('%', '') : tempMonthCloseRate;
                    //console.log(tempMonthCloseRate);
                    option2.series[2].data.push(tempMonthCloseRate);
                    var tempCloseRate = $('#chart2_' + month + '_CloseRate').html();
                    if (tempCloseRate != undefined) tempCloseRate = tempCloseRate.indexOf('%') > 0 ? tempCloseRate.replace('%', '') : tempCloseRate;
                    //console.log(tempCloseRate);
                    option2.series[3].data.push(tempCloseRate);
                    option2.series[4].data.push(85);
                    myChart2.setOption(option2);
                }
            } else {
                $.tips(res.msg, 0);
            }
        });


    });

    $(document).on('click', '.showTable', function (e) {
        var para = $(this).data('month');
        var html = template('layer-close', {});

        $.content({
            theme: 'blue',
            header: '详情',
            content: {
                html: html,
                width: 1000,
                height: 400,
                
            },
            top:100,
            footer: [{
                text: '关闭',
                style: 'primary',
                callback: function () {

                }
            }],
            onInit: function () {
                $('#closeList').table({
                    url: rootUrl + 'NPI/SearchList',
                    data: function () {
                        return {
                            CPJD: 'TR4,TR4A,TR5,TR6',
                            XMDM: $.trim($('#chart4Xmdm').val().replace("'", "")),
                            CPX: $.trim($('#chart4cpx').val().replace("'", "")),
                            TRDPXJS: para
                        };
                    },
                    tableClass: 'table-condensed',
                    colOptions: [{
                        name: '序号',
                        field: 'Id',
                        width: 50,
                        align: 'center'
                    }, {
                        name: '项目代码',
                        field: 'XMDM',
                        width: 90
                    }, {
                        name: '产品线',
                        field: 'CPX',
                        width: 70
                    }, {
                        name: '缺陷摘要',
                        field: 'ZY',
                        width: 150,
                        handler: function (value, data) {
                            return '<a href="' + rootUrl + 'NPI/Detail?instanceId=' + data.InstanceId + '"  target="_blank">' + data.ZYMini + '</a>';
                        }
                    }, {
                        name: '原因分析',
                        field: 'YYFXExp',
                        width: 250
                    }, {
                        name: '纠正措施实施',
                        field: 'JZCSSSExp',
                        width: 250
                    }, {
                        name: '操作',
                        width: 60,
                        handler: function (value, data) {
                            return '<a href="' + rootUrl + 'NPI/Detail?instanceId=' + data.InstanceId + '" target="_blank">察看</a>';
                        }
                    }],
                    resultVerify: function (res) {
                        return {
                            state: res.state,
                            msg: res.msg
                        }
                    }
                });

                $('#uncloseList').table({
                    url: rootUrl + 'NPI/SearchList',
                    data: function () {
                        return {
                            CPJD: 'TR4,TR4A,TR5,TR6',
                            XMDM: $.trim($('#chart4Xmdm').val().replace("'", "")),
                            CPX: $.trim($('#chart4cpx').val().replace("'", "")),
                            TRDPXJS: '*'+para
                        };
                    },
                    tableClass: 'table-condensed',
                    colOptions: [{
                        name: '序号',
                        field: 'Id',
                        width: 50,
                        align: 'center'
                    }, {
                        name: '项目代码',
                        field: 'XMDM',
                        width: 190
                    }, {
                        name: '产品线',
                        field: 'CPX',
                        width: 70
                    }, {
                        name: '缺陷摘要',
                        field: 'ZY',
                        width: 250,
                        handler: function (value, data) {
                            return '<a href="' + rootUrl + 'NPI/Detail?instanceId=' + data.InstanceId + '"  target="_blank">' + data.ZYMini + '</a>';
                        }
                    }, {
                        name: '原因分析',
                        field: 'YYFXExp',
                        width: 250
                    }, {
                        name: '纠正措施实施',
                        field: 'JZCSSSExp',
                        width: 250
                    }, {
                        name: '操作',
                        width: 60,
                        handler: function (value, data) {
                            return '<a href="' + rootUrl + 'NPI/Detail?instanceId=' + data.InstanceId + '" target="_blank">察看</a>';
                        }
                    }],
                    resultVerify: function (res) {
                        return {
                            state: res.state,
                            msg: res.msg
                        }
                    }
                });
            }
        });
    });
    
    $('#Chart3Query').on('click', function () {
        $('#chart3_X').empty();
        $('#chart3_Y').empty();
        var myChart3 = echarts.init($('#chart3 .echarts-box')[0]);
        var option3 = {
            legend: {
                orient: 'vertical',
                x: 'left',
                data: []
            },
            series: [
                {
                    name: 'NPI缺陷问题类别统计',
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '60%'],
                    data: [

                    ],
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                position: 'outer',
                                formatter: '{b} : {c} ({d}%)'
                            },
                            labelLine: { show: true }
                        }
                    }
                }
            ]
        }
        myChart3.on('click', function (params) {
            
            var qxlb = params.data.key;
            var wpxh = $('#wpxh').val();
            var yjbb = $('#chart3YJBB').val();
            var rjbb = $('#chart3RJBB').val();
            var xmdm = $('#chart3Xmdm').val();
            var tr = $('#chart3cpjd').val();
            var beginMonth = $('#chart3_beginTime').val() + "/01";
            var endMonth = $('#chart3_endTime').val() + "/01";

            window.location = rootUrl + "/npi/index?state=1,3,4,5,6,7&QXLB=" + qxlb + "&yjbb=" + yjbb + "&rjbb=" + rjbb + "&xmdm=" + xmdm + "&cpjd=" + tr + "&beginMonth=" + beginMonth + "&endMonth=" + endMonth;


        });
       


        $.post(rootUrl + 'NPI/GetChart3', {
            beginTime: $('#chart3_beginTime').val(),
            endTime: $('#chart3_endTime').val(),
            wpxh: $('#chart3wpxh').val(),
            yjbb: $('#chart3YJBB').val(),
            rjbb: $('#chart3RJBB').val(),
            xmdm: $('#chart3Xmdm').val(),
            tr: $('#chart3cpjd').val()
        }, function (res) {
            if (res.state) {
                //隐藏加载框
                $('#chart3 .graph-loading').hide();

                if (!res.data || !res.data.length) {

                    $('.table-box .echarts-box').css('display', 'none');
                    $('.chart3Message').show();
                    return false;
                }
                else {
                    $('.table-box .echarts-box').css('display', 'block');
                    $('.chart3Message').css('display', 'none');
                }
                option3.series[0].data = [];
                for (var i = 0; i < res.data.length; i++) {

                    option3.legend.data.push(res.data[i].QXLBExp);

                    var item = {
                        value: res.data[i].number,
                        name: res.data[i].QXLBExp,
                        key:res.data[i].QXLB
                    };
                    option3.series[0].data.push(item);
                }

                myChart3.setOption(option3);

            } else {
                $.tips(res.msg, 0);
            }
        });

        $.post(rootUrl + 'NPI/GetChart3Table', {
            beginTime: $('#chart3_beginTime').val(),
            endTime: $('#chart3_endTime').val(),
            wpxh: $('#chart3wpxh').val(),
            yjbb: $('#chart3YJBB').val(),
            rjbb: $('#chart3RJBB').val(),
            xmdm: $('#chart3Xmdm').val(),
            tr: $('#chart3cpjd').val()
        }, function (res) {
            if (res.state) {
                var x = [];
                var y = [];


                $('#chart3_X').append('<th>问题类别</th>');
                for (var i = 0; i < res.data.length; i++) {
                    if (!x.contains(res.data[i].yearmonth)) {
                        $('#chart3_X').append('<th >' + res.data[i].yearmonth + '</th>');
                        x.push(res.data[i].yearmonth)
                    }
                    if (!y.contains(res.data[i].QXLB)) {
                        y.push(res.data[i].QXLB)
                    }

                }
                for (i = 0; i < y.length; i++) {
                    var tdString = '<td id="chart3_' + y[i] + '"></td>';
                    for (j = 0; j < x.length; j++) {
                        tdString += '<td id="chart3_' + x[j] + '_' + y[i] + '">0</td>';
                    }
                    $('#chart3_Y').append('<tr>' + tdString + '</tr>');
                }


                for (var x = 0; x < res.data.length; x++) {
                    $('#chart3_' + res.data[x].QXLB).html(res.data[x].QXLBExp);
                    $('#chart3_' + res.data[x].yearmonth + '_' + res.data[x].QXLB).html(res.data[x].number);
                }

            } else {
                $.tips(res.msg, 0);
            }
        });

    });

    $('#Chart4Query').on('click', function () {

       

        $('#chart4_X').empty();
        //$('#chart4_Y').empty();
        $('#chart4_01').empty();
        $('#chart4_02').empty();
        $('#chart4_03').empty();
        $('#chart4_04').empty();
        $('#chart4_05').empty();
        $('#chart4_06').empty();
        $('#chart4_X').append('<th>时间</th>')
        $('#chart4_01').append('<td>关闭及时率</td>');
        $('#chart4_02').append('<td >缺陷累计关闭数</td>');
        $('#chart4_03').append('<td >累计到期未关闭数</td>');
        $('#chart4_04').append('<td >累计到期应关闭数</td>');
        $('#chart4_05').append('<td >目标值</td>');
        $('#chart4_06').append('<td >挑战值</td>');
        var myChart4 = echarts.init($('#chart4 .echarts-box')[0]);
        var option4 = {
            legend: {
                show: true,
                data: ['缺陷累计及时关闭率', '目标值', '挑战值'],
                //orient: 'vertical',
                //x: 'right',
                y: 'bottom'
            },
            tooltip: {
                trigger: 'axis',
                formatter: '{b}<br>{a0} : {c0}<br>{a1} : {c1}<br>{a2} : {c2}%'
            },
            xAxis: [
                {
                    type: 'category',
                    data: []
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    splitNumber: 10,
                    axisLabel: {
                        formatter: function (value) {
                            return value + '%';
                        }
                    }
                }
            ],
            series: [
                {
                    name: '缺陷累计及时关闭率',
                    type: 'line',
                    data: [],
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                formatter: '{c}%'
                            }
                        }
                    }
                },
                {
                    name: '目标值',
                    type: 'line',
                    data: [],
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                formatter: '{c}%'
                            }
                        }
                    }
                },
                {
                    name: '挑战值',
                    type: 'line',
                    data: [],
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                formatter: '{c}%'
                            }
                        }
                    }
                }
            ]
        }
       
        $.post(rootUrl + 'NPI/GetChart4', {
            beginTime: $('#chart4BeginTime').val(),
            endTime: $('#chart4EndTime').val(),
            cpx: $('#chart4cpx').val(),
            xmdm: $('#chart4Xmdm').val()
        }, function (res) {
            if (res.state) {
                //隐藏加载框
                $('#chart4 .graph-loading').hide();

                if (!res.data || !res.data.length) {

                    $('.table-box .echarts-box').css('display', 'none');
                    $('.chart4Message').show();
                    return false;
                }
                else {
                    $('.table-box .echarts-box').css('display', 'block');
                    $('.chart4Message').css('display', 'none');
                }


                for (var i = 0; i < res.data.length; i++) {
                    if (!option4.xAxis[0].data.contains(res.data[i].yearmonth)) {
                        option4.xAxis[0].data.push(res.data[i].yearmonth);
                        $('#chart4_X').append('<th>' + res.data[i].yearmonth + '</th>');
                        $('#chart4_01').append('<td class="showTable" style="text-decoration: underline; cursor: pointer; " data-month="' + res.data[i].yearmonth + '" id="chart4_' + res.data[i].yearmonth + '_01">0</td>');
                        $('#chart4_02').append('<td class="showTable" style="text-decoration: underline; cursor: pointer; " data-month="' + res.data[i].yearmonth + '" id="chart4_' + res.data[i].yearmonth + '_02">0</td>');
                        $('#chart4_03').append('<td class="showTable" style="text-decoration: underline; cursor: pointer; " data-month="' + res.data[i].yearmonth + '" id="chart4_' + res.data[i].yearmonth + '_03">0</td>');
                        $('#chart4_04').append('<td class="showTable" style="text-decoration: underline; cursor: pointer; " data-month="' + res.data[i].yearmonth + '" id="chart4_' + res.data[i].yearmonth + '_04">0</td>');
                        $('#chart4_05').append('<td class="showTable" style="text-decoration: underline; cursor: pointer; " data-month="' + res.data[i].yearmonth + '" id="chart4_' + res.data[i].yearmonth + '_05">' + chart4Value1 + '</td>');
                        $('#chart4_06').append('<td class="showTable" style="text-decoration: underline; cursor: pointer; " data-month="' + res.data[i].yearmonth + '" id="chart4_' + res.data[i].yearmonth + '_06">' + chart4Value2 + '</td>');
                    }

                    
                    $('#chart4_' + res.data[i].yearmonth + '_02').html(res.data[i].number);
                    $('#chart4_' + res.data[i].yearmonth + '_03').html(res.data[i].Rate-res.data[i].number);
                    $('#chart4_' + res.data[i].yearmonth + '_04').html(res.data[i].Rate);
                   
                }

                for (x = 0; x < option4.xAxis[0].data.length; x++) {

                    month = option4.xAxis[0].data[x];
                    var monthClose = parseInt($('#chart4_' + month + '_02').html());
                    var monthCount = parseInt($('#chart4_' + month + '_04').html());
                    console.log(monthClose / monthCount);
                    $('#chart4_' + month + '_01').html((parseFloat(monthClose / (monthCount )) * 100).toFixed(2) + '%');
                    option4.series[0].data.push((parseFloat(monthClose / (monthCount)) * 100).toFixed(2));
                    option4.series[1].data.push(chart4Value1);
                    option4.series[2].data.push(chart4Value2);
                    //console.log(parseFloat(monthClose / monthCount).toFixed(4));
                }
                myChart4.setOption(option4);
                myChart4.on('click', function (params) {
                    console.log(params);
                    var month = params.name;
                    var cpx = $('#chart4cpx').val();
                    var xmdm = $('#chart4Xmdm').val();
                    window.location = rootUrl + "npi/index?TRDPXJS=" + month + "&level=All&cpjd=TR4,TR4A,TR5,TR6" + "&XMDM=" + xmdm + "&CPX=" + cpx;


                });
            } else {
                $.tips(res.msg, 0);
            }
        });

        

    });


    $('#Chart1Query').click();
    $('#Chart2Query').click();
    $('#Chart3Query').click();
    $('#Chart4Query').click();

   

    Array.prototype.contains = function (item) {
        return RegExp(item).test(this);
    };

    $('#chart4Xmdm').autoComplete({
        async: {
            url: 'http://webapi.maipu.com/Selector/Project/GetProjectCodes',
            dataType: 'jsonp',
            dataField: null
        },
        maxNum: 10,
        width: 400,
        template: '<td>#{segment1}</td><td>#{description}</td>',
        callback: function (data) {
            $('#chart4Xmdm').val(data.description).data('data', data);

        }
    });

    $('#chart3Xmdm').autoComplete({
        async: {
            url: 'http://webapi.maipu.com/Selector/Project/GetProjectCodes',
            dataType: 'jsonp',
            dataField: null
        },
        maxNum: 10,
        width: 400,
        template: '<td>#{segment1}</td><td>#{description}</td>',
        callback: function (data) {
            $('#chart3Xmdm').val(data.description).data('data', data);

        }
    });
    $('#chart2Xmdm').autoComplete({
        async: {
            url: 'http://webapi.maipu.com/Selector/Project/GetProjectCodes',
            dataType: 'jsonp',
            dataField: null
        },
        maxNum: 10,
        width: 400,
        template: '<td>#{segment1}</td><td>#{description}</td>',
        callback: function (data) {
            $('#chart2Xmdm').val(data.description).data('data', data);

        }
    });
    
   
})