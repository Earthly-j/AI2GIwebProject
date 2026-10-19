package jp.kurologi.web;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jp.kurologi.model.MemberType;
import jp.kurologi.service.AccountService.UpdateForm;
import jp.kurologi.service.ValidationException;

/** 계정관리 — GET 화면, POST 정보수정, POST /withdraw 탈퇴. */
@WebServlet({"/mypage/account", "/mypage/account/withdraw"})
public class AccountServlet extends BaseServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        render(req, res, "mypage/account");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        if (req.getServletPath().endsWith("/withdraw")) {
            withdraw(req, res);
            return;
        }
        UpdateForm form = new UpdateForm(
                req.getParameter("englishName"),
                req.getParameter("newPassword"),
                req.getParameter("newPasswordConfirm"),
                req.getParameter("phone"),
                req.getParameter("smsRefuse") != null,
                "BUSINESS".equals(req.getParameter("memberType")) ? MemberType.BUSINESS : MemberType.PERSONAL);
        try {
            app().accounts.update(member(req), form);
            Session.flash(req, "info", "회원정보가 수정되었습니다.");
            redirect(req, res, "/mypage/account");
        } catch (ValidationException e) {
            req.setAttribute("errors", e.getFieldErrors());
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            render(req, res, "mypage/account");
        }
    }

    private void withdraw(HttpServletRequest req, HttpServletResponse res) throws IOException {
        try {
            app().accounts.withdraw(member(req));
            Session.logout(req);
            redirect(req, res, "/?withdrawn=1#loginForm");
        } catch (ValidationException e) {
            Session.flash(req, "error", e.getMessage());
            redirect(req, res, "/mypage/account");
        }
    }
}
