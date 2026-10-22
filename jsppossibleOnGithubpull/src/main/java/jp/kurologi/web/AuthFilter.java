package jp.kurologi.web;

import java.io.IOException;
import java.time.LocalDateTime;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 마이페이지는 로그인한 회원만 볼 수 있습니다.
 *
 * 로그인하지 않았으면 홈 화면 로그인 상자로 보냅니다 (LoginServlet).
 * 개발 중 매번 로그인하기 귀찮으면 web.xml 의 kurologi.devAutoLogin 을 true 로 —
 * 데모 회원(user_id)으로 자동 로그인합니다. 운영에서는 반드시 false.
 */
@WebFilter(urlPatterns = {"/mypage", "/mypage/*"})
public class AuthFilter extends HttpFilter {

    @Override
    protected void doFilter(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        if (Session.memberId(req) == null
                && Boolean.parseBoolean(getServletContext().getInitParameter("kurologi.devAutoLogin"))) {
            App.of(getServletContext()).members.findByLoginId("user_id").ifPresent(m -> {
                Session.login(req, m.getId());
                m.setLastLoginAt(LocalDateTime.now());
            });
        }
        Long memberId = Session.memberId(req);
        if (memberId == null || App.of(getServletContext()).members.findById(memberId).isEmpty()) {
            res.sendRedirect(req.getContextPath() + "/?login=required#loginForm");
            return;
        }
        chain.doFilter(req, res);
    }
}
