package jp.kurologi.web;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jp.kurologi.model.Member;

/** 마이페이지 서블릿 공통 — AuthFilter 를 지난 뒤이므로 로그인 회원이 항상 있습니다. */
abstract class BaseServlet extends HttpServlet {

    protected App app() {
        return App.of(getServletContext());
    }

    protected Member member(HttpServletRequest req) {
        return app().members.findById(Session.memberId(req)).orElseThrow();
    }

    /** 회원 요약 바(account · payment 상단)에 필요한 값까지 넣고 JSP 로 넘깁니다. */
    protected void render(HttpServletRequest req, HttpServletResponse res, String view)
            throws ServletException, IOException {
        Member m = member(req);
        req.setAttribute("member", m);
        req.setAttribute("unpaidCount", app().payments.pendingCharges(m.getId()).size());
        req.getRequestDispatcher("/WEB-INF/views/" + view + ".jsp").forward(req, res);
    }

    protected void redirect(HttpServletRequest req, HttpServletResponse res, String path) throws IOException {
        res.sendRedirect(req.getContextPath() + path);
    }

    protected static long parseLong(String s, long fallback) {
        try {
            return s == null ? fallback : Long.parseLong(s.trim());
        } catch (NumberFormatException e) {
            return fallback;
        }
    }
}
