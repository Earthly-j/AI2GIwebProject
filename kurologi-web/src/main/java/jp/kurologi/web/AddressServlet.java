package jp.kurologi.web;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jp.kurologi.model.Address;
import jp.kurologi.service.ValidationException;

/** 주소관리 — GET 목록(?field=name|address&q=&page=), POST action=save|delete. */
@WebServlet("/mypage/address")
public class AddressServlet extends BaseServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        list(req, res);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        long memberId = member(req).getId();
        try {
            if ("delete".equals(req.getParameter("action"))) {
                app().addresses.delete(memberId, parseLong(req.getParameter("id"), 0));
                Session.flash(req, "info", "주소를 삭제했습니다.");
            } else {
                Address form = new Address();
                form.setId(parseLong(req.getParameter("id"), 0));
                form.setName(req.getParameter("name"));
                form.setZipcode(req.getParameter("zipcode"));
                form.setAddress1(req.getParameter("address1"));
                form.setAddress2(req.getParameter("address2"));
                form.setCountry(req.getParameter("country"));
                form.setPhone(req.getParameter("phone"));
                form.setCustomsCode(req.getParameter("customsCode"));
                try {
                    app().addresses.save(memberId, form);
                } catch (ValidationException e) {
                    // 입력값을 지우지 않도록 리다이렉트하지 않고 대화상자를 다시 열어 보여줍니다.
                    req.setAttribute("errors", e.getFieldErrors());
                    req.setAttribute("form", form);
                    res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    list(req, res);
                    return;
                }
                Session.flash(req, "info", form.getId() == 0 ? "새 주소를 추가했습니다." : "주소를 수정했습니다.");
            }
        } catch (ValidationException e) {
            Session.flash(req, "error", e.getMessage());
        }
        redirect(req, res, "/mypage/address");
    }

    private void list(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        long memberId = member(req).getId();
        String field = "address".equals(req.getParameter("field")) ? "address" : "name";
        String q = req.getParameter("q");
        int page = (int) parseLong(req.getParameter("page"), 1);
        req.setAttribute("field", field);
        req.setAttribute("q", q == null ? "" : q);
        req.setAttribute("result", app().addresses.search(memberId, field, q, page));
        render(req, res, "mypage/address");
    }
}
