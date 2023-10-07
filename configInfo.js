/**
 * 配置列表
 */
function configInfo(table) {
    beforeFunction();
    table.render({
        elem: '#contentPane',
        url: '/luBanConfig/pageConfigWithScene',
        page: true,
        method: 'post',
        limit: 10,
        headers: {
            "Content-Type":"application/x-www-form-urlencoded;charset=UTF-8",
            // "userId":window.localStorage.getItem("userId"),
            // "encryptionToken":window.localStorage.getItem("encryptionToken")
            "token":window.localStorage.getItem("token"),
        },
        toolbar:'#toolbarDemo',
        defaultToolbar: ['filter'],
        limits: [10,20,40],
        parseData:function(res) {
            return {
                "code": res.data.code, //解析接口状态
                "msg": res.data.message, //解析提示文本
                "count": res.data.count, //解析数据长度
                "data": res.data.data //解析数据列表
            };
        },
        cols: [
            [
                { title: '序号', type: 'numbers' },
                {field: 'appCode', title: 'appCode', sort: true},
                {field: 'configName', title: '配置名称', sort: true},
                {field: 'status', title: '状态', sort: true,templet:function(d) {
                        if(d.status ==='0') {
                            return "启用";
                        }
                        if (d.status === '1') {
                            return "不启用";
                        }
                    }},
                {field: 'constant', title: '类型', sort: true,
                    templet:function(d) {
                        if(d.constant ==='JAVA_METHOD') {
                            return "java方法";
                        }
                        if (d.constant === 'DUBBO_METHOD') {
                            return "dubbo方法";
                        }
                        if (d.constant === 'HTTP_METHOD') {
                            return "http方法";
                        }
                    }
                },
                {title: '匹配场景', templet : function(val) {
                        return val.sceneDes + "(" + val.sceneHeader + ")";
                    }},
                {field: 'updateTime', title: '修改时间', sort: true,templet:function (val) {
                        return timeTransfer(val.updateTime);
                    }},
                {tile: '操作',fixed: 'right', align:'center', toolbar: '#configInfoBar'}
            ]
        ]
    });
}

/**
 * 删除配置信息
 *
 * @param id 主键
 * @param type 类型
 * @param index 下标
 */
function deleteConfig(id,type,index) {
    beforeFunction();
    var url = '/luBanConfig/delete?id=' +id + "&type=" + type;
    asyncGet(url,'',function(data) {
        if(data.code === 0) {
            location.reload();//刷新父页面，注意一定要在关闭当前iframe层之前执行刷新
            parent.layer.close(index); //再执行关闭
        } else {
            layer.msg("删除失败:" + data.msg,{icon: 1,time:2000})
        }
    },'')
}

/**
 * 配置详情&修改
 * @param data
 * @param isEdit
 */
function detailOrEdit(data,isEdit) {
    beforeFunction();
    layer.open({
        type:2,
        area:  ['800px', '600px'],
        content: 'configView.html',
        anim:1,
        closeBtn:2,
        cancel:function (index,layero) {
            console.info(index);
            console.info(layero);
        },
        success: function (layero, index) {
            let body = layer.getChildFrame('body', index);
            iframe = layero.find('iframe')[0].contentWindow;
            if (data.constant === 'JAVA_METHOD') {
                body.find("#javaMethodConfig").show();
            } else {
                body.find("#httpMethodConfig").show();
            }

            for(var fieldName in data) {
                echoVal(body,fieldName,data,isEdit);
            }
            iframe.layui.form.render('select');

            // 如果是修改，显示提交按钮
            body.contents().find("#configRest").hide();
            if (isEdit) {
                body.contents().find("#configSubmit").show();
            } else {
                body.contents().find("#configSubmit").hide();
            }
        }
    });
}

/**
 * 添加配置
 */
function addConfigView() {
    beforeFunction();
    layer.open({
        type:2,
        area:  ['800px', '600px'],
        content: 'configView.html',
        anim:1,
        closeBtn:2,
        cancel:function (index,layero) {
            console.info(index);
            console.info(layero);
        }
    });
}

/**
 * 按条件搜索配置信息
 *
 * @param isClear
 */
function reloadConfig(isClear) {
    beforeFunction();
    //这里使用layui.table.reload来重载表格，第一个question_list是之前创建表格
    //写配置的时候配置的id也是elem上面那个，然后输入where里面的内容
    //layui就会吧筛选的数据发送给后端，后端处理完之后再返回结果，自动渲染到表格里面
    if (isClear) {
        document.getElementById("config-appCode").value = '';
        document.getElementById("config-configName").value='';
        selectReset("config-type");
        selectReset("config-status");
        form.render('select');

        $('#config-className-container').hide();
        $('#config-methodName-container').hide();
        $('#config-hostAddress-container').hide();
        $('#config-uri-container').hide();
        document.getElementById("config-type").value = '';
    }
    layui.table.reload('content-pane', {
        where: {
            //下面的document.getElementById都是绑定的上面的input直接拿数据
            "appCode": document.getElementById("config-appCode").value,
            "configName": document.getElementById("config-configName").value,
            "status": document.getElementById("config-status").value,
            "type": document.getElementById("config-type").value,

            "className": document.getElementById("config-className").value,
            "methodName": document.getElementById("config-methodName").value,
            "hostAddress": document.getElementById("config-hostAddress").value,
            "uri": document.getElementById("config-uri").value
        }
    });
}


/**
 * 初始化下拉元素
 *
 * @param domElement dom元素
 * @param url 后台接口地址
 * @param desField 显示字段
 * @param valField 显示值
 */
function initDomElementSelect(domElement,url,desField,valField) {
    let listData = syncPost(url);
    for (let value of listData) {
        domElement.append(new Option(value[desField],value[valField]));// 下拉菜单里添加元素
    }

    layui.form.render("select");//重新渲染 固定写法
}


/**
 * 初始化下拉元素带值显示
 *
 * @param domElement dom元素
 * @param url 后台接口地址
 */
function initDomElementSelectWithVal(domElement,url) {
    let listData = syncPost(url);
    // $.each(listData, function (index, value) {
    //     // console.log(value.department_id);
    //     let desVal = value.sceneDes + "(" + value.sceneHeader + ")";
    //     let transVal = value.id;
    //     domElement.append(new Option(desVal ,transVal));// 下拉菜单里添加元素
    // });
    for (let value of listData) {
        let desVal = value.sceneDes + "(" + value.sceneHeader + ")";
        let transVal = value.id;
        domElement.append(new Option(desVal ,transVal));// 下拉菜单里添加元素
    }

    layui.form.render("select");//重新渲染 固定写法
}

/**
 * 时间转换
 *
 * @param sourceTime
 * @returns {string}
 */
function timeTransfer(sourceTime) {
    var date = new Date(sourceTime);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate()) + ' ';
    var h = (date.getHours() < 10 ? '0'+date.getHours() : date.getHours()) + ':';
    var m = (date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes()) + ':';
    var s = (date.getSeconds() < 10 ? '0'+date.getSeconds() : date.getSeconds());
    return Y+M+D+h+m+s;
}
