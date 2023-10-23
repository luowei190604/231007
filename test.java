
package com.byd.performance.luban.application.config;

import com.alibaba.fastjson.JSONObject;
import com.byd.performance.luban.application.util.RSAUtil;
import com.byd.performance.luban.application.vo.LoginInfo;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;

@Slf4j
public class TokenInterceptor implements HandlerInterceptor {

    private static final String EXCLUDE_STR_SUFFIX = ".js;.html;.css;.png;.jpg;.icon;.woff2;*.gif";
    private LoginInfoHolder holder = LoginInfoHolder.getInstance();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        HttpServletRequest httpServletRequest = (HttpServletRequest)request;
        HttpServletResponse httpServletResponse = (HttpServletResponse)response;
        String requestURI = httpServletRequest.getRequestURI();
        log.debug("request uri is: {}",requestURI);
        if(!isWhiteRequest(httpServletRequest,httpServletResponse)) {
            if (!judgeToken(httpServletRequest)) {
                response.sendRedirect(request.getServletContext().getContextPath() + "/login");
                return false;
            }
        }
        return true;
    }


    private boolean isStaticResource(HttpServletRequest req) {
        String[] suffixArr = EXCLUDE_STR_SUFFIX.split(";");
        String requestURI = req.getRequestURI();
        for (String suffix : suffixArr) {
            if (requestURI.endsWith(suffix)) {
                return true;
            }
        }
        return false;
    }


    private boolean isWhiteRequest(HttpServletRequest req,HttpServletResponse res) throws IOException {
//        if(req.getRequestURI().endsWith(".html")) {
//            logHeader(req);
//        }

        if(isStaticResource(req) || postForLogin(req) || postForRegistry(req)
                || loginPage(req) || indexPage(req)) {
            return true;
        }

        return false;
    }

//    private void logHeader(HttpServletRequest req) {
//        Enumeration<String> headerNames = req.getHeaderNames();
//        StringJoiner joiner = new StringJoiner(";");
//        while (headerNames.hasMoreElements()) {
//            String headerName = headerNames.nextElement();
//            joiner.add(headerName);
//        }
//        log.info("请求路径:{},携带请求头是:{}",req.getRequestURI(),joiner.toString());
//    }

    private boolean postForLogin(HttpServletRequest req) throws IOException {
        String requestURI = req.getRequestURI();
        String method = req.getMethod();
        return method.equalsIgnoreCase("POST")
                && requestURI.equals("/userInfo/login");
    }

    private boolean postForRegistry(HttpServletRequest req) throws IOException {
        String requestURI = req.getRequestURI();
        String method = req.getMethod();
        return method.equalsIgnoreCase("POST")
                && requestURI.equals("/userInfo/registryUserInfo");
    }

    private boolean loginPage(HttpServletRequest req) {
        return req.getRequestURI().equals("/login");
    }

    private boolean indexPage(HttpServletRequest req) {
        return req.getRequestURI().equals("/index");
    }


    private boolean judgeToken(HttpServletRequest req) {
        String token = req.getHeader("token");
        if (Objects.nonNull(token)) {
            try {
                String decryptionToken = RSAUtil.decrypt1(token);
                LoginInfo loginInfo = JSONObject.parseObject(decryptionToken, LoginInfo.class);
                if (Objects.nonNull(loginInfo) && Objects.nonNull(loginInfo.getUserId()) && StringUtils.isNoneBlank(loginInfo.getEncryptionToken())) {
                    LoginInfo cacheLoginInfo = holder.loginInfo(loginInfo.getUserId());
                    boolean tokenHeaderJudge = Objects.nonNull(cacheLoginInfo) && cacheLoginInfo.getEncryptionToken().equals(loginInfo.getEncryptionToken());
                    if (tokenHeaderJudge) {
                        loginInfo.setLastHandleTime(new Date().getTime());
                        holder.addLoginInfo(loginInfo);
                    }
                    return  tokenHeaderJudge;
                }

            } catch (Exception e) {
                return false;
            }
        }
        return false;

//        String userId = req.getHeader("userId");
//        String encryptionToken = req.getHeader("encryptionToken");
//        if(Objects.nonNull(userId) && StringUtils.isNoneBlank(encryptionToken)) {
//            LoginInfo loginInfo = holder.loginInfo(userId);
//            boolean tokenHeaderJudge = Objects.nonNull(loginInfo) && loginInfo.getEncryptionToken().equals(encryptionToken);
//            if (tokenHeaderJudge) {
//                loginInfo.setLastHandleTime(new Date().getTime());
//                holder.addLoginInfo(loginInfo);
//            }
//            return  tokenHeaderJudge;
//        }
//
//        String parameterToken = "";
//        String parameterUserId = "";
//        Map<String, String[]> parameterMap = req.getParameterMap();
//        Set<Map.Entry<String, String[]>> entries = parameterMap.entrySet();
//        for (Map.Entry<String, String[]> entry : entries) {
//            String parameterName = entry.getKey();
//            String[] values = entry.getValue();
//            if (parameterName.equals("userId")) {
//                parameterUserId = values[0];
//            }
//            if(parameterName.equals("encryptionToken")) {
//                parameterToken = values[0];
//            }
//        }
//
//        return StringUtils.isNoneBlank(parameterUserId)
//                && StringUtils.isNoneBlank(parameterToken)
//                && Objects.nonNull(holder.loginInfo(parameterUserId))
//                && holder.loginInfo(parameterUserId).getEncryptionToken().equals(parameterToken);
    }
}
