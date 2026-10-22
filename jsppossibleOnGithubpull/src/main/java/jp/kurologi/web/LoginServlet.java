package jp.kurologi.web;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Optional;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jp.kurologi.model.Member;
import jp.kurologi.service.PasswordHasher;

/** 홈 화면 로그인 상자 — POST loginId, password, saveId(아이디저장). */
@WebServlet("/login")
public class LoginServlet extends HttpServlet {

    static final String SAVED_ID_COOKIE = "savedId";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.sendRedirect(req.getContextPath() + "/#loginForm");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String loginId = req.getParameter("loginId") == null ? "" : req.getParameter("loginId").trim();
        String password = req.getParameter("password");
        App app = App.of(getServletContext());

        Optional<Member> found = app.members.findByLoginId(loginId)
                .filter(m -> PasswordHasher.matches(password, m.getPasswordHash()));
        if (found.isEmpty()) {
            // 아이디가 틀렸는지 비밀번호가 틀렸는지는 알려주지 않습니다
            res.sendRedirect(req.getContextPath() + "/?loginError=1#loginForm");
            return;
        }

        Member m = found.get();
        Session.login(req, m.getId());
        m.setLastLoginAt(LocalDateTime.now());
        app.members.save(m);

        Cookie cookie = new Cookie(SAVED_ID_COOKIE, URLEncoder.encode(loginId, StandardCharsets.UTF_8));
        cookie.setPath(req.getContextPath().isEmpty() ? "/" : req.getContextPath());
        cookie.setHttpOnly(true);
        cookie.setMaxAge(req.getParameter("saveId") != null ? 60 * 60 * 24 * 30 : 0);   // 30일 / 삭제
        res.addCookie(cookie);

        res.sendRedirect(req.getContextPath() + "/mypage");
    }
}
