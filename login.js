/**
 * 给dom元素生成验证码
 *
 * @param domElement dom元素
 */
function createCode(domElement) {
    var code = "";
    // 验证码长度
    var codeLength = 4;
    // 验证码dom元素
    // 验证码随机数
    var random = [0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R',
        'S','T','U','V','W','X','Y','Z'];
    for (var i = 0;i < codeLength; i++){
        // 随机数索引
        var index = Math.floor(Math.random()*36);
        code += random[index];
    }
    // 将生成的随机验证码赋值
    domElement.value= code;
}