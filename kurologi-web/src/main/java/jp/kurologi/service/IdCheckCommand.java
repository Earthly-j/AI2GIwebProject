package jp.kurologi.service;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jp.kurologi.repository.MemberDAO;

/** 아이디 중복확인(Ajax). 화면 이동 없이 {"isDuplicate":true/false} JSON 만 응답한다 */
public class IdCheckCommand implements Command {

	@Override
	public boolean doCommand(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		String loginId = request.getParameter("loginId");
		loginId = (loginId == null) ? "" : loginId.trim();

		// 비어 있으면 DB 에 묻지 않고 "중복(사용 불가)" 으로 취급
		boolean isDuplicate = loginId.isEmpty() || new MemberDAO().idCheck(loginId);

		// 주의: "application/json, charset=utf-8" 처럼 쉼표로 쓰면 안 되고 세미콜론(;)이어야 한다
		response.setContentType("application/json; charset=UTF-8");

		PrintWriter out = response.getWriter();
		out.print("{\"isDuplicate\":" + isDuplicate + "}");

		return false;   // 응답을 직접 끝냈으니 forward 하지 않는다
	}
}
