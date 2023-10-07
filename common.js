// let globalConfig = {};

/**
 * 数据回显公共方法
 *
 * @param parentDom 父元素
 * @param fieldName 需要回显的字段名称
 * @param data 一行数据
 * @param isEdit 是否可修改
 */
function echoVal(parentDom,fieldName,data,isEdit) {
    let inputValSelector = "input[name=" + fieldName + "]";
    let selectDomSelector = "select[name=" + fieldName + "]";
    let textAreaDomSelector = "textarea[name=" + fieldName + "]";
    parentDom.find(inputValSelector).val(data[fieldName]);
    parentDom.find(selectDomSelector).val(data[fieldName]);
    parentDom.find(textAreaDomSelector).val(data[fieldName]);

    if (!isEdit) {
        parentDom.find(inputValSelector).attr('disabled','true');
        parentDom.find(selectDomSelector).attr('disabled','true');
        parentDom.find(textAreaDomSelector).attr('disabled','true');
    }
}

function requestWithReturn(uri,type,requestData) {
    $.ajax({
        url: uri,
        dataType: 'json',
        type: type,
        data: requestData,
        success: function (data) {
            if(data.code === 0) {
                return data.data;
            }
        },
        error:function() {
            return '';
        }
    })
}

function syncGet(uri,isJson) {
    let request = new XMLHttpRequest();
    // 2、建立连接
    // true:请求为异步  false:同步
    request.open("GET", uri, false);
    // request.setRequestHeader("userId",window.localStorage.getItem("userId"));
    // request.setRequestHeader("encryptionToken",window.localStorage.getItem("encryptionToken"));
    request.setRequestHeader("token",window.localStorage.getItem("token"));
    request.send();
    if(request.status === 200) {
        let resSource = request.responseText;
        if (judgeJsonType(resSource)) {
            let response  = JSON.parse(request.responseText);
            if(response.code === 0 ) {
                return response.data;
            }
        } else {
            window.parent.location.href="/login";
        }
    }
    return '';
}


function syncPost(uri,webRequest) {
    let request = new XMLHttpRequest();
    // 2、建立连接
    // true:请求为异步  false:同步
    request.open("POST", uri, false);
    request.setRequestHeader("Content-Type", "application/json");
    // request.setRequestHeader("userId",window.localStorage.getItem("userId"));
    // request.setRequestHeader("encryptionToken",window.localStorage.getItem("encryptionToken"));
    request.setRequestHeader("token",window.localStorage.getItem("token"));
    request.send(webRequest);
    if(request.status === 200) {
        if(judgeJsonType(request.responseText)) {
            let response  = JSON.parse(request.responseText);
            if(response.code === 0 ) {
                return response.data;
            }
        } else {
            window.parent.location.href="/login";
        }
    }
    return '';
}

function asyncGet(url, query, succCb, failCb, isJson) {
    // 拼接url加query
    if (query) {
        var parms = tools.formatParams(query);
        url += '?' + parms;
        // console.log('-------------',url);
    }

    // 1、创建对象
    var ajax = new XMLHttpRequest();
    // 2、建立连接
    // true:请求为异步  false:同步
    ajax.open("GET", url, true);
    // ajax.setRequestHeader("userId",window.localStorage.getItem("userId"));
    // ajax.setRequestHeader("encryptionToken",window.localStorage.getItem("encryptionToken"));
    ajax.setRequestHeader("token",window.localStorage.getItem("token"));

    // // 响应类型
    // ajax.setRequestHeader('Access-Control-Allow-Methods', '*');
    // // 响应头设置
    // ajax.setRequestHeader('Access-Control-Allow-Headers', 'x-requested-with,content-type');
    // ajax.withCredentials = true;
    // 3、发送请求
    ajax.send(null);

    // 4、监听状态的改变
    ajax.onreadystatechange = function () {
        if (ajax.readyState === 4) {
            if (ajax.status === 200) {
                // 用户传了回调才执行
                // isJson默认值为true，要解析json
                if (isJson === undefined) {
                    isJson = true;
                }
                isJson = judgeJsonType(ajax.responseText);
                if(isJson) {
                    var res = isJson ? JSON.parse(ajax.responseText == "" ? '{}' : ajax.responseText) : ajax.responseText;
                    succCb && succCb(res);
                } else {
                    window.parent.location.href="/login";
                }

            } else {
                // 请求失败
                failCb && failCb();
            }
        }
    }
}

function asyncPost(url, webRequest, succCb, failCb, isJson) {
    var xhr = null;
    if (XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhr.open("post", url, true);
    // 设置请求头  需在open后send前
    // 这里的CSRF需自己取后端获取，下面给出获取代码
    // xhr.setRequestHeader("X-CSRFToken", CSRF);
    xhr.setRequestHeader("Content-Type", "application/json");
    // xhr.send(JSON.stringify(webRequest));
    // xhr.setRequestHeader("userId",window.localStorage.getItem("userId"));
    // xhr.setRequestHeader("encryptionToken",window.localStorage.getItem("encryptionToken"));
    xhr.setRequestHeader("token",window.localStorage.getItem("token"));
    xhr.send(webRequest);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                // 判断isJson是否传进来了
                isJson = isJson === undefined ? true : isJson;
                if(judgeJsonType(xhr.responseText)) {
                    succCb && succCb(isJson ? JSON.parse(xhr.responseText) : xhr.responseText);
                } else {
                    // document.write(xhr.responseText);
                    window.parent.location.href = "/login";
                }
                // succCb && succCb(isJson ? JSON.parse(xhr.responseText) : xhr.responseText);
            } else {
                // 请求失败
                failCb && failCb();
            }
        }
    }
}

function formatJsonForNotes(json, options) {
    var reg = null,
        formatted = '',
        pad = 0,
        PADDING = '  '; // （缩进）可以使用'\t'或不同数量的空格
    // 可选设置
    options = options || {};
    // 在 '{' or '[' follows ':'位置移除新行
    options.newlineAfterColonIfBeforeBraceOrBracket = (options.newlineAfterColonIfBeforeBraceOrBracket === true) ? true : false;
    // 在冒号后面加空格
    options.spaceAfterColon = (options.spaceAfterColon === false) ? false : true;
    // 开始格式化...
    if (typeof json !== 'string') {
        // 确保为JSON字符串
        json = JSON.stringify(json);
    } else {
        //已经是一个字符串，所以解析和重新字符串化以删除额外的空白
        json = JSON.parse(json);
        json = JSON.stringify(json);
    }
    // 在花括号前后添加换行
    reg = /([\{\}])/g;
    json = json.replace(reg, '\r\n$1\r\n');
    // 在方括号前后添加新行
    reg = /([\[\]])/g;
    json = json.replace(reg, '\r\n$1\r\n');
    // 在逗号后添加新行
    reg = /(\,)/g;
    json = json.replace(reg, '$1\r\n');
    // 删除多个换行
    reg = /(\r\n\r\n)/g;
    json = json.replace(reg, '\r\n');
    // 删除逗号前的换行
    reg = /\r\n\,/g;
    json = json.replace(reg, ',');
    // 可选格式...
    if (!options.newlineAfterColonIfBeforeBraceOrBracket) {
        reg = /\:\r\n\{/g;
        json = json.replace(reg, ':{');
        reg = /\:\r\n\[/g;
        json = json.replace(reg, ':[');
    }
    if (options.spaceAfterColon) {
        reg = /\:/g;
        json = json.replace(reg, ': ');
    }
    $.each(json.split('\r\n'), function(index, node) {
        var i = 0,
            indent = 0,
            padding = '';
        if (node.match(/\{$/) || node.match(/\[$/)) {
            indent = 1;
        } else if (node.match(/\}/) || node.match(/\]/)) {
            if (pad !== 0) {
                pad -= 1;
            }
        } else {
            indent = 0;
        }
        for (i = 0; i < pad; i++) {
            padding += PADDING;
        }
        formatted += padding + node + '\r\n';
        pad += indent;
    });
    return formatted;
}

function judgeJsonType(str) {
    if(typeof str === 'object') {
        return true;
    }
    try {
        const toObj = JSON.parse(str); // json字符串转对象
        /*
            判断条件 1. 排除null可能性
                     2. 确保数据是对象或数组
        */
        if (toObj && typeof toObj === 'object') {
            return true
        }
    } catch {}
    return false
}

function beforeFunction() {
    let uri = "/token/tokenValidate";
    asyncPost(uri,'');
}

function exceptionTest() {
    let uri = "/token/exceptionTest";
    asyncPost(uri,'');
}