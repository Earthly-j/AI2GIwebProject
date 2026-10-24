package jp.kurologi.web;

import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jp.kurologi.service.Command;
import jp.kurologi.service.IdCheckCommand;
import jp.kurologi.service.LoginCommand;
import jp.kurologi.service.LogoutCommand;
import jp.kurologi.service.MemberInsert;

/**
 * /member/* 로 들어오는 모든 요청을 받는 컨트롤러
 *
 *   /member/join     회원가입 폼(GET) / 가입 처리(POST)
 *   /member/idCheck  아이디 중복확인(Ajax, JSON 응답)
 *   /member/login    로그인 폼(GET) / 로그인 처리(POST)
 *   /member/logout   로그아웃
 *
 * 흐름 : 컨트롤러(주소 판단) -> Command(서비스, 실제 처리) -> DAO(DB)
 *        Command 가 true 를 돌려주면 JSP 로 forward, false 면 이미 응답을 끝낸 것
 */
@WebServlet("/member/*")
public class MemberController extends HttpServlet {
	private static final long serialVersionUID = 1L;

	// JSP 위치는 여기 한 곳에서만 바꾸면 된다 (폴더를 member 로 만들면 서블릿 주소와 겹치므로 mem 사용)
	private static final String JOIN_PAGE  = "/WEB-INF/views/join/join.jsp";
	private static final String LOGIN_PAGE = "/WEB-INF/views/join/login.jsp";

	public MemberController() {
		super();
	}

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doAction(request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doAction(request, response);
	}

	protected void doAction(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		// 파라미터를 읽기 전에 먼저 지정해야 한글이 깨지지 않는다
		request.setCharacterEncoding("UTF-8");

		String pathInfo = request.getPathInfo();   // /member/join 이면 "/join"
		System.out.println("pathInfo : " + pathInfo);

		// /member 또는 /member/ 로만 들어오면 pathInfo 가 null("/") -> 로그인 화면으로 보낸다
		if (pathInfo == null || "/".equals(pathInfo)) {
			response.sendRedirect(request.getContextPath() + "/member/login");
			return;
		}

		Command command = null;
		String page = null;

		switch (pathInfo) {

		case "/join":
			command = new MemberInsert();
			page = JOIN_PAGE;
			break;

		case "/idCheck":
			command = new IdCheckCommand();
			page = null;            // Ajax 라서 이동할 화면이 없다
			break;

		case "/login":
			command = new LoginCommand();
			page = LOGIN_PAGE;
			break;

		case "/logout":
			command = new LogoutCommand();
			page = null;            // 로그아웃 후 redirect 로 끝난다
			break;

		default:
			// 없는 주소면 command 가 null 이라 NullPointerException(500)이 나던 부분 -> 404 로 처리
			response.sendError(HttpServletResponse.SC_NOT_FOUND);
			return;
		}

		boolean needForward = command.doCommand(request, response);

		if (needForward && page != null) {
			RequestDispatcher rd = request.getRequestDispatcher(page);
			rd.forward(request, response);
		}
	}
}
